import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, exists, inArray, isNull, ne, notExists, or, sql } from "drizzle-orm";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalProfiles,
  professionalReach,
  users,
  type ApplicationStatus,
} from "@/db";
import { notSuspended, suspendedAtExactly } from "@/lib/auth/suspension";
import { familyNotesOfRequests, NO_NOTE, type Note } from "@/lib/avis/ratings";
import type { Locality } from "@/lib/communes";
import { familyCommune } from "@/lib/famille/profile";
import { requestAddressValues } from "@/lib/famille/request-address";
import type { Address } from "@/lib/famille/validation";

import { isChangeable, TIME_ZONE, type ChildAge, type Feeding, type RequestStatus } from "./rules";
import type { RequestValues, SeriesNight } from "./validation";

/**
 * Every read and write of a care request. The family's functions take her id
 * from the session (the caller's `requireAccess`), never from a form, and
 * answer only for her own rows: another family's id reads as not found.
 *
 * What a professional reads is `cardColumns`: the night (its extra hours too), the children,
 * their feeding, the commune. Never the family's id, name, e-mail, phone or address (D-15); the
 * tests hold the list of columns. The night's address is written here through
 * `requestAddressValues` and read only by `src/lib/famille/`. The family's optional reason
 * (demande-motif-facultatif) is no card column either: her own request, the professional's
 * request page (`professionalRequest`) and the founders' list read it, never a card, the
 * digest or an e-mail. Answers and bookings are
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
  extraHours: careRequests.extraHours,
  childAges: careRequests.childAges,
  feedings: careRequests.feedings,
  communeIns: careRequests.communeIns,
  postcode: careRequests.postcode,
  locality: careRequests.locality,
  createdAt: careRequests.createdAt,
};

/** The family's own view adds the status. The e-mails read these too: never the reason. */
export const familyColumns = { ...cardColumns, status: careRequests.status };

export type RequestCard = {
  id: string;
  urgent: boolean;
  nightDate: string;
  startTime: string;
  extraHours: number;
  /** One to four children, each with its own age (JAM-303). */
  childAges: readonly ChildAge[];
  /** Empty on a request published before the field (demande-enfants-alimentation). */
  feedings: readonly Feeding[];
  communeIns: string;
  postcode: string;
  locality: string;
  createdAt: Date;
};

export type FamilyRequest = RequestCard & { status: RequestStatus };

/**
 * One of her requests in « Mes demandes », with the series it belongs to
 * (demande-nuits-regulieres), and whether that series is one request (JAM-302).
 */
export type ListedRequest = FamilyRequest & { seriesId: string | null; seriesWhole: boolean };

/** A request the digest carries, with its series: a series is one line (demande-nuits-regulieres). */
export type DigestRequest = RequestCard & { seriesId: string | null };

/** One of her requests, with her optional reason (demande-motif-facultatif) and its series (JAM-302). */
export type OwnRequest = FamilyRequest & { reason: string | null; seriesId: string | null; seriesWhole: boolean };

/** The night has not started yet, in Brussels (`date + time` is a local timestamp). */
export const nightAhead = sql`(${careRequests.nightDate} + ${careRequests.startTime}) > (now() AT TIME ZONE ${TIME_ZONE})`;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres' unique_violation: here, a second open or booked request for the same night (D-156). */
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

/** Where a published night takes place: a commune of the list, and its address. */
export type PublishPlace = {
  locality: Pick<Locality, "ins" | "postcode" | "locality">;
  address: Address | null;
};

/**
 * Publishes a request for the family `userId` at `place`: the form's commune
 * and address, prefilled from her profile (demande-adresse-de-la-nuit). Without
 * a profile there is nothing to publish. Published from a professional's
 * profile, it carries her as its priority professional (D-71); the caller has
 * checked she is validated. A republished garde copies its request's feedings,
 * address and reason, empty or null when that request predates the field.
 */
export async function publishRequest(
  userId: string,
  values: RequestValues,
  place: PublishPlace,
  urgent: boolean,
  now: Date,
  priorityProfileId: string | null = null,
): Promise<PublishResult> {
  if (!(await familyCommune(userId))) return { ok: false, reason: "commune" };

  try {
    const [row] = await db
      .insert(careRequests)
      .values(requestRow(userId, values, place, urgent, now, priorityProfileId))
      .returning({ id: careRequests.id });
    return { ok: true, id: row.id };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "doublon" };
    throw error;
  }
}

/** The row a publication inserts: the form's values, its place, the tick's moment and the priority. */
function requestRow(
  userId: string,
  values: RequestValues,
  place: PublishPlace,
  urgent: boolean,
  now: Date,
  priorityProfileId: string | null,
) {
  return {
    familyUserId: userId,
    urgent,
    ...values,
    communeIns: place.locality.ins,
    postcode: place.locality.postcode,
    locality: place.locality.locality,
    ...requestAddressValues(place.address),
    noMedicalConditionAt: now,
    priorityProfileId,
    prioritySentAt: priorityProfileId ? now : null,
    createdAt: now,
    updatedAt: now,
  };
}

export type SeriesResult =
  | { ok: true; seriesId: string; ids: string[] }
  | { ok: false; reason: "commune" }
  /** The nights she already holds an open or booked request for (D-65, D-156). */
  | { ok: false; reason: "doublon"; nights: string[] };

/**
 * Publishes « Nuits régulières » (demande-nuits-regulieres): one normal request
 * per night, every one with the same children, feedings, place and reason, its
 * own start and its own extra hours (JAM-303), and one new series id, in one
 * INSERT, so the nights are published together or not at all. The series is
 * one request (JAM-302): a professional answers all its nights or none, and the
 * family books her for all of them with one fee. A night she
 * already holds refuses the whole series and is named: the unique index still
 * decides when a request for it was written meanwhile. Published from a
 * professional's profile, every night goes to her in priority (D-71).
 */
export async function publishSeries(
  userId: string,
  values: RequestValues,
  seriesNights: readonly SeriesNight[],
  place: PublishPlace,
  now: Date,
  priorityProfileId: string | null = null,
): Promise<SeriesResult> {
  if (!(await familyCommune(userId))) return { ok: false, reason: "commune" };

  const nights = seriesNights.map((night) => night.nightDate);
  const held = await liveNightsAmong(userId, nights);
  if (held.length > 0) return { ok: false, reason: "doublon", nights: held };

  const seriesId = randomUUID();
  try {
    const rows = await db
      .insert(careRequests)
      .values(
        // Each night's own start and extra hours: never the first night's.
        seriesNights.map((night) => ({
          ...requestRow(userId, { ...values, ...night }, place, false, now, priorityProfileId),
          seriesId,
          seriesWhole: true,
        })),
      )
      .returning({ id: careRequests.id, nightDate: careRequests.nightDate });
    const ids = rows.sort((a, b) => a.nightDate.localeCompare(b.nightDate)).map((row) => row.id);
    return { ok: true, seriesId, ids };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, reason: "doublon", nights: await liveNightsAmong(userId, nights) };
    }
    throw error;
  }
}

/** The nights among `nights` she already holds an open or booked request for, in order. */
async function liveNightsAmong(userId: string, nights: string[]): Promise<string[]> {
  const rows = await db
    .select({ nightDate: careRequests.nightDate })
    .from(careRequests)
    .where(
      and(
        eq(careRequests.familyUserId, userId),
        inArray(careRequests.nightDate, nights),
        inArray(careRequests.status, ["ouverte", "attribuee"]),
      ),
    );
  return rows.map((row) => row.nightDate).sort();
}

/**
 * Her requests: the ones she can still change first, by night, then the
 * others, latest night first. Each carries its series id, so « Mes demandes »
 * groups regular nights (demande-nuits-regulieres).
 */
export async function familyRequests(userId: string, now: Date): Promise<ListedRequest[]> {
  const rows = await db
    .select({ ...familyColumns, seriesId: careRequests.seriesId, seriesWhole: careRequests.seriesWhole })
    .from(careRequests)
    .where(eq(careRequests.familyUserId, userId));

  const key = (r: ListedRequest) => `${r.nightDate}T${r.startTime}`;
  const open = rows.filter((r) => isChangeable(r, now)).sort((a, b) => key(a).localeCompare(key(b)));
  const closed = rows.filter((r) => !isChangeable(r, now)).sort((a, b) => key(b).localeCompare(key(a)));
  return [...open, ...closed];
}

/** One of her requests, or null: an unknown id and another family's id read the same. */
export async function ownRequest(userId: string, id: string): Promise<OwnRequest | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({
      ...familyColumns,
      reason: careRequests.reason,
      seriesId: careRequests.seriesId,
      seriesWhole: careRequests.seriesWhole,
    })
    .from(careRequests)
    .where(and(eq(careRequests.id, id), eq(careRequests.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

/**
 * Every night of her series, in night order (JAM-302): the page of a regular
 * request shows them all. Another family's series reads empty.
 */
export async function ownSeriesNights(userId: string, seriesId: string): Promise<FamilyRequest[]> {
  if (!UUID.test(seriesId)) return [];
  const rows = await db
    .select(familyColumns)
    .from(careRequests)
    .where(and(eq(careRequests.seriesId, seriesId), eq(careRequests.familyUserId, userId)));
  return rows.sort((a, b) => a.nightDate.localeCompare(b.nightDate));
}

/**
 * No professional ever answered the request (JAM-302, Q4: the lifecycle of
 * every request). For a regular request, no professional ever answered any of
 * its nights. A withdrawn or declined answer counts: to change a request that
 * was answered, the family cancels it and publishes a new one.
 */
export function neverAnswered(id: string) {
  return sql`not exists (
    select 1 from care_request_applications a
    join care_requests ar on ar.id = a.request_id
    join care_requests self on self.id = ${id}
    where ar.id = self.id
       or (self.series_whole and ar.series_id = self.series_id)
  )`;
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
 * Saves an edit: the night, the start, the children, the age, the feeding,
 * the reason, the night's address. Never the commune or the urgency, and never
 * once a professional answered it, or any night of its regular request
 * (JAM-302, Q4; D-76 and D-85 superseded): the lock is held in the UPDATE
 * itself, so an answer given while the form was open still wins.
 */
export async function updateRequest(
  userId: string,
  id: string,
  values: RequestValues,
  address: Address,
  now: Date,
): Promise<ChangeResult> {
  if (!UUID.test(id)) return "nonModifiable";
  try {
    const updated = await db
      .update(careRequests)
      .set({ ...values, ...requestAddressValues(address), updatedAt: now })
      .where(
        and(changeable(userId, id), neverAnswered(id)),
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
      // A regular request is cancelled with all its nights (JAM-302, cancelSeries).
      .where(and(changeable(userId, id), eq(careRequests.seriesWhole, false)))
      .returning({ id: careRequests.id }),
    cancelDeclinesAnswers(userId, id, now),
  ]);
  return {
    result: cancelled.length > 0 ? "ok" : "nonModifiable",
    declined: cancelled.length > 0 ? declined.map((a) => a.id) : [],
  };
}

/**
 * « Annuler toutes les nuits » (demande-nuits-regulieres): every open night of
 * her series whose night has not started is cancelled, and the answers that
 * waited on them are declined in the same transaction; their ids come back so
 * each professional is told (D-76). A booked night does not change: its garde
 * keeps its own cancellation and its fee rule (D-110).
 */
export async function cancelSeries(
  userId: string,
  seriesId: string,
  now: Date,
): Promise<{ cancelled: number; declined: string[] }> {
  if (!UUID.test(seriesId)) return { cancelled: 0, declined: [] };
  const [cancelled, declined] = await db.batch([
    cancelSeriesStatement(userId, seriesId, now),
    cancelSeriesDeclinesAnswers(userId, seriesId, now),
  ]);
  return { cancelled: cancelled.length, declined: declined.map((a) => a.id) };
}

/** `cancelSeries`'s first statement: her open nights ahead in the series become `annulee` at `now`. */
export function cancelSeriesStatement(userId: string, seriesId: string, now: Date) {
  return db
    .update(careRequests)
    .set({ status: "annulee", cancelledAt: now, updatedAt: now })
    .where(
      and(
        eq(careRequests.seriesId, seriesId),
        eq(careRequests.familyUserId, userId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
      ),
    )
    .returning({ id: careRequests.id });
}

/**
 * `cancelSeries`'s second statement: the answers still waiting on the nights
 * the first statement cancelled at `now` become `non_retenue`. A night
 * cancelled earlier, and its answers, are left as they are.
 */
export function cancelSeriesDeclinesAnswers(userId: string, seriesId: string, now: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "non_retenue", updatedAt: now })
    .where(
      and(
        eq(careRequestApplications.status, "en_attente"),
        inArray(
          careRequestApplications.requestId,
          db
            .select({ id: careRequests.id })
            .from(careRequests)
            .where(
              and(
                eq(careRequests.seriesId, seriesId),
                eq(careRequests.familyUserId, userId),
                eq(careRequests.status, "annulee"),
                eq(careRequests.cancelledAt, now),
              ),
            ),
        ),
      ),
    )
    .returning({ id: careRequestApplications.id });
}

/**
 * `cancelRequest`'s second statement: every answer still waiting on her
 * request becomes `non_retenue`, only once the first statement cancelled it.
 * A withdrawn, declined or booked answer is left as it is (D-76).
 */
export function cancelDeclinesAnswers(userId: string, id: string, now: Date) {
  return db
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
    .returning({ id: careRequestApplications.id });
}

/**
 * A suspension's part here (back-office-admin, D-134): her open requests
 * ahead are cancelled as her own cancellation would, in the suspension's own
 * batch and only if that batch suspended her at `at`. The next statement
 * declines the answers that waited on them, so each professional is told.
 */
export function suspensionCancelsRequests(userId: string, at: Date) {
  return db
    .update(careRequests)
    .set({ status: "annulee", cancelledAt: at, updatedAt: at })
    .where(
      and(
        eq(careRequests.familyUserId, userId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
        suspendedAtExactly(userId, at),
      ),
    )
    .returning({ id: careRequests.id });
}

/** The answers still waiting on the requests `suspensionCancelsRequests` cancelled at `at`, declined. */
export function suspensionDeclinesAnswers(userId: string, at: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "non_retenue", updatedAt: at })
    .where(
      and(
        eq(careRequestApplications.status, "en_attente"),
        inArray(
          careRequestApplications.requestId,
          db
            .select({ id: careRequests.id })
            .from(careRequests)
            .where(
              and(
                eq(careRequests.familyUserId, userId),
                eq(careRequests.status, "annulee"),
                eq(careRequests.cancelledAt, at),
              ),
            ),
        ),
        suspendedAtExactly(userId, at),
      ),
    )
    .returning({ id: careRequestApplications.id });
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
 * Her live request for `nightDate`, if any: open or booked, of which the
 * unique index holds at most one (D-65, D-156). Republishing a cancelled garde
 * links to it instead; the index still refuses a second one written meanwhile.
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
  const updated = await setPriorityStatement(userId, id, profileId, now);
  return updated.length > 0 ? "ok" : "nonModifiable";
}

/**
 * `setPriority`'s statement: her open request ahead, never sent in priority
 * before (`priority_sent_at` is kept when the professional's id is cleared, so
 * the request is never sent twice), to a validated professional who is not
 * suspended and could still answer it.
 */
export function setPriorityStatement(userId: string, id: string, profileId: string, now: Date) {
  return db
    .update(careRequests)
    .set({ priorityProfileId: profileId, prioritySentAt: now, updatedAt: now })
    .where(
      and(
        changeable(userId, id),
        isNull(careRequests.prioritySentAt),
        // A regular request goes in priority only at its publication, all its nights at once (JAM-302).
        sql`not ${careRequests.seriesWhole}`,
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
  return priorityCandidatesQuery(userId, profileId);
}

/** `priorityCandidates`' query, built and not run. */
export function priorityCandidatesQuery(userId: string, profileId: string) {
  return db
    .select(cardColumns)
    .from(careRequests)
    .where(
      and(
        eq(careRequests.familyUserId, userId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
        isNull(careRequests.prioritySentAt),
        sql`not ${careRequests.seriesWhole}`,
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
  status: RequestStatus;
  priority: boolean;
  answer: ApplicationStatus | null;
  family: Note;
  seriesId: string | null;
  /** The night belongs to a regular request answered as one (JAM-302). */
  seriesWhole: boolean;
  /** The open nights ahead of that regular request; 0 for any other night. */
  seriesNights: number;
};

export type ProfessionalView =
  | { validated: false }
  | {
      validated: true;
      nightRateEur: number | null;
      extraHourRateEur: number | null;
      requests: ProfessionalRequest[];
    };

/** Her profile: its id, its status and her current rates. */
export async function professionalProfileOf(
  userId: string,
): Promise<{ id: string; status: string; nightRateEur: number | null; extraHourRateEur: number | null } | null> {
  const [profile] = await db
    .select({
      id: professionalProfiles.id,
      status: professionalProfiles.status,
      nightRateEur: professionalProfiles.nightRateEur,
      extraHourRateEur: professionalProfiles.extraHourRateEur,
    })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

/**
 * Her list: the open requests ahead in the communes she reaches, and those sent
 * to her in priority wherever they are (D-71); never one she was declined on,
 * nor one on a night she is booked (D-73). Priority first, then urgent, then
 * newest. Only a validated profile sees any (D-5, D-10).
 */
export async function professionalRequests(userId: string): Promise<ProfessionalView> {
  const profile = await professionalProfileOf(userId);
  if (!profile || profile.status !== "valide") return { validated: false };

  const requests = await herListQuery(profile.id);
  const notes = await familyNotesOfRequests(requests.map((request) => request.id));
  return {
    validated: true,
    nightRateEur: profile.nightRateEur,
    extraHourRateEur: profile.extraHourRateEur,
    requests: requests.map((request) => ({ ...request, family: notes.get(request.id) ?? NO_NOTE })),
  };
}

/**
 * One request of her list, with the family's optional reason
 * (demande-motif-facultatif): the request page is the one place she reads it.
 * Null when her profile is not validated or the request is not on her list:
 * the same visibility as the list, so an id she cannot see reads as not found.
 */
export async function professionalRequest(
  userId: string,
  id: string,
): Promise<{
  nightRateEur: number | null;
  extraHourRateEur: number | null;
  request: ProfessionalRequest & { reason: string | null };
} | null> {
  if (!UUID.test(id)) return null;
  const profile = await professionalProfileOf(userId);
  if (!profile || profile.status !== "valide") return null;

  const [request] = await herListQuery(profile.id, id);
  if (!request) return null;
  const [notes, [row]] = await Promise.all([
    familyNotesOfRequests([request.id]),
    db.select({ reason: careRequests.reason }).from(careRequests).where(eq(careRequests.id, request.id)).limit(1),
  ]);
  return {
    nightRateEur: profile.nightRateEur,
    extraHourRateEur: profile.extraHourRateEur,
    request: { ...request, family: notes.get(request.id) ?? NO_NOTE, reason: row?.reason ?? null },
  };
}

/** `professionalRequests`' query for her profile, built and not run; `requestId` narrows it to one. */
export function herListQuery(profileId: string, requestId?: string) {
  const priority = sql<boolean>`coalesce(${careRequests.priorityProfileId} = ${profileId}, false)`;
  return db
    .select({
      ...cardColumns,
      status: careRequests.status,
      priority,
      answer: careRequestApplications.status,
      seriesId: careRequests.seriesId,
      seriesWhole: careRequests.seriesWhole,
      // The open nights ahead of its regular request (JAM-302): she answers when her list holds them all.
      seriesNights: sql<number>`(
        select count(*)::integer from care_requests sn
        where ${careRequests.seriesWhole} and sn.series_id = ${careRequests.seriesId}
          and sn.status = 'ouverte'
          and (sn.night_date + sn.start_time) > (now() AT TIME ZONE ${TIME_ZONE})
      )`,
    })
    .from(careRequests)
    .leftJoin(
      careRequestApplications,
      and(
        eq(careRequestApplications.requestId, careRequests.id),
        eq(careRequestApplications.profileId, profileId),
      ),
    )
    .where(
      and(
        requestId === undefined ? undefined : eq(careRequests.id, requestId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
        or(
          eq(careRequests.priorityProfileId, profileId),
          // Her reach (zone-rayon-lecture): « Toute la Belgique », or a commune her radius
          // reaches, her own communes included.
          exists(
            db
              .select({ id: professionalProfiles.id })
              .from(professionalProfiles)
              .where(and(eq(professionalProfiles.id, profileId), eq(professionalProfiles.zoneWholeBelgium, true))),
          ),
          inArray(
            careRequests.communeIns,
            db
              .select({ ins: professionalReach.communeIns })
              .from(professionalReach)
              .where(eq(professionalReach.profileId, profileId)),
          ),
        ),
        or(isNull(careRequestApplications.status), ne(careRequestApplications.status, "non_retenue")),
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
      ),
    )
    .orderBy(desc(priority), desc(careRequests.urgent), desc(careRequests.createdAt));
}

export type Recipient = { profileId: string; email: string; firstName: string; communeIns: string };

/**
 * Every validated professional reaching one of `communes`, once per commune she
 * reaches there; never a suspended one, who can answer nothing (D-134). Her
 * reach is her radius around her communes (zone-rayon-lecture): a « Toute la
 * Belgique » profile reaches each of `communes`. The callers group the rows by
 * profile, so a request goes to her once.
 */
export async function professionalsServing(communes: string[]): Promise<Recipient[]> {
  if (communes.length === 0) return [];
  const [reached, wholeBelgium] = await Promise.all([reachingQuery(communes), wholeBelgiumQuery()]);
  return recipientsOf(reached, wholeBelgium, communes);
}

/** The reached rows, and one row per commune of `communes` for each « Toute la Belgique » profile. */
export function recipientsOf(
  reached: readonly Recipient[],
  wholeBelgium: readonly Omit<Recipient, "communeIns">[],
  communes: readonly string[],
): Recipient[] {
  return [...reached, ...wholeBelgium.flatMap((r) => communes.map((communeIns) => ({ ...r, communeIns })))];
}

const recipientColumns = {
  profileId: professionalProfiles.id,
  email: users.email,
  firstName: users.firstName,
};

const validNotSuspended = and(eq(professionalProfiles.status, "valide"), notSuspended(professionalProfiles.userId));

/** The professionals whose reach holds one of `communes`, one row per commune: built and not run. */
export function reachingQuery(communes: string[]) {
  return db
    .select({ ...recipientColumns, communeIns: professionalReach.communeIns })
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .innerJoin(professionalReach, eq(professionalReach.profileId, professionalProfiles.id))
    .where(and(validNotSuspended, inArray(professionalReach.communeIns, communes)));
}

/** The « Toute la Belgique » professionals, who store no reach: built and not run. */
export function wholeBelgiumQuery() {
  return db
    .select(recipientColumns)
    .from(professionalProfiles)
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(validNotSuspended, eq(professionalProfiles.zoneWholeBelgium, true)));
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
export async function claimDigestRequests(now: Date): Promise<DigestRequest[]> {
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
    .returning({ ...cardColumns, seriesId: careRequests.seriesId });
}
