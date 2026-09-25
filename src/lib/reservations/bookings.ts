import "server-only";

import { and, asc, eq, exists, isNull, ne, sql } from "drizzle-orm";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  payments,
  professionalProfiles,
  users,
  type Profession,
} from "@/db";
import { cardColumns, isUniqueViolation, nightAhead, UUID, type RequestCard } from "@/lib/demandes/requests";
import { bookingAddress, familyHasAddress, type BookingAddress } from "@/lib/famille/profile";
import { bonneGardeStatement } from "@/lib/messagerie/conversations";

import { photoId } from "./answers";
import { acceptRefusal, type AcceptRefusal } from "./rules";

/**
 * Every read and write of a booking. Accepting an answer is the one write, in
 * one transaction; the reads give each side only its own bookings, and the
 * professional reads the family's name, phone and address only on her own
 * booking (D-15, D-72). « Accepter et réserver » opens the fee's Checkout
 * (`src/lib/paiements/`); only a paid payment books, through `acceptAnswer`
 * (D-90).
 */

export type AcceptCheck =
  | { ok: true; nightDate: string; startTime: string; nightRateEur: number }
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
      answerStatus: careRequestApplications.status,
      nightRateEur: careRequestApplications.nightRateEur,
      profileStatus: professionalProfiles.status,
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
      answer: { status: facts.answerStatus, profileStatus: facts.profileStatus },
      hasAddress: await familyHasAddress(userId),
    },
    now,
  );
  if (refusal) return { ok: false, reason: refusal };
  return { ok: true, nightDate: facts.nightDate, startTime: facts.startTime, nightRateEur: facts.nightRateEur };
}

export type AcceptResult =
  | { ok: true; bookingId: string; declined: string[] }
  | { ok: false; reason: AcceptRefusal | "introuvable" | "conflit" };

/**
 * The booking a paid fee makes (D-90). The rules are read first for a precise
 * answer, then the batch holds them again, statement by statement, in one
 * transaction, the payment row locked first:
 *
 * 1. the chosen answer becomes `retenue`, only if it still waits, its
 *    professional is still validated, the request is hers, open and ahead,
 *    and `paymentId` is her fee for this very answer, paid;
 * 2. the booking is made from that answer (its rate, D-74), only if step 1
 *    took; the unique indexes refuse a second booking for the request or for
 *    her that night, which rolls the whole batch back;
 * 3. the request becomes `attribuee`, 4. the other waiting answers on it
 *    `non_retenue` (returned, to be told), 5. her waiting answers on other
 *    requests that night `retiree` (D-73), 6. the payment points at the
 *    booking: each only if the booking exists; 7. Berceo's « excellente
 *    garde » in the booked answer's conversation (messagerie).
 *
 * Two payments racing on one request, or two requests booking one
 * professional for one night, end with one booking and a « conflit »; the
 * caller refunds the loser (D-91).
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

  const booked = sql`exists (select 1 from ${bookings} where ${bookings.requestId} = ${requestId})`;
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
            // The click never books: only her paid fee for this answer (D-90).
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
                  ),
                ),
            ),
          ),
        )
        .returning({ id: careRequestApplications.id }),
      db.execute<{ id: string }>(sql`
        insert into bookings
          (request_id, application_id, profile_id, family_user_id, night_date, night_rate_eur, confirmed_at, created_at)
        select r.id, a.id, a.profile_id, r.family_user_id, r.night_date, a.night_rate_eur,
               ${at}::timestamptz, ${at}::timestamptz
        from care_request_applications a
        join care_requests r on r.id = a.request_id
        where a.id = ${applicationId} and a.status = 'retenue'
          and r.id = ${requestId} and r.family_user_id = ${userId}
        returning id
      `),
      db
        .update(careRequests)
        .set({ status: "attribuee", updatedAt: now })
        .where(and(eq(careRequests.id, requestId), eq(careRequests.status, "ouverte"), booked)),
      db
        .update(careRequestApplications)
        .set({ status: "non_retenue", updatedAt: now })
        .where(
          and(
            eq(careRequestApplications.requestId, requestId),
            ne(careRequestApplications.id, applicationId),
            eq(careRequestApplications.status, "en_attente"),
            booked,
          ),
        )
        .returning({ id: careRequestApplications.id }),
      db.execute(sql`
        update care_request_applications a
        set status = 'retiree', updated_at = ${at}::timestamptz
        from bookings b, care_requests r
        where b.request_id = ${requestId}
          and a.profile_id = b.profile_id
          and a.status = 'en_attente'
          and a.request_id <> ${requestId}
          and r.id = a.request_id
          and r.night_date = b.night_date
      `),
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

/** The booking made from one of her requests, if any: the request page links to it. */
export async function bookingOfRequest(userId: string, requestId: string): Promise<string | null> {
  if (!UUID.test(requestId)) return null;
  const [row] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.requestId, requestId), eq(bookings.familyUserId, userId)))
    .limit(1);
  return row?.id ?? null;
}

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
  confirmedAt: Date;
  professional: BookedProfessional;
};

const familyBookingColumns = {
  id: bookings.id,
  nightRateEur: bookings.nightRateEur,
  confirmedAt: bookings.confirmedAt,
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
  confirmedAt: Date;
};

const professionalBookingColumns = {
  id: bookings.id,
  nightRateEur: bookings.nightRateEur,
  confirmedAt: bookings.confirmedAt,
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
 * address comes from `src/lib/famille/`, live, gated by the same ownership.
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
