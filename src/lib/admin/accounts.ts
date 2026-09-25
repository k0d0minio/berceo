import "server-only";

import { and, count, desc, eq, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { alias, type AnyPgColumn } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalCommunes,
  professionalDocuments,
  professionalProfiles,
  users,
  type AdminJournalEntry,
  type Profession,
  type ProfileStatus,
  type User,
  type UserRole,
} from "@/db";
import { deletedAtExactly, suspendedAtExactly } from "@/lib/auth/suspension";
import { noteOfUser, type Note } from "@/lib/avis/ratings";
import { communeName } from "@/lib/communes";
import { NIGHT_HOURS, TIME_ZONE } from "@/lib/demandes/rules";
import { suspensionCancelsRequests, suspensionDeclinesAnswers } from "@/lib/demandes/requests";
import { deletionForgetsAvailability } from "@/lib/disponibilites/nights";
import { deleteObject } from "@/lib/documents/storage";
import { sendEmail } from "@/lib/email/send";
import { contactEmail } from "@/lib/email/templates";
import { deletionForgetsFamilyProfile, familyCommune } from "@/lib/famille/profile";
import { suspensionWithdrawsAnswers } from "@/lib/reservations/answers";

import { fullName, journalFor, journalInsert, journalInsertIf, type Person } from "./journal";
import {
  ANONYMISED,
  FOLD_FROM,
  FOLD_TO,
  LIST_PAGE_SIZE,
  UUID,
  anonymisedEmail,
  checkContact,
  confirmsLastName,
  contactParagraphs,
  contactRefusal,
  deleteRefusal,
  reactivateRefusal,
  searchTerms,
  suspendRefusal,
  type AccountRefusal,
  type ContactError,
} from "./rules";

/**
 * The founders' accounts (back-office-admin, D-134 to D-138): the search, the
 * profile view, and the four acts on an account. The rules are in ./rules;
 * each write holds them again in its own SQL, and each act and its journal
 * entry commit together. The requests, answers, family profile and nights a
 * suspension or a deletion touches are written by the statements their own
 * modules export, inside this module's batch.
 */

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export type AccountRow = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "phone" | "role" | "suspendedAt" | "createdAt"
>;

const rowColumns = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  phone: users.phone,
  role: users.role,
  suspendedAt: users.suspendedAt,
  createdAt: users.createdAt,
};

function folded(value: SQL | AnyPgColumn): SQL {
  return sql`translate(lower(${value}), ${FOLD_FROM}, ${FOLD_TO})`;
}

/** `%text%` for LIKE, with LIKE's own characters taken literally. */
function contains(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * The accounts the search box finds (exported for its test): first name, last
 * name, « prénom nom » and e-mail, folded; the phone by its digits. A deleted
 * account is never found.
 */
export function searchCondition(raw: string | undefined): SQL | undefined {
  const terms = searchTerms(raw);
  const alive = isNull(users.deletedAt);
  if (!terms) return alive;
  const text = contains(terms.text);
  const matches = [
    sql`${folded(users.firstName)} like ${text}`,
    sql`${folded(users.lastName)} like ${text}`,
    sql`${folded(sql`${users.firstName} || ' ' || ${users.lastName}`)} like ${text}`,
    sql`lower(${users.email}) like ${text}`,
  ];
  if (terms.digits) {
    matches.push(sql`regexp_replace(coalesce(${users.phone}, ''), '\\D', '', 'g') like ${contains(terms.digits)}`);
  }
  return and(alive, or(...matches));
}

/** One page of the search, the newest accounts first. */
export async function searchAccounts(
  raw: string | undefined,
  page: number,
): Promise<{ rows: AccountRow[]; pages: number }> {
  const where = searchCondition(raw);
  const [rows, [total]] = await Promise.all([
    db
      .select(rowColumns)
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(LIST_PAGE_SIZE)
      .offset((page - 1) * LIST_PAGE_SIZE),
    db.select({ n: count() }).from(users).where(where),
  ]);
  return { rows, pages: Math.max(1, Math.ceil(total.n / LIST_PAGE_SIZE)) };
}

const localNow = sql`(now() AT TIME ZONE ${TIME_ZONE})`;

/** A confirmed garde whose night has not ended: à venir or en cours. */
const gardeAhead = sql`(${bookings.status} = 'confirmee' AND (${careRequests.nightDate} + ${careRequests.startTime} + make_interval(hours => ${NIGHT_HOURS}::int)) > ${localNow})`;

/** The bookings this account is on, on either side. */
function onEitherSide(userId: string): SQL {
  return sql`(${bookings.familyUserId} = ${userId} OR ${bookings.profileId} IN (select id from professional_profiles where user_id = ${userId}))`;
}

const otherUser = alias(users, "other_user");
const professionalUser = alias(users, "professional_user");

export type UpcomingGarde = {
  bookingId: string;
  nightDate: string;
  startTime: string;
  /** The other side's name and phone, for the founders to call (D-134). */
  other: { name: string; phone: string | null };
};

/** Her gardes still to come or under way, on either side, nearest first. */
export async function upcomingGardes(userId: string): Promise<UpcomingGarde[]> {
  if (!UUID.test(userId)) return [];
  const rows = await db
    .select({
      bookingId: bookings.id,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      familyUserId: bookings.familyUserId,
      familyFirst: otherUser.firstName,
      familyLast: otherUser.lastName,
      familyPhone: otherUser.phone,
      professionalFirst: professionalUser.firstName,
      professionalLast: professionalUser.lastName,
      professionalPhone: professionalUser.phone,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(otherUser, eq(otherUser.id, bookings.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(and(onEitherSide(userId), gardeAhead))
    .orderBy(careRequests.nightDate, careRequests.startTime);
  return rows.map((row) => {
    const isFamily = row.familyUserId === userId;
    return {
      bookingId: row.bookingId,
      nightDate: row.nightDate,
      startTime: row.startTime,
      other: isFamily
        ? { name: fullName({ firstName: row.professionalFirst, lastName: row.professionalLast }), phone: row.professionalPhone }
        : { name: fullName({ firstName: row.familyFirst, lastName: row.familyLast }), phone: row.familyPhone },
    };
  });
}

export type AccountView = {
  user: Pick<
    User,
    | "id"
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "role"
    | "createdAt"
    | "suspendedAt"
    | "deletedAt"
  >;
  /** A family's commune, never her address (D-15). */
  commune: string | null;
  professional: {
    profileId: string;
    status: ProfileStatus;
    profession: Profession | null;
    nightRateEur: number | null;
    communes: string[];
    note: Note;
  } | null;
  counts: { requests: number; answers: number; bookings: number };
  upcoming: UpcomingGarde[];
  journal: AdminJournalEntry[];
};

/** « Voir le profil »: one account as the founders read it, or null. */
export async function accountView(userId: string): Promise<AccountView | null> {
  if (!UUID.test(userId)) return null;
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      suspendedAt: users.suspendedAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;

  const [profile] =
    user.role === "professionnel"
      ? await db
          .select({
            profileId: professionalProfiles.id,
            status: professionalProfiles.status,
            profession: professionalProfiles.profession,
            nightRateEur: professionalProfiles.nightRateEur,
          })
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, userId))
          .limit(1)
      : [];

  const [commune, communes, note, [requests], [answers], [booked], upcoming, journal] = await Promise.all([
    user.role === "parent" && !user.deletedAt ? familyCommune(userId) : Promise.resolve(null),
    profile
      ? db
          .select({ ins: professionalCommunes.communeIns })
          .from(professionalCommunes)
          .where(eq(professionalCommunes.profileId, profile.profileId))
      : Promise.resolve([]),
    profile ? noteOfUser(userId) : Promise.resolve(null),
    db.select({ n: count() }).from(careRequests).where(eq(careRequests.familyUserId, userId)),
    profile
      ? db
          .select({ n: count() })
          .from(careRequestApplications)
          .where(eq(careRequestApplications.profileId, profile.profileId))
      : Promise.resolve([{ n: 0 }]),
    db.select({ n: count() }).from(bookings).where(onEitherSide(userId)),
    upcomingGardes(userId),
    journalFor(userId),
  ]);

  return {
    user,
    commune: commune ? `${commune.postcode} ${commune.locality}` : null,
    professional:
      profile && note
        ? {
            ...profile,
            communes: communes.map((c) => communeName(c.ins) ?? c.ins),
            note,
          }
        : null,
    counts: { requests: requests.n, answers: answers.n, bookings: booked.n },
    upcoming,
    journal,
  };
}

// ---------------------------------------------------------------------------
// The acts
// ---------------------------------------------------------------------------

type Facts = {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  suspendedAt: Date | null;
  deletedAt: Date | null;
};

async function facts(userId: string): Promise<Facts | null> {
  if (!UUID.test(userId)) return null;
  const [row] = await db
    .select({
      id: users.id,
      authUserId: users.authUserId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      suspendedAt: users.suspendedAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

export type ActResult =
  | { ok: true }
  | { ok: false; error: AccountRefusal | "introuvable" | "generique" };

export type SuspendResult = (ActResult & { ok: false }) | { ok: true; declined: string[] };

/**
 * « Suspendre le compte » (D-134), in one transaction: the account marked
 * suspended, her waiting answers withdrawn, her open requests cancelled and
 * the answers on them declined, and the journal entry; each statement takes
 * effect only if the first did. Her confirmed gardes are not touched. The ids
 * of the declined answers come back so each professional is told; her open
 * sessions are ended after the commit (`currentUser()` refuses her anyway).
 */
export async function suspendAccount(userId: string, admin: Person, now: Date): Promise<SuspendResult> {
  const account = await facts(userId);
  if (!account) return { ok: false, error: "introuvable" };
  const refused = suspendRefusal(account);
  if (refused) return { ok: false, error: refused };

  let declined: string[];
  try {
    const [suspended, , , declinedRows] = await db.batch([
      db
        .update(users)
        .set({ suspendedAt: now, suspendedBy: admin.id, updatedAt: now })
        .where(
          and(eq(users.id, userId), isNull(users.suspendedAt), isNull(users.deletedAt), sql`${users.role} <> 'admin'`),
        )
        .returning({ id: users.id }),
      suspensionWithdrawsAnswers(userId, now),
      suspensionCancelsRequests(userId, now),
      suspensionDeclinesAnswers(userId, now),
      journalInsertIf(
        { action: "compte_suspendu", subject: { id: userId, name: fullName(account) }, admin, at: now },
        suspendedAtExactly(userId, now),
      ),
    ]);
    if (suspended.length === 0) return { ok: false, error: "dejaSuspendu" };
    declined = declinedRows.map((row) => row.id);
  } catch (error) {
    console.error("[admin] account not suspended", { userId, error });
    return { ok: false, error: "generique" };
  }

  await endSessions(account.authUserId);
  return { ok: true, declined };
}

/**
 * Her Neon Auth sessions, deleted where Neon Auth keeps them. Best effort: the
 * suspension stands without it, since every page reads her row first.
 */
async function endSessions(authUserId: string): Promise<void> {
  try {
    await db.execute(sql`delete from neon_auth.session where "userId"::text = ${authUserId}`);
  } catch (error) {
    console.error("[admin] sessions not ended after a suspension", { error });
  }
}

/** « Réactiver le compte » (D-135): the suspension lifted and the entry written, in one statement. */
export async function reactivateAccount(userId: string, admin: Person, now: Date): Promise<ActResult> {
  const account = await facts(userId);
  if (!account) return { ok: false, error: "introuvable" };
  const refused = reactivateRefusal(account);
  if (refused) return { ok: false, error: refused };

  const at = now.toISOString();
  try {
    const result = await db.execute<{ id: string }>(sql`
      with lifted as (
        update ${users}
        set suspended_at = null, suspended_by = null, updated_at = ${at}::timestamptz
        where id = ${userId} and suspended_at is not null and deleted_at is null and role <> 'admin'
        returning id
      )
      insert into admin_journal (occurred_at, action, subject_user_id, subject_name, admin_user_id, admin_name)
      select ${at}::timestamptz, 'compte_reactive'::admin_action, lifted.id, ${fullName(account)}::text,
             ${admin.id}::uuid, ${admin.name}::text
      from lifted
      returning id
    `);
    return result.rows.length > 0 ? { ok: true } : { ok: false, error: "nonSuspendu" };
  } catch (error) {
    console.error("[admin] account not reactivated", { userId, error });
    return { ok: false, error: "generique" };
  }
}

export type DeleteResult = ActResult | { ok: false; error: "nomDifferent" };

/**
 * « Supprimer le compte » (D-136, D-137): anonymisation, never a removed row.
 * One transaction: the row renamed « Compte supprimé » with a dead address and
 * no phone, her family profile, her profile's personal fields, her communes and
 * nights gone, her Neon Auth identity deleted (its sessions and accounts go
 * with it), and the journal entry under the name she had. Then her files leave
 * the bucket, each object before its row; whatever fails there stays listed
 * and the daily purge finishes it.
 */
export async function deleteAccount(
  userId: string,
  typedLastName: unknown,
  admin: Person,
  now: Date,
): Promise<DeleteResult> {
  const account = await facts(userId);
  if (!account) return { ok: false, error: "introuvable" };
  const upcoming = await upcomingGardes(userId);
  const refused = deleteRefusal(account, upcoming.length);
  if (refused) return { ok: false, error: refused };
  if (!confirmsLastName(typedLastName, account.lastName)) return { ok: false, error: "nomDifferent" };

  const deleted = deletedAtExactly(userId, now);
  const ownProfile = db
    .select({ id: professionalProfiles.id })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId));
  try {
    const [anonymised] = await db.batch([
      db
        .update(users)
        .set({
          firstName: ANONYMISED.firstName,
          lastName: ANONYMISED.lastName,
          email: anonymisedEmail(userId),
          phone: null,
          deletedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(users.id, userId),
            sql`${users.suspendedAt} is not null`,
            isNull(users.deletedAt),
            sql`${users.role} <> 'admin'`,
            sql`not exists (
              select 1 from ${bookings} join ${careRequests} on ${careRequests.id} = ${bookings.requestId}
              where ${onEitherSide(userId)} and ${gardeAhead}
            )`,
          ),
        )
        .returning({ id: users.id }),
      deletionForgetsFamilyProfile(userId, now),
      db
        .update(professionalProfiles)
        .set({
          bio: null,
          inamiNumber: null,
          specialisations: [],
          experience: null,
          reviewReason: null,
          updatedAt: now,
        })
        .where(and(eq(professionalProfiles.userId, userId), deleted)),
      db.delete(professionalCommunes).where(and(inArray(professionalCommunes.profileId, ownProfile), deleted)),
      deletionForgetsAvailability(userId, now),
      db.execute(sql`delete from neon_auth."user" where id::text = ${account.authUserId} and ${deleted}`),
      journalInsertIf(
        { action: "compte_supprime", subject: { id: userId, name: fullName(account) }, admin, at: now },
        deleted,
      ),
    ]);
    if (anonymised.length === 0) return { ok: false, error: "generique" };
  } catch (error) {
    console.error("[admin] account not deleted", { userId, error });
    return { ok: false, error: "generique" };
  }

  await forgetFiles(userId);
  return { ok: true };
}

/**
 * A deleted account's files out of the bucket (D-41: a file lives only while
 * the account does), each object before its row, as the purge does. A failure
 * leaves the row, and the daily purge, which lists deleted accounts too,
 * finishes it.
 */
async function forgetFiles(userId: string): Promise<void> {
  const files = await db
    .select({ id: professionalDocuments.id, storageKey: professionalDocuments.storageKey })
    .from(professionalDocuments)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, professionalDocuments.profileId))
    .where(eq(professionalProfiles.userId, userId));
  for (const file of files) {
    try {
      await deleteObject(file.storageKey);
      await db.delete(professionalDocuments).where(eq(professionalDocuments.id, file.id));
    } catch (error) {
      console.error("[admin] deleted account's file left for the purge", { userId, fileId: file.id, error });
    }
  }
}

export type ContactResult =
  | { ok: true }
  | { ok: false; error: AccountRefusal | "introuvable" | "envoi" }
  | { ok: false; errors: Partial<Record<"subject" | "message", ContactError>> };

/**
 * « Contacter l'utilisateur » (D-138): her e-mail from Berceo's sender, an
 * answer to the founder's own address. The entry, with the subject only, is
 * written once the e-mail has left; a refused send writes nothing.
 */
export async function contactAccount(
  userId: string,
  input: { subject?: unknown; message?: unknown },
  admin: Person & { email: string },
  siteUrl: string,
  sendId: string,
): Promise<ContactResult> {
  const account = await facts(userId);
  if (!account) return { ok: false, error: "introuvable" };
  const refused = contactRefusal(account);
  if (refused) return { ok: false, error: refused };
  const checked = checkContact(input);
  if (!checked.ok) return { ok: false, errors: checked.errors };

  const email = contactEmail({
    siteUrl,
    prenom: account.firstName,
    subject: checked.value.subject,
    paragraphs: contactParagraphs(checked.value.message),
  });
  try {
    await sendEmail(account.email, email, `contact-${sendId}`, { replyTo: admin.email });
  } catch (error) {
    console.error("[admin] contact e-mail not sent", { userId, error });
    return { ok: false, error: "envoi" };
  }

  try {
    await journalInsert({
      action: "utilisateur_contacte",
      subject: { id: userId, name: fullName(account) },
      admin: { id: admin.id, name: admin.name },
      detail: checked.value.subject,
    });
  } catch (error) {
    // The e-mail left: say so rather than invite a second send.
    console.error("[admin] contact e-mail sent but not journaled", { userId, error });
  }
  return { ok: true };
}
