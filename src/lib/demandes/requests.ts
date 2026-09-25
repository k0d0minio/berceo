import "server-only";

import { and, desc, eq, exists, inArray, isNull, ne, notExists, or, sql } from "drizzle-orm";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalCommunes,
  professionalProfiles,
  users,
  type ApplicationStatus,
} from "@/db";
import { notSuspended } from "@/lib/auth/suspension";
import { familyNotesOfRequests, NO_NOTE, type Note } from "@/lib/avis/ratings";
import { familyCommune } from "@/lib/famille/profile";

import { isChangeable, TIME_ZONE, type RequestStatus } from "./rules";
import type { RequestValues } from "./validation";

/**
 * Every read and write of a care request. The family's functions take her id
 * from the session (the caller's `requireAccess`), never from a form, and
 * answer only for her own rows: another family's id reads as not found.
 *
 * What a professional reads is `cardColumns`: the night, the children, the
 * commune. Never the family's id, name, e-mail, phone or address (D-15); the
 * tests hold the list of columns. Answers and bookings are
 * `src/lib/reservations/`'s; the request's own side of them (the list with her
 * answer, the priority professional, cancelling with its declined answers) is
 * here.
 */

/** The columns a request card shows, to the family and to a professional. */
export const cardColumns = {
  id: careRequests.id,
  urgent: careRequests.urgent,
  nightDate: careRequests.nightDate,
  startTime: careRequests.startTime,
  children: careRequests.children,
  babyAgeValue: careRequests.babyAgeValue,
  babyAgeUnit: careRequests.babyAgeUnit,
  communeIns: careRequests.communeIns,
  postcode: careRequests.postcode,
  locality: careRequests.locality,
  createdAt: careRequests.createdAt,
};

/** The family's own view adds the status. */
const familyColumns = { ...cardColumns, status: careRequests.status };

export type RequestCard = {
  id: string;
  urgent: boolean;
  nightDate: string;
  startTime: string;
  children: "un_bebe" | "jumeaux";
  babyAgeValue: number;
  babyAgeUnit: "semaines" | "mois";
  communeIns: string;
  postcode: string;
  locality: string;
  createdAt: Date;
};

export type FamilyRequest = RequestCard & { status: RequestStatus };

/** The night has not started yet, in Brussels (`date + time` is a local timestamp). */
export const nightAhead = sql`(${careRequests.nightDate} + ${careRequests.startTime}) > (now() AT TIME ZONE ${TIME_ZONE})`;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres' unique_violation: here, a second open request for the same night. */
export function isUniqueViolation(error: unknown): boolean {
  const code = (candidate: unknown) =>
    candidate && typeof candidate === "object" && "code" in candidate
      ? (candidate as { code: unknown }).code
      : undefined;
  const cause = error && typeof error === "object" && "cause" in error ? error.cause : undefined;
  return code(error) === "23505" || code(cause) === "23505";
}

/** Logs a failed write without the error itself: Drizzle's message lists the query's parameters. */
export function logWriteError(what: string, context: Record<string, unknown>, error: unknown): void {
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause;
  console.error(`[demandes] ${what}`, {
    ...context,
    error: error instanceof Error ? error.name : typeof error,
    code: typeof cause?.code === "string" ? cause.code : undefined,
  });
}

// ---------------------------------------------------------------------------
// The family
// ---------------------------------------------------------------------------

export type PublishResult =
  | { ok: true; id: string }
  | { ok: false; reason: "commune" | "doublon" };

/**
 * Publishes a request for the family `userId`. The commune is her profile's,
 * copied now (D-63); without one there is nothing to publish. Published from a
 * professional's profile, it carries her as its priority professional (D-71);
 * the caller has checked she is validated.
 */
export async function publishRequest(
  userId: string,
  values: RequestValues,
  urgent: boolean,
  now: Date,
  priorityProfileId: string | null = null,
): Promise<PublishResult> {
  const commune = await familyCommune(userId);
  if (!commune) return { ok: false, reason: "commune" };

  try {
    const [row] = await db
      .insert(careRequests)
      .values({
        familyUserId: userId,
        urgent,
        ...values,
        communeIns: commune.ins,
        postcode: commune.postcode,
        locality: commune.locality,
        noMedicalConditionAt: now,
        priorityProfileId,
        prioritySentAt: priorityProfileId ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: careRequests.id });
    return { ok: true, id: row.id };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "doublon" };
    throw error;
  }
}

/** Her requests: the ones she can still change first, by night, then the others, latest night first. */
export async function familyRequests(userId: string, now: Date): Promise<FamilyRequest[]> {
  const rows = await db
    .select(familyColumns)
    .from(careRequests)
    .where(eq(careRequests.familyUserId, userId));

  const key = (r: FamilyRequest) => `${r.nightDate}T${r.startTime}`;
  const open = rows.filter((r) => isChangeable(r, now)).sort((a, b) => key(a).localeCompare(key(b)));
  const closed = rows.filter((r) => !isChangeable(r, now)).sort((a, b) => key(b).localeCompare(key(a)));
  return [...open, ...closed];
}

/** One of her requests, or null: an unknown id and another family's id read the same. */
export async function ownRequest(userId: string, id: string): Promise<FamilyRequest | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select(familyColumns)
    .from(careRequests)
    .where(and(eq(careRequests.id, id), eq(careRequests.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

/** Only her own open request whose night has not started changes. */
function changeable(userId: string, id: string) {
  return and(
    eq(careRequests.id, id),
    eq(careRequests.familyUserId, userId),
    eq(careRequests.status, "ouverte"),
    nightAhead,
  );
}

export type ChangeResult = "ok" | "nonModifiable" | "doublon";

/**
 * Saves an edit: the night, the start, the children, the age. Never the
 * commune or the urgency, and never while a validated professional's answer
 * waits on it (D-76, D-85): the lock is held in the UPDATE itself, so an answer
 * given while the form was open still wins.
 */
export async function updateRequest(
  userId: string,
  id: string,
  values: RequestValues,
  now: Date,
): Promise<ChangeResult> {
  if (!UUID.test(id)) return "nonModifiable";
  try {
    const updated = await db
      .update(careRequests)
      .set({ ...values, updatedAt: now })
      .where(
        and(
          changeable(userId, id),
          notExists(
            db
              .select({ id: careRequestApplications.id })
              .from(careRequestApplications)
              .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
              .where(
                and(
                  eq(careRequestApplications.requestId, id),
                  eq(careRequestApplications.status, "en_attente"),
                  eq(professionalProfiles.status, "valide"),
                ),
              ),
          ),
        ),
      )
      .returning({ id: careRequests.id });
    return updated.length > 0 ? "ok" : "nonModifiable";
  } catch (error) {
    if (isUniqueViolation(error)) return "doublon";
    throw error;
  }
}

/**
 * Cancels her open request; it leaves every professional's list at once. The
 * answers still waiting on it are declined in the same transaction, and their
 * ids come back so each professional is told (D-76).
 */
export async function cancelRequest(
  userId: string,
  id: string,
  now: Date,
): Promise<{ result: ChangeResult; declined: string[] }> {
  if (!UUID.test(id)) return { result: "nonModifiable", declined: [] };
  const [cancelled, declined] = await db.batch([
    db
      .update(careRequests)
      .set({ status: "annulee", cancelledAt: now, updatedAt: now })
      .where(changeable(userId, id))
      .returning({ id: careRequests.id }),
    db
      .update(careRequestApplications)
      .set({ status: "non_retenue", updatedAt: now })
      .where(
        and(
          eq(careRequestApplications.requestId, id),
          eq(careRequestApplications.status, "en_attente"),
          exists(
            db
              .select({ id: careRequests.id })
              .from(careRequests)
              .where(
                and(
                  eq(careRequests.id, id),
                  eq(careRequests.familyUserId, userId),
                  eq(careRequests.status, "annulee"),
                ),
              ),
          ),
        ),
      )
      .returning({ id: careRequestApplications.id }),
  ]);
  return {
    result: cancelled.length > 0 ? "ok" : "nonModifiable",
    declined: cancelled.length > 0 ? declined.map((a) => a.id) : [],
  };
}

/**
 * The request side of a cancelled garde (D-110): its booked request becomes
 * `annulee` in the garde's own statement (`src/lib/gardes/`), only when the
 * garde `bookingId` was cancelled at `at` by that statement, so its
 * conversations close at once (D-89) and nothing else changes it.
 */
export function cancelBookedRequestStatement(bookingId: string, at: string) {
  return sql`
    update care_requests r
    set status = 'annulee', cancelled_at = ${at}::timestamptz, updated_at = ${at}::timestamptz
    from bookings b
    where b.id = ${bookingId}
      and b.request_id = r.id
      and b.status = 'annulee'
      and b.cancelled_at = ${at}::timestamptz
      and r.status = 'attribuee'
  `;
}

/**
 * Her live request for `nightDate`, if any: open (D-65: at most one) or
 * already booked again. Republishing a cancelled garde links to it instead,
 * so a night never carries two requests that could each be booked.
 */
export async function liveRequestOn(userId: string, nightDate: string): Promise<string | null> {
  const [row] = await db
    .select({ id: careRequests.id })
    .from(careRequests)
    .where(
      and(
        eq(careRequests.familyUserId, userId),
        eq(careRequests.nightDate, nightDate),
        inArray(careRequests.status, ["ouverte", "attribuee"]),
      ),
    )
    .limit(1);
  return row?.id ?? null;
}

export type PriorityResult = "ok" | "nonModifiable";

/**
 * Sends her open request « en priorité » to a validated professional (D-71):
 * once, never changed. The request stays on everyone else's list as it was.
 */
export async function setPriority(
  userId: string,
  id: string,
  profileId: string,
  now: Date,
): Promise<PriorityResult> {
  if (!UUID.test(id) || !UUID.test(profileId)) return "nonModifiable";
  const updated = await db
    .update(careRequests)
    .set({ priorityProfileId: profileId, prioritySentAt: now, updatedAt: now })
    .where(
      and(
        changeable(userId, id),
        isNull(careRequests.prioritySentAt),
        exists(
          db
            .select({ id: professionalProfiles.id })
            .from(professionalProfiles)
            .where(
              and(
                eq(professionalProfiles.id, profileId),
                eq(professionalProfiles.status, "valide"),
                notSuspended(professionalProfiles.userId),
              ),
            ),
        ),
        reachableBy(profileId),
      ),
    )
    .returning({ id: careRequests.id });
  return updated.length > 0 ? "ok" : "nonModifiable";
}

/**
 * A request this professional could still answer: she was not declined on it
 * and holds no confirmed garde that night (a cancelled one frees it). Sending her anything else in priority would
 * e-mail her a request her list hides (D-70, D-73).
 */
function reachableBy(profileId: string) {
  return and(
    notExists(
      db
        .select({ id: careRequestApplications.id })
        .from(careRequestApplications)
        .where(
          and(
            eq(careRequestApplications.requestId, careRequests.id),
            eq(careRequestApplications.profileId, profileId),
            eq(careRequestApplications.status, "non_retenue"),
          ),
        ),
    ),
    notExists(
      db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.profileId, profileId),
            eq(bookings.nightDate, careRequests.nightDate),
            eq(bookings.status, "confirmee"),
          ),
        ),
    ),
  );
}

/**
 * Her requests that can still be sent in priority to `profileId`: open, ahead,
 * never sent to anyone, and ones this professional could still answer.
 */
export async function priorityCandidates(userId: string, profileId: string): Promise<RequestCard[]> {
  if (!UUID.test(profileId)) return [];
  return db
    .select(cardColumns)
    .from(careRequests)
    .where(
      and(
        eq(careRequests.familyUserId, userId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
        isNull(careRequests.prioritySentAt),
        reachableBy(profileId),
      ),
    )
    .orderBy(careRequests.nightDate, careRequests.startTime);
}

// ---------------------------------------------------------------------------
// The professional
// ---------------------------------------------------------------------------

/**
 * A request on her list: the card, whether it was sent to her in priority, her
 * answer, and the publishing family's note and gardes count (avis-etoiles,
 * D-118), never who the family is.
 */
export type ProfessionalRequest = RequestCard & {
  priority: boolean;
  answer: ApplicationStatus | null;
  family: Note;
};

export type ProfessionalView =
  | { validated: false }
  | { validated: true; nightRateEur: number | null; requests: ProfessionalRequest[] };

/** Her profile: its id, its status and her current rate. */
export async function professionalProfileOf(
  userId: string,
): Promise<{ id: string; status: string; nightRateEur: number | null } | null> {
  const [profile] = await db
    .select({
      id: professionalProfiles.id,
      status: professionalProfiles.status,
      nightRateEur: professionalProfiles.nightRateEur,
    })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

/**
 * Her list: the open requests ahead in the communes she serves, and those sent
 * to her in priority wherever they are (D-71); never one she was declined on,
 * nor one on a night she is booked (D-73). Priority first, then urgent, then
 * newest. Only a validated profile sees any (D-5, D-10). The rules module's
 * `isOnHerList` says the same in words.
 */
export async function professionalRequests(userId: string): Promise<ProfessionalView> {
  const profile = await professionalProfileOf(userId);
  if (!profile || profile.status !== "valide") return { validated: false };

  const priority = sql<boolean>`coalesce(${careRequests.priorityProfileId} = ${profile.id}, false)`;
  const requests = await db
    .select({ ...cardColumns, priority, answer: careRequestApplications.status })
    .from(careRequests)
    .leftJoin(
      careRequestApplications,
      and(
        eq(careRequestApplications.requestId, careRequests.id),
        eq(careRequestApplications.profileId, profile.id),
      ),
    )
    .where(
      and(
        eq(careRequests.status, "ouverte"),
        nightAhead,
        or(
          eq(careRequests.priorityProfileId, profile.id),
          inArray(
            careRequests.communeIns,
            db
              .select({ ins: professionalCommunes.communeIns })
              .from(professionalCommunes)
              .where(eq(professionalCommunes.profileId, profile.id)),
          ),
        ),
        or(isNull(careRequestApplications.status), ne(careRequestApplications.status, "non_retenue")),
        notExists(
          db
            .select({ id: bookings.id })
            .from(bookings)
            .where(
              and(
                eq(bookings.profileId, profile.id),
                eq(bookings.nightDate, careRequests.nightDate),
                eq(bookings.status, "confirmee"),
              ),
            ),
        ),
      ),
    )
    .orderBy(desc(priority), desc(careRequests.urgent), desc(careRequests.createdAt));

  const notes = await familyNotesOfRequests(requests.map((request) => request.id));
  return {
    validated: true,
    nightRateEur: profile.nightRateEur,
    requests: requests.map((request) => ({ ...request, family: notes.get(request.id) ?? NO_NOTE })),
  };
}

export type Recipient = { profileId: string; email: string; firstName: string; communeIns: string };

/**
 * Every validated professional serving one of `communes`, once per commune she
 * serves there; never a suspended one, who can answer nothing (D-134).
 */
export async function professionalsServing(communes: string[]): Promise<Recipient[]> {
  if (communes.length === 0) return [];
  return db
    .select({
      profileId: professionalProfiles.id,
      email: users.email,
      firstName: users.firstName,
      communeIns: professionalCommunes.communeIns,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .innerJoin(professionalCommunes, eq(professionalCommunes.profileId, professionalProfiles.id))
    .where(
      and(
        eq(professionalProfiles.status, "valide"),
        isNull(users.suspendedAt),
        inArray(professionalCommunes.communeIns, communes),
      ),
    );
}

export type NoticeRequest = RequestCard & {
  status: RequestStatus;
  priorityProfileId: string | null;
  republishCount: number;
};

/** A request by id, whoever published it, for the e-mails about it. Card columns only. */
export async function requestForNotice(id: string): Promise<NoticeRequest | null> {
  const [row] = await db
    .select({
      ...familyColumns,
      priorityProfileId: careRequests.priorityProfileId,
      republishCount: careRequests.republishCount,
    })
    .from(careRequests)
    .where(eq(careRequests.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * The professionals declined on these requests (`non_retenue`, D-70): they no
 * longer see them, and a re-announcement skips them. `<request id>:<profile id>`.
 */
export async function declinedPairs(requestIds: string[]): Promise<Set<string>> {
  if (requestIds.length === 0) return new Set();
  const rows = await db
    .select({ requestId: careRequestApplications.requestId, profileId: careRequestApplications.profileId })
    .from(careRequestApplications)
    .where(
      and(
        inArray(careRequestApplications.requestId, requestIds),
        eq(careRequestApplications.status, "non_retenue"),
      ),
    );
  return new Set(rows.map((r) => `${r.requestId}:${r.profileId}`));
}

/**
 * Whether a digest already left on `day` (`YYYY-MM-DD`, Brussels): the day's
 * requests it carried hold that day in `digest_sent_at`. One digest a day at
 * most, whatever calls the route later that evening (D-61).
 */
export async function digestSentOn(day: string): Promise<boolean> {
  const [row] = await db
    .select({ id: careRequests.id })
    .from(careRequests)
    .where(sql`(${careRequests.digestSentAt} AT TIME ZONE ${TIME_ZONE})::date = ${day}::date`)
    .limit(1);
  return Boolean(row);
}

/**
 * Claims every normal request no digest has carried yet, or republished since
 * its digest (D-70), open and ahead: marks it and returns it. One UPDATE, so
 * two calls racing never claim the same request twice.
 */
export async function claimDigestRequests(now: Date): Promise<RequestCard[]> {
  return db
    .update(careRequests)
    .set({ digestSentAt: now })
    .where(
      and(
        sql`(${careRequests.digestSentAt} IS NULL OR ${careRequests.republishedAt} > ${careRequests.digestSentAt})`,
        eq(careRequests.urgent, false),
        eq(careRequests.status, "ouverte"),
        nightAhead,
      ),
    )
    .returning(cardColumns);
}
