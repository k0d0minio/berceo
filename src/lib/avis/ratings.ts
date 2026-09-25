import "server-only";

import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequests,
  db,
  professionalProfiles,
  ratingInvitations,
  ratings,
  users,
  type BookingStatus,
  type RatingSide,
} from "@/db";
import { NIGHT_HOURS, TIME_ZONE } from "@/lib/demandes/rules";

import { rateRefusal, WINDOW_DAYS, type RateRefusal, type Scores } from "./rules";

/**
 * Every read and write of `ratings` and `rating_invitations` (avis-etoiles).
 * The rules of `./rules.ts` are held again in the SQL of each write and read:
 * a rating is inserted only on a terminée, non-annulée garde of the rater's
 * own, inside its window, once per side (D-117, D-122); a note counts only
 * published ratings (D-116) on gardes still confirmed (D-122). The side and
 * the rated person always come from the session and the booking, never from a
 * form. Nothing here returns another person's single rating except to the
 * founders (`adminRatings`).
 */

/** Logs a failure with ids only: Drizzle's messages can carry the query's values. */
export function logError(what: string, context: Record<string, unknown>, error?: unknown): void {
  console.error(`[avis] ${what}`, {
    ...context,
    error: error instanceof Error ? error.name : error === undefined ? undefined : typeof error,
  });
}

/** A well-formed id; anything else reads as unknown. (Not imported from `src/lib/demandes/`, which reads this module.) */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Brussels wall-clock now, the form `night_date + start_time` compares with. */
const localNow = sql`(now() AT TIME ZONE ${TIME_ZONE})`;

/** The night's end, a Brussels wall-clock timestamp: start + 11 hours. */
const nightEnd = sql`(${careRequests.nightDate} + ${careRequests.startTime} + make_interval(hours => ${NIGHT_HOURS}::int))`;

/** The end of the rating window: the night's end + 14 days. */
const windowEnd = sql`(${nightEnd} + make_interval(days => ${WINDOW_DAYS}::int))`;

/** The garde is terminée now: confirmed, its night over (`src/lib/gardes/rules.ts`, D-109). */
const isTerminee = sql`(${bookings.status} = 'confirmee' AND ${nightEnd} <= ${localNow})`;

/** A garde whose window is still open. */
const windowOpen = sql`(${windowEnd} > ${localNow})`;

/** The side's own garde: the family who booked it, or the professional booked. */
function partyOf(side: RatingSide, userId: string): SQL {
  return side === "famille"
    ? sql`${bookings.familyUserId} = ${userId}`
    : sql`exists (select 1 from professional_profiles p where p.id = ${bookings.profileId} and p.user_id = ${userId})`;
}

/** The person `side` rates: the professional's account for the family, the family for the professional. */
const professionalUserOfBooking = sql`(select p.user_id from professional_profiles p where p.id = ${bookings.profileId})`;

function ratedUserOf(side: RatingSide): SQL {
  return side === "famille" ? professionalUserOfBooking : sql`${bookings.familyUserId}`;
}

/**
 * A rating counts (D-116): the other side of the same garde has rated too, or
 * the window has closed; and the garde is still confirmed (D-122).
 */
const isPublishedRating = sql`(
  exists (select 1 from ratings o where o.booking_id = ${ratings.bookingId} and o.rater_side <> ${ratings.raterSide})
  or ${windowEnd} <= ${localNow}
)`;

// ---------------------------------------------------------------------------
// The note and the gardes count (D-119)
// ---------------------------------------------------------------------------

/** What a note display needs: the note or null, and the terminée gardes. */
export type Note = { note: number | null; gardes: number };

export const NO_NOTE: Note = { note: null, gardes: 0 };

/** Each user's note and gardes count; a user with neither reads `NO_NOTE`. */
export async function notesOfUsers(userIds: readonly string[]): Promise<Map<string, Note>> {
  const ids = [...new Set(userIds)].filter((id) => UUID.test(id));
  const notes = new Map<string, Note>(ids.map((id) => [id, { ...NO_NOTE }]));
  if (ids.length === 0) return notes;

  const professionalUser = sql<string>`${professionalProfiles.userId}`;
  const [scored, asFamily, asProfessional] = await Promise.all([
    db
      .select({
        userId: ratings.ratedUserId,
        total: sql<number>`sum(${ratings.score1} + ${ratings.score2} + ${ratings.score3} + ${ratings.score4})::int`,
        count: sql<number>`(count(*) * 4)::int`,
      })
      .from(ratings)
      .innerJoin(bookings, eq(bookings.id, ratings.bookingId))
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .where(and(inArray(ratings.ratedUserId, ids), eq(bookings.status, "confirmee"), isPublishedRating))
      .groupBy(ratings.ratedUserId),
    db
      .select({ userId: bookings.familyUserId, gardes: sql<number>`count(*)::int` })
      .from(bookings)
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .where(and(inArray(bookings.familyUserId, ids), isTerminee))
      .groupBy(bookings.familyUserId),
    db
      .select({ userId: professionalUser, gardes: sql<number>`count(*)::int` })
      .from(bookings)
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
      .where(and(inArray(professionalProfiles.userId, ids), isTerminee))
      .groupBy(professionalProfiles.userId),
  ]);

  for (const row of [...asFamily, ...asProfessional]) {
    const note = notes.get(row.userId);
    if (note) note.gardes += Number(row.gardes);
  }
  for (const row of scored) {
    const note = notes.get(row.userId);
    if (note && row.count > 0) note.note = Math.round((Number(row.total) * 10) / Number(row.count)) / 10;
  }
  return notes;
}

/** One user's note: her own, on her home (D-121). */
export async function noteOfUser(userId: string): Promise<Note> {
  return (await notesOfUsers([userId])).get(userId) ?? { ...NO_NOTE };
}

/** Each professional profile's note, keyed by profile id (the family's side). */
export async function notesOfProfiles(profileIds: readonly string[]): Promise<Map<string, Note>> {
  const ids = [...new Set(profileIds)].filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const owners = await db
    .select({ profileId: professionalProfiles.id, userId: professionalProfiles.userId })
    .from(professionalProfiles)
    .where(inArray(professionalProfiles.id, ids));
  const notes = await notesOfUsers(owners.map((owner) => owner.userId));
  return new Map(owners.map((owner) => [owner.profileId, notes.get(owner.userId) ?? { ...NO_NOTE }]));
}

/**
 * The note of the family that published each request, keyed by request id (the
 * professional's side, D-118). The family's id never leaves this function.
 */
export async function familyNotesOfRequests(requestIds: readonly string[]): Promise<Map<string, Note>> {
  const ids = [...new Set(requestIds)].filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const owners = await db
    .select({ requestId: careRequests.id, userId: careRequests.familyUserId })
    .from(careRequests)
    .where(inArray(careRequests.id, ids));
  const notes = await notesOfUsers(owners.map((owner) => owner.userId));
  return new Map(owners.map((owner) => [owner.requestId, notes.get(owner.userId) ?? { ...NO_NOTE }]));
}

// ---------------------------------------------------------------------------
// Rating a garde
// ---------------------------------------------------------------------------

/** What this side gave on a garde, read-only: never the other side's. */
export type GivenRating = { scores: Scores; createdAt: Date };

/** The ratings `side` gave on each of these gardes, keyed by booking id. */
export async function ratingsGiven(side: RatingSide, bookingIds: readonly string[]): Promise<Map<string, GivenRating>> {
  const ids = [...new Set(bookingIds)].filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      bookingId: ratings.bookingId,
      score1: ratings.score1,
      score2: ratings.score2,
      score3: ratings.score3,
      score4: ratings.score4,
      createdAt: ratings.createdAt,
    })
    .from(ratings)
    .where(and(inArray(ratings.bookingId, ids), eq(ratings.raterSide, side)));
  return new Map(
    rows.map((row) => [
      row.bookingId,
      { scores: [row.score1, row.score2, row.score3, row.score4] as const, createdAt: row.createdAt },
    ]),
  );
}

/** A garde as its rating form reads it: the night, the other person's first name, this side's rating. */
export type RatingTarget = {
  bookingId: string;
  status: BookingStatus;
  nightDate: string;
  startTime: string;
  otherFirstName: string;
  given: GivenRating | null;
};

const otherUser = alias(users, "other_user");

/** One of this side's own gardes for its form, or null: another person's reads the same as an unknown one. */
export async function ratingTarget(side: RatingSide, userId: string, bookingId: string): Promise<RatingTarget | null> {
  if (!UUID.test(bookingId)) return null;
  const [row] = await db
    .select({
      bookingId: bookings.id,
      status: bookings.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      otherFirstName: otherUser.firstName,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(otherUser, sql`${otherUser.id} = ${ratedUserOf(side)}`)
    .where(and(eq(bookings.id, bookingId), partyOf(side, userId)))
    .limit(1);
  if (!row) return null;
  const given = (await ratingsGiven(side, [bookingId])).get(bookingId) ?? null;
  return { ...row, given };
}

export type SubmitResult = { ok: true } | { ok: false; reason: RateRefusal | "introuvable" };

/**
 * Stores this side's rating of one of its gardes (D-117). One statement holds
 * every rule: the rater's own garde, terminée, not annulée, inside its window,
 * and the unique (garde, side) key, so a second click or two tabs at once
 * store one rating. On a refusal, the garde is read again to say why.
 */
export async function submitRating(
  side: RatingSide,
  userId: string,
  bookingId: string,
  scores: Scores,
  now: Date,
): Promise<SubmitResult> {
  if (!UUID.test(bookingId)) return { ok: false, reason: "introuvable" };
  const [s1, s2, s3, s4] = scores;
  const inserted = await db.execute<{ id: string }>(sql`
    insert into ratings (booking_id, rater_side, rater_user_id, rated_user_id, score_1, score_2, score_3, score_4)
    select ${bookings.id}, ${side}::rating_side, ${userId}::uuid, ${ratedUserOf(side)},
           ${s1}::smallint, ${s2}::smallint, ${s3}::smallint, ${s4}::smallint
    from ${bookings}
    join ${careRequests} on ${careRequests.id} = ${bookings.requestId}
    where ${bookings.id} = ${bookingId}
      and ${partyOf(side, userId)}
      and ${isTerminee}
      and ${windowOpen}
    on conflict (booking_id, rater_side) do nothing
    returning id
  `);
  if (inserted.rows.length > 0) return { ok: true };

  const target = await ratingTarget(side, userId, bookingId);
  if (!target) return { ok: false, reason: "introuvable" };
  const refusal = rateRefusal(
    { status: target.status, nightDate: target.nightDate, startTime: target.startTime },
    target.given !== null,
    now,
  );
  return { ok: false, reason: refusal ?? "dejaNote" };
}

// ---------------------------------------------------------------------------
// The invitation (D-120)
// ---------------------------------------------------------------------------

export type DueInvitation = { bookingId: string; side: RatingSide };

/**
 * The invitations owed now: for each terminée, non-annulée garde inside its
 * window, each side not yet invited and not yet rated. A garde whose window
 * closed before any pass saw it owes none.
 */
export async function invitationsDue(): Promise<DueInvitation[]> {
  const rows = await db.execute<{ booking_id: string; side: RatingSide }>(sql`
    select ${bookings.id} as booking_id, s.side
    from ${bookings}
    join ${careRequests} on ${careRequests.id} = ${bookings.requestId}
    cross join (values ('famille'::rating_side), ('professionnelle'::rating_side)) as s(side)
    where ${isTerminee}
      and ${windowOpen}
      and not exists (select 1 from rating_invitations i where i.booking_id = ${bookings.id} and i.side = s.side)
      and not exists (select 1 from ratings r where r.booking_id = ${bookings.id} and r.rater_side = s.side)
    order by ${bookings.nightDate}, ${bookings.id}
  `);
  return rows.rows.map((row) => ({ bookingId: row.booking_id, side: row.side }));
}

/**
 * Claims one side's invitation just before its send, only if nobody has and
 * the garde still owes it: two passes never both send it.
 */
export async function claimInvitation(bookingId: string, side: RatingSide, now: Date): Promise<boolean> {
  const claimed = await db.execute<{ booking_id: string }>(sql`
    insert into rating_invitations (booking_id, side, sent_at)
    select ${bookings.id}, ${side}::rating_side, ${now.toISOString()}::timestamptz
    from ${bookings}
    join ${careRequests} on ${careRequests.id} = ${bookings.requestId}
    where ${bookings.id} = ${bookingId}
      and ${isTerminee}
      and ${windowOpen}
      and not exists (select 1 from ratings r where r.booking_id = ${bookings.id} and r.rater_side = ${side}::rating_side)
    on conflict (booking_id, side) do nothing
    returning booking_id
  `);
  return claimed.rows.length > 0;
}

/** Gives a claim back after a failed send, so the next pass tries again. */
export async function releaseInvitation(bookingId: string, side: RatingSide): Promise<void> {
  await db
    .delete(ratingInvitations)
    .where(and(eq(ratingInvitations.bookingId, bookingId), eq(ratingInvitations.side, side)));
}

// ---------------------------------------------------------------------------
// The founders' list (G-03, D-118)
// ---------------------------------------------------------------------------

export const ADMIN_PAGE_SIZE = 50;

/** A rating as the founders read it: both people in full, the four scores, published or not. */
export type AdminRating = {
  id: string;
  createdAt: Date;
  nightDate: string;
  startTime: string;
  communeIns: string;
  locality: string;
  raterSide: RatingSide;
  rater: { firstName: string; lastName: string };
  rated: { firstName: string; lastName: string };
  scores: Scores;
  published: boolean;
  /** The garde was cancelled after it was rated, by an absence (D-122): it counts nowhere. */
  gardeAnnulee: boolean;
};

const raterUser = alias(users, "rater_user");
const ratedUser = alias(users, "rated_user");

export async function adminRatingCount(): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(ratings);
  return Number(row?.n ?? 0);
}

/** Every rating, newest first, 50 a page (page 1 is the newest). */
export async function adminRatings(page: number): Promise<AdminRating[]> {
  const offset = (Math.max(1, Math.floor(page)) - 1) * ADMIN_PAGE_SIZE;
  const rows = await db
    .select({
      id: ratings.id,
      createdAt: ratings.createdAt,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      communeIns: careRequests.communeIns,
      locality: careRequests.locality,
      raterSide: ratings.raterSide,
      raterFirst: raterUser.firstName,
      raterLast: raterUser.lastName,
      ratedFirst: ratedUser.firstName,
      ratedLast: ratedUser.lastName,
      score1: ratings.score1,
      score2: ratings.score2,
      score3: ratings.score3,
      score4: ratings.score4,
      published: sql<boolean>`${isPublishedRating}`,
      bookingStatus: bookings.status,
    })
    .from(ratings)
    .innerJoin(bookings, eq(bookings.id, ratings.bookingId))
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(raterUser, eq(raterUser.id, ratings.raterUserId))
    .innerJoin(ratedUser, eq(ratedUser.id, ratings.ratedUserId))
    .orderBy(desc(ratings.createdAt), desc(ratings.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    nightDate: row.nightDate,
    startTime: row.startTime,
    communeIns: row.communeIns,
    locality: row.locality,
    raterSide: row.raterSide,
    rater: { firstName: row.raterFirst, lastName: row.raterLast },
    rated: { firstName: row.ratedFirst, lastName: row.ratedLast },
    scores: [row.score1, row.score2, row.score3, row.score4] as const,
    published: row.published === true,
    gardeAnnulee: row.bookingStatus === "annulee",
  }));
}
