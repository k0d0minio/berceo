import "server-only";

import { and, asc, eq, exists, isNull, ne, sql, type SQL } from "drizzle-orm";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  payments,
  professionalProfiles,
  users,
  type BookingStatus,
  type CancellationAuthor,
  type CancellationKind,
  type CancellationReason,
  type Profession,
} from "@/db";
import { cardColumns, isUniqueViolation, nightAhead, UUID, type RequestCard } from "@/lib/demandes/requests";
import { TIME_ZONE } from "@/lib/demandes/rules";
import { bookingAddress, type BookingAddress } from "@/lib/famille/profile";
import { requestHasAddress } from "@/lib/famille/request-address";
import { notSuspended, suspended } from "@/lib/auth/suspension";
import { bonneGardeStatement } from "@/lib/messagerie/conversations";

import { photoId } from "./answers";
import { acceptRefusal, effectiveStart, type AcceptRefusal } from "./rules";

/**
 * Every read and write of a booking. Accepting an answer is the one write, in
 * one transaction; the reads give each side only its own bookings, and the
 * professional reads the family's name, phone and address only on her own
 * booking (D-15, D-72). « Accepter et réserver » opens the fee's Checkout
 * (`src/lib/paiements/`); only a paid payment books, through `acceptAnswer`
 * (D-102).
 */

export type AcceptCheck =
  | {
      ok: true;
      nightDate: string;
      /** The start a booking of this answer gives the night: her proposed start, or the family's (JAM-306). */
      startTime: string;
      /** The start she proposes in place of the family's (JAM-306); null for none. */
      proposedStartTime: string | null;
      nightRateEur: number;
      /** A night of a regular request answered as one (JAM-302): it is booked with all its nights. */
      seriesWhole: boolean;
    }
  | { ok: false; reason: AcceptRefusal | "introuvable" };

/**
 * Whether the family may book this answer now, with what the fee needs: the
 * night and the rate the answer froze (D-74). The Checkout is opened only on
 * `ok`; `acceptAnswer` reads it again when the payment lands.
 */
export async function acceptCheck(
  userId: string,
  requestId: string,
  applicationId: string,
  now: Date,
): Promise<AcceptCheck> {
  if (!UUID.test(requestId) || !UUID.test(applicationId)) return { ok: false, reason: "introuvable" };

  const [facts] = await db
    .select({
      status: careRequests.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      priorityProfileId: careRequests.priorityProfileId,
      seriesWhole: careRequests.seriesWhole,
      answerStatus: careRequestApplications.status,
      proposedStartTime: careRequestApplications.proposedStartTime,
      nightRateEur: careRequestApplications.nightRateEur,
      profileStatus: professionalProfiles.status,
      // Her account suspended since she answered (D-134): she is no longer bookable.
      suspended: sql<boolean>`${suspended(professionalProfiles.userId)}`,
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .where(
      and(
        eq(careRequestApplications.id, applicationId),
        eq(careRequests.id, requestId),
        eq(careRequests.familyUserId, userId),
      ),
    )
    .limit(1);
  if (!facts) return { ok: false, reason: "introuvable" };

  const refusal = acceptRefusal(
    {
      request: facts,
      answer: {
        status: facts.answerStatus,
        profileStatus: facts.suspended ? "suspendu" : facts.profileStatus,
        proposedStartTime: facts.proposedStartTime,
      },
      hasAddress: await requestHasAddress(userId, requestId),
    },
    now,
  );
  if (refusal) return { ok: false, reason: refusal };
  return {
    ok: true,
    nightDate: facts.nightDate,
    startTime: effectiveStart(facts.startTime, facts.proposedStartTime),
    proposedStartTime: facts.proposedStartTime,
    nightRateEur: facts.nightRateEur,
    seriesWhole: facts.seriesWhole,
  };
}

export type SeriesNight = {
  requestId: string;
  applicationId: string;
  nightDate: string;
  startTime: string;
  /** The start she proposes for this night (JAM-306); null for none. */
  proposedStartTime: string | null;
  nightRateEur: number;
};

export type SeriesAcceptCheck =
  | { ok: true; nights: SeriesNight[] }
  | { ok: false; reason: AcceptRefusal | "introuvable" };

/**
 * Whether the family may book this professional for her regular request now
 * (JAM-302): every open night ahead of the series must hold this
 * professional's waiting answer, and each night must pass `acceptCheck`. The
 * nights come back in night order, with the rate each answer froze, for the
 * one Checkout of all the nights.
 */
export async function acceptSeriesCheck(
  userId: string,
  seriesId: string,
  profileId: string,
  now: Date,
): Promise<SeriesAcceptCheck> {
  if (!UUID.test(seriesId) || !UUID.test(profileId)) return { ok: false, reason: "introuvable" };
  const rows = await db
    .select({ requestId: careRequests.id, applicationId: careRequestApplications.id })
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
        eq(careRequests.seriesId, seriesId),
        eq(careRequests.seriesWhole, true),
        eq(careRequests.familyUserId, userId),
        eq(careRequests.status, "ouverte"),
        nightAhead,
      ),
    );
  if (rows.length === 0) return { ok: false, reason: "introuvable" };

  const nights: SeriesNight[] = [];
  for (const row of rows) {
    // A night she never answered, or answered no more: she does not cover them all (Q5).
    if (!row.applicationId) return { ok: false, reason: "indisponible" };
    const check = await acceptCheck(userId, row.requestId, row.applicationId, now);
    if (!check.ok) return check;
    nights.push({
      requestId: row.requestId,
      applicationId: row.applicationId,
      nightDate: check.nightDate,
      startTime: check.startTime,
      proposedStartTime: check.proposedStartTime,
      nightRateEur: check.nightRateEur,
    });
  }
  return { ok: true, nights: nights.sort((a, b) => a.nightDate.localeCompare(b.nightDate)) };
}

export type AcceptResult =
  | { ok: true; bookingId: string; declined: string[] }
  | { ok: false; reason: AcceptRefusal | "introuvable" | "conflit" };

/**
 * The booking a paid fee makes (D-102). The rules are read first for a precise
 * answer, then the batch holds them again, statement by statement, in one
 * transaction, the payment row locked first:
 *
 * 1. the chosen answer becomes `retenue`, only if it still waits, its
 *    professional is still validated and not suspended (D-134), the request is hers, open and ahead,
 *    its proposed start is ahead too, and `paymentId` is her fee for this very
 *    answer, paid, and opened after she last answered: an answer given again
 *    since, with a proposal the family did not confirm, is not booked (JAM-306);
 * 2. the booking is made from that answer (its rate, D-74), only if step 1
 *    took; the unique indexes refuse a second booking for the request or for
 *    her that night, which rolls the whole batch back;
 * 3. the request becomes `attribuee`, and takes the booked answer's proposed
 *    start: `start_time` becomes the start the two sides agreed on, and
 *    `requested_start_time` keeps the family's (JAM-306), 4. the other waiting answers on it
 *    `non_retenue` (returned, to be told), 5. her waiting answers on other
 *    requests that night `retiree` (D-73), 6. the payment points at the
 *    booking: each only if the booking exists; 7. Berceo's « excellente
 *    garde » in the booked answer's conversation (messagerie).
 *
 * Two payments racing on one request, or two requests booking one
 * professional for one night, end with one booking and a « conflit »; the
 * caller refunds the loser (D-103).
 */
export async function acceptAnswer(
  userId: string,
  requestId: string,
  applicationId: string,
  paymentId: string,
  now: Date,
): Promise<AcceptResult> {
  if (!UUID.test(paymentId)) return { ok: false, reason: "introuvable" };
  const check = await acceptCheck(userId, requestId, applicationId, now);
  if (!check.ok) return check;

  const at = now.toISOString();

  try {
    const [, , made, , declined] = await db.batch([
      // Holds the payment row until the booking commits, so a refund cannot
      // land between the check below and the link in the last statement.
      db.execute(sql`select id from payments where id = ${paymentId} for update`),
      db
        .update(careRequestApplications)
        .set({ status: "retenue", updatedAt: now })
        .where(
          and(
            eq(careRequestApplications.id, applicationId),
            eq(careRequestApplications.requestId, requestId),
            eq(careRequestApplications.status, "en_attente"),
            exists(
              db
                .select({ id: professionalProfiles.id })
                .from(professionalProfiles)
                .where(
                  and(
                    eq(professionalProfiles.id, careRequestApplications.profileId),
                    eq(professionalProfiles.status, "valide"),
                    notSuspended(professionalProfiles.userId),
                  ),
                ),
            ),
            exists(
              db
                .select({ id: careRequests.id })
                .from(careRequests)
                .where(
                  and(
                    eq(careRequests.id, requestId),
                    eq(careRequests.familyUserId, userId),
                    eq(careRequests.status, "ouverte"),
                    nightAhead,
                  ),
                ),
            ),
            // A start she proposed before the family's must be ahead too (JAM-306).
            proposedStartAhead(requestId),
            // The click never books: only her paid fee for this answer (D-102).
            exists(
              db
                .select({ id: payments.id })
                .from(payments)
                .where(
                  and(
                    eq(payments.id, paymentId),
                    eq(payments.status, "payee"),
                    eq(payments.requestId, requestId),
                    eq(payments.applicationId, applicationId),
                    eq(payments.familyUserId, userId),
                    isNull(payments.bookingId),
                    // The fee was opened on the answer as it stands: she has not answered again since (JAM-306).
                    sql`${careRequestApplications.answeredAt} <= ${payments.createdAt}`,
                  ),
                ),
            ),
          ),
        )
        .returning({ id: careRequestApplications.id }),
      db.execute<{ id: string }>(sql`
        insert into bookings
          (request_id, application_id, profile_id, family_user_id, night_date, night_rate_eur, extra_hour_rate_eur,
           confirmed_at, created_at)
        select r.id, a.id, a.profile_id, r.family_user_id, r.night_date, a.night_rate_eur, a.extra_hour_rate_eur,
               ${at}::timestamptz, ${at}::timestamptz
        from care_request_applications a
        join care_requests r on r.id = a.request_id
        where a.id = ${applicationId} and a.status = 'retenue'
          and r.id = ${requestId} and r.family_user_id = ${userId}
        returning id
      `),
      bookingSetsTheStart(requestId, applicationId, now),
      acceptDeclinesOthers(requestId, applicationId, now),
      db.execute(acceptWithdrawsHersThatNight(requestId, at)),
      db.execute(sql`
        update payments p
        set booking_id = b.id, updated_at = ${at}::timestamptz
        from bookings b
        where b.request_id = ${requestId}
          and b.application_id = ${applicationId}
          and p.id = ${paymentId}
          and p.status = 'payee'
          and p.booking_id is null
      `),
      // Berceo's « excellente garde » in the booked answer's conversation (messagerie, D-87).
      db.execute(bonneGardeStatement(applicationId, at)),
    ]);

    const [booking] = made.rows;
    if (!booking) return { ok: false, reason: "conflit" };
    return { ok: true, bookingId: booking.id, declined: declined.map((a) => a.id) };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "conflit" };
    throw error;
  }
}

/**
 * `acceptAnswer`'s statement 1 holds this (JAM-306): the start the answer
 * proposes, or the family's when it proposes none, is ahead in Brussels.
 */
function proposedStartAhead(requestId: string): SQL {
  return sql`exists (
    select 1 from care_requests pr
    where pr.id = ${requestId}
      and (pr.night_date + coalesce(${careRequestApplications.proposedStartTime}, pr.start_time)) > (now() AT TIME ZONE ${TIME_ZONE})
  )`;
}

/**
 * `acceptAnswer`'s statement 3 (JAM-306): once the request holds its booking,
 * it becomes `attribuee` and takes the booked answer's proposed start. This is
 * the single place where a proposal becomes the night's start: `start_time` is
 * then the start the two sides agreed on, which each reader of a booked night
 * reads (the gardes, the reminder, the cancellation delay, the night's end,
 * the e-mails, the conversation, the back office), and `requested_start_time`
 * keeps the start the family asked for. An answer with no proposal changes
 * neither column. The right side of each `set` reads the row as it was.
 */
export function bookingSetsTheStart(requestId: string, applicationId: string, now: Date) {
  const proposed = sql`(
    select pa.proposed_start_time from care_request_applications pa
    where pa.id = ${applicationId} and pa.request_id = ${requestId} and pa.status = 'retenue'
  )`;
  return db
    .update(careRequests)
    .set({
      status: "attribuee",
      updatedAt: now,
      startTime: sql`coalesce(nullif(${proposed}, "start_time"), "start_time")`,
      requestedStartTime: sql`case when nullif(${proposed}, "start_time") is not null then "start_time" else "requested_start_time" end`,
    })
    .where(and(eq(careRequests.id, requestId), eq(careRequests.status, "ouverte"), bookingMade(requestId)));
}

/** Whether the request holds a booking: the batch's later statements act only once it does. */
function bookingMade(requestId: string): SQL {
  return sql`exists (select 1 from ${bookings} where ${bookings.requestId} = ${requestId})`;
}

/**
 * `acceptAnswer`'s statement 4: the other answers still waiting on the
 * request become `non_retenue` (returned, to be told), never the chosen one,
 * and only once the request holds its booking. Withdrawn and declined answers
 * are left as they are.
 */
export function acceptDeclinesOthers(requestId: string, applicationId: string, now: Date) {
  return db
    .update(careRequestApplications)
    .set({ status: "non_retenue", updatedAt: now })
    .where(
      and(
        eq(careRequestApplications.requestId, requestId),
        ne(careRequestApplications.id, applicationId),
        eq(careRequestApplications.status, "en_attente"),
        bookingMade(requestId),
      ),
    )
    .returning({ id: careRequestApplications.id });
}

/**
 * `acceptAnswer`'s statement 5: the booked professional's answers still
 * waiting on other requests of the booked night become `retiree`, silently
 * (D-73). The booking row names her and the night, so nothing happens until it
 * exists.
 */
export function acceptWithdrawsHersThatNight(requestId: string, at: string): SQL {
  return sql`
    update care_request_applications a
    set status = 'retiree', updated_at = ${at}::timestamptz
    from bookings b, care_requests r
    where b.request_id = ${requestId}
      and a.profile_id = b.profile_id
      and a.status = 'en_attente'
      and a.request_id <> ${requestId}
      and r.id = a.request_id
      and r.night_date = b.night_date
  `;
}

/** The booking made from one of her requests, if any: the request page links to it and shows its state. */
export async function bookingOfRequest(
  userId: string,
  requestId: string,
): Promise<{ id: string; status: BookingStatus } | null> {
  if (!UUID.test(requestId)) return null;
  const [row] = await db
    .select({ id: bookings.id, status: bookings.status })
    .from(bookings)
    .where(and(eq(bookings.requestId, requestId), eq(bookings.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

/**
 * A garde's stored status and, once cancelled, who it is recorded against,
 * how and when (cycle-de-garde-et-annulation, D-105, D-106). Both sides read
 * it; the state shown is `gardeState` in `src/lib/gardes/rules.ts`.
 */
export type GardeRecord = {
  status: BookingStatus;
  cancelledAt: Date | null;
  cancelledBy: CancellationAuthor | null;
  cancellationKind: CancellationKind | null;
  /** The reason the cancelling side chose (annulations-delai-et-motif); null for an absence or an older garde. */
  cancellationReason: CancellationReason | null;
  /** When the side reported absent contested the report: the garde is in « litige » (annulations-table). */
  disputedAt: Date | null;
};

const gardeColumns = {
  status: bookings.status,
  cancelledAt: bookings.cancelledAt,
  cancelledBy: bookings.cancelledBy,
  cancellationKind: bookings.cancellationKind,
  cancellationReason: bookings.cancellationReason,
  disputedAt: bookings.disputedAt,
};

/** The professional booked, as the family sees her (D-72: her phone, never her surname). */
export type BookedProfessional = {
  profileId: string;
  firstName: string;
  profession: Profession | null;
  photoId: string | null;
};

export type FamilyBooking = {
  id: string;
  request: RequestCard;
  nightRateEur: number;
  extraHourRateEur: number | null;
  confirmedAt: Date;
  garde: GardeRecord;
  professional: BookedProfessional;
};

const familyBookingColumns = {
  id: bookings.id,
  nightRateEur: bookings.nightRateEur,
  extraHourRateEur: bookings.extraHourRateEur,
  confirmedAt: bookings.confirmedAt,
  garde: gardeColumns,
  request: cardColumns,
  professional: {
    profileId: professionalProfiles.id,
    firstName: users.firstName,
    profession: professionalProfiles.profession,
    photoId,
  },
};

/** « Mes réservations »: her bookings, by night (the page splits coming and past). */
export async function familyBookings(userId: string): Promise<FamilyBooking[]> {
  return db
    .select(familyBookingColumns)
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(eq(bookings.familyUserId, userId))
    .orderBy(asc(careRequests.nightDate), asc(careRequests.startTime));
}

/** One of her bookings with the professional's phone (D-72), or null: another family's reads the same. */
export async function familyBooking(
  userId: string,
  id: string,
): Promise<(FamilyBooking & { phone: string | null }) | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({ ...familyBookingColumns, phone: users.phone })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(users, eq(users.id, professionalProfiles.userId))
    .where(and(eq(bookings.id, id), eq(bookings.familyUserId, userId)))
    .limit(1);
  return row ?? null;
}

export type ProfessionalBooking = {
  id: string;
  request: RequestCard;
  nightRateEur: number;
  extraHourRateEur: number | null;
  confirmedAt: Date;
  garde: GardeRecord;
};

const professionalBookingColumns = {
  id: bookings.id,
  nightRateEur: bookings.nightRateEur,
  extraHourRateEur: bookings.extraHourRateEur,
  confirmedAt: bookings.confirmedAt,
  garde: gardeColumns,
  request: cardColumns,
};

/** « Mes gardes »: her bookings, coming first by night, then past (the page splits them). No family identity. */
export async function professionalBookings(userId: string): Promise<ProfessionalBooking[]> {
  return db
    .select(professionalBookingColumns)
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .where(eq(professionalProfiles.userId, userId))
    .orderBy(asc(careRequests.nightDate), asc(careRequests.startTime));
}

/** The family, as the professional booked reads her on her booking: her names and phone (D-72). */
export type BookedFamily = {
  firstName: string;
  lastName: string;
  phone: string | null;
  address: BookingAddress | null;
};

/**
 * One of her bookings with the family's name, phone and address, or null:
 * another professional's booking reads the same as an unknown one. The
 * address comes from `src/lib/famille/`, live, gated by the same ownership,
 * and only while the garde is confirmed and its night not ended (D-110).
 */
export async function professionalBooking(
  userId: string,
  id: string,
): Promise<(ProfessionalBooking & { family: BookedFamily }) | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({
      ...professionalBookingColumns,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(users, eq(users.id, bookings.familyUserId))
    .where(and(eq(bookings.id, id), eq(professionalProfiles.userId, userId)))
    .limit(1);
  if (!row) return null;

  const { firstName, lastName, phone, ...booking } = row;
  return { ...booking, family: { firstName, lastName, phone, address: await bookingAddress(id, userId) } };
}
