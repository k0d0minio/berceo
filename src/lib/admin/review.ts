import "server-only";

import { asc, count, eq, inArray, sql } from "drizzle-orm";

import {
  adminJournal,
  appSettings,
  db,
  professionalDocuments,
  professionalProfiles,
  users,
  type DocumentKind,
  type Profession,
  type ProfileStatus,
  type User,
} from "@/db";
import { SPACES } from "@/lib/auth/routing";
import { sendEmail } from "@/lib/email/send";
import {
  complementRequestedEmail,
  profileRefusedEmail,
  profileValidatedEmail,
  type RenderedEmail,
} from "@/lib/email/templates";
import { STUDENTS_ADMITTED, studentsAdmitted } from "@/lib/settings";

import { fullName } from "./journal";
import {
  DECISION_ACTION,
  DECISION_STATUS,
  REVIEWABLE,
  byOldestSubmission,
  checkReason,
  needsReason,
  refuseDecision,
  type Decision,
  type DecisionRefusal,
  type ReasonError,
} from "./rules";

/**
 * The founders' review (verification-back-office): the queue, and the three
 * decisions. The rules are in ./rules; this file reads and writes.
 */

// ---------------------------------------------------------------------------
// The queue
// ---------------------------------------------------------------------------

export type QueueRow = {
  profileId: string;
  firstName: string;
  lastName: string;
  status: ProfileStatus;
  profession: Profession | null;
  reviewReason: string | null;
  submittedAt: Date | null;
  files: Partial<Record<DocumentKind, number>>;
};

/** Every waiting file and every file asked for a complément, oldest first. */
export async function loadQueue(): Promise<QueueRow[]> {
  const rows = await db
    .select({
      profileId: professionalProfiles.id,
      firstName: users.firstName,
      lastName: users.lastName,
      status: professionalProfiles.status,
      profession: professionalProfiles.profession,
      reviewReason: professionalProfiles.reviewReason,
      submittedAt: professionalProfiles.submittedAt,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .where(inArray(professionalProfiles.status, [...REVIEWABLE]))
    .orderBy(asc(professionalProfiles.submittedAt));
  if (rows.length === 0) return [];

  const counts = await db
    .select({ profileId: professionalDocuments.profileId, kind: professionalDocuments.kind, n: count() })
    .from(professionalDocuments)
    .where(inArray(professionalDocuments.profileId, rows.map((r) => r.profileId)))
    .groupBy(professionalDocuments.profileId, professionalDocuments.kind);

  return rows
    .map((row) => {
      const files: Partial<Record<DocumentKind, number>> = {};
      for (const c of counts) if (c.profileId === row.profileId) files[c.kind] = c.n;
      return { ...row, files };
    })
    .sort(byOldestSubmission);
}

// ---------------------------------------------------------------------------
// The decisions
// ---------------------------------------------------------------------------

export type DecisionInput = {
  profileId: string;
  decision: Decision;
  reason: unknown;
  /**
   * What the founder's page showed: the file's state and its last decision.
   * The decision applies only if both are still true, so a second founder, or
   * a stale page, changes nothing.
   */
  expected: { status: ProfileStatus; reviewedAt: string | null };
};

export type DecisionResult =
  | { ok: true; email: "envoye" | "echec" }
  | { ok: false; error: DecisionRefusal | ReasonError | "generique" };

/**
 * Takes one decision on one file. The state change and its journal entry are
 * one statement, so both happen or neither does; the e-mail leaves after, once
 * per decision (Resend's idempotency key is the journal entry). A refused
 * e-mail leaves the decision standing and says so. The caller has checked the
 * role.
 */
export async function decide(input: DecisionInput, admin: User, siteUrl: string): Promise<DecisionResult> {
  const { profileId, decision, expected } = input;

  let reason: string | null = null;
  if (needsReason(decision)) {
    const checked = checkReason(input.reason);
    if (!checked.ok) return { ok: false, error: checked.error };
    reason = checked.value;
  }

  const [file] = await db
    .select({
      status: professionalProfiles.status,
      profession: professionalProfiles.profession,
      reviewedAt: professionalProfiles.reviewedAt,
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .where(eq(professionalProfiles.id, profileId))
    .limit(1);
  if (!file) return { ok: false, error: "generique" };

  if (file.status !== expected.status || (file.reviewedAt?.toISOString() ?? null) !== expected.reviewedAt) {
    return { ok: false, error: "traite" };
  }
  const refused = refuseDecision(decision, file, await studentsAdmitted());
  if (refused) return { ok: false, error: refused };

  const now = new Date().toISOString();
  const target = DECISION_STATUS[decision];
  const action = DECISION_ACTION[decision];
  const subjectName = fullName(file);
  let journalId: string | undefined;
  try {
    // The same conditions again, inside the statement: the file has not moved since
    // the page was read, and a student is validated only while the switch is on.
    const result = await db.execute<{ id: string }>(sql`
      with decided as (
        update ${professionalProfiles}
        set status = ${target}::profile_status, review_reason = ${reason}::text,
            reviewed_at = ${now}::timestamptz, updated_at = ${now}::timestamptz
        where id = ${profileId}::uuid
          and status = ${expected.status}::profile_status
          and reviewed_at is not distinct from ${expected.reviewedAt}::timestamptz
          and (${decision}::text <> 'valider'
            or profession is distinct from 'etudiante_sage_femme'
            or exists (select 1 from ${appSettings} where key = ${STUDENTS_ADMITTED} and value = 'true'::jsonb))
        returning user_id
      )
      insert into ${adminJournal} (occurred_at, action, subject_user_id, subject_name, admin_user_id, admin_name, detail)
      select ${now}::timestamptz, ${action}::admin_action, decided.user_id, ${subjectName}::text,
             ${admin.id}::uuid, ${fullName(admin)}::text, ${reason}::text
      from decided
      returning id
    `);
    journalId = result.rows[0]?.id;
  } catch (error) {
    console.error("[admin] decision not recorded", { profileId, decision, error });
    return { ok: false, error: "generique" };
  }
  if (!journalId) return { ok: false, error: "traite" };

  const space = `${siteUrl}${SPACES.professionnel}`;
  const email: RenderedEmail =
    decision === "valider"
      ? profileValidatedEmail({ siteUrl, prenom: file.firstName, url: space })
      : decision === "complement"
        ? complementRequestedEmail({ siteUrl, prenom: file.firstName, reason: reason ?? "", url: `${space}/profil` })
        : profileRefusedEmail({ siteUrl, prenom: file.firstName, reason: reason ?? "", url: space });

  try {
    await sendEmail(file.email, email, `decision-${journalId}`);
  } catch (error) {
    console.error("[admin] decision e-mail not sent", { profileId, decision, journalId, error });
    return { ok: true, email: "echec" };
  }
  return { ok: true, email: "envoye" };
}

