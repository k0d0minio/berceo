import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequests,
  db,
  professionalProfiles,
  users,
  type BookingSide,
  type CancellationKind,
} from "@/db";
import { addDays, brusselsNow, NIGHT_HOURS, TIME_ZONE, URGENT_LAST_DAY } from "@/lib/demandes/rules";
import {
  cancelBookedRequestStatement,
  liveRequestOn,
  publishRequest,
  UUID,
  type PublishResult,
} from "@/lib/demandes/requests";
import { bookingFees, refundFee, type BookingFee } from "@/lib/paiements/payments";

import { ABSENCE_HOURS_AFTER_END, canRepublish, otherSide, reminderNight } from "./rules";

/**
 * The life of a garde after its booking (cycle-de-garde-et-annulation): the
 * only writes of a booking's status columns. Cancelling (D-105) and reporting
 * an absence (D-106) are one statement each, which also cancels the booked
 * request (`src/lib/demandes/`, D-110); the rules of ./rules.ts are held again
 * in its SQL, so a second click, the other side at the same moment, or a page
 * left open past the start hour changes nothing. The professional's
 * cancellation refunds the fee through `refundFee` after the statement commits
 * (D-2, D-94); a failed refund leaves the cancellation standing and the fee
 * `payee`, for the founders' button (D-101). The creation of a booking and
 * both sides' reads stay in `src/lib/reservations/bookings.ts`.
 */

/** Logs a failure with ids only: Drizzle's and Stripe's messages can carry the query's values. */
export function logError(what: string, context: Record<string, unknown>, error?: unknown): void {
  console.error(`[gardes] ${what}`, {
    ...context,
    error: error instanceof Error ? error.name : error === undefined ? undefined : typeof error,
  });
}

/** Brussels wall-clock now, the form `night_date + start_time` compares with. */
const localNow = sql`(now() AT TIME ZONE ${TIME_ZONE})`;

/** Only the side's own garde: the family who booked it, or the professional booked. */
function partyOf(side: BookingSide, userId: string) {
  return side === "famille"
    ? sql`b.family_user_id = ${userId}`
    : sql`exists (select 1 from professional_profiles p where p.id = b.profile_id and p.user_id = ${userId})`;
}

export type GardeWrite = { ok: true } | { ok: false };

/**
 * Cancels her or his confirmed garde before its start hour (D-105): recorded
 * against `side`, with who clicked and when; its request is cancelled in the
 * same statement. A professional's cancellation then refunds the family's fee
 * (D-2). Returns ok only to the call that cancelled it.
 */
export async function cancelGarde(
  side: BookingSide,
  userId: string,
  bookingId: string,
  now: Date,
): Promise<GardeWrite> {
  if (!UUID.test(bookingId)) return { ok: false };
  const at = now.toISOString();
  const [cancelled] = await db.batch([
    db.execute<{ id: string }>(sql`
      update bookings b
      set status = 'annulee', cancelled_at = ${at}::timestamptz, cancelled_by = ${side}::booking_side,
          cancelled_by_user_id = ${userId}::uuid, cancellation_kind = 'annulation'
      from care_requests r
      where b.id = ${bookingId}
        and r.id = b.request_id
        and b.status = 'confirmee'
        and (r.night_date + r.start_time) > ${localNow}
        and ${partyOf(side, userId)}
      returning b.id
    `),
    db.execute(cancelBookedRequestStatement(bookingId, at)),
  ]);
  if (cancelled.rows.length === 0) return { ok: false };

  if (side === "professionnelle") await refundOnCancellation(bookingId, now);
  return { ok: true };
}

/** The fee of a garde the professional cancelled, refunded in full (D-2); a failure is the founders' to retry. */
async function refundOnCancellation(bookingId: string, now: Date): Promise<void> {
  try {
    const fee = (await bookingFees([bookingId])).get(bookingId);
    if (!fee || fee.status !== "payee") return;
    const refunded = await refundFee(fee.id, "annulation_professionnelle", now);
    if (!refunded.ok) logError("fee not refunded on a professional's cancellation", { bookingId, reason: refunded.reason });
  } catch (error) {
    logError("fee not refunded on a professional's cancellation", { bookingId }, error);
  }
}

/**
 * Reports the other side absent (D-106), from the start hour until 24 hours
 * after the night ends: the garde is cancelled against the absent side, kind
 * `absence`, with who reported it and when; its request is cancelled in the
 * same statement. Nothing is refunded: the founders decide (D-101).
 */
export async function reportAbsence(
  side: BookingSide,
  userId: string,
  bookingId: string,
  now: Date,
): Promise<GardeWrite> {
  if (!UUID.test(bookingId)) return { ok: false };
  const at = now.toISOString();
  const window = NIGHT_HOURS + ABSENCE_HOURS_AFTER_END;
  const [reported] = await db.batch([
    db.execute<{ id: string }>(sql`
      update bookings b
      set status = 'annulee', cancelled_at = ${at}::timestamptz, cancelled_by = ${otherSide(side)}::booking_side,
          cancelled_by_user_id = ${userId}::uuid, cancellation_kind = 'absence'
      from care_requests r
      where b.id = ${bookingId}
        and r.id = b.request_id
        and b.status = 'confirmee'
        and (r.night_date + r.start_time) <= ${localNow}
        and (r.night_date + r.start_time + make_interval(hours => ${window}::int)) > ${localNow}
        and ${partyOf(side, userId)}
      returning b.id
    `),
    db.execute(cancelBookedRequestStatement(bookingId, at)),
  ]);
  return reported.rows.length > 0 ? { ok: true } : { ok: false };
}

export type RepublishResult =
  | { ok: true; id: string; urgent: boolean }
  | { ok: false; reason: "nonModifiable" | "commune" }
  | { ok: false; reason: "doublon"; existing: string | null };

/**
 * « Republier ma demande » on one of her cancelled gardes (D-107): a new
 * request for the same night, start, children and age, published like any
 * other (`publishRequest`: her profile's commune, D-63), urgent when the night
 * is tonight or tomorrow (D-60), sent to nobody in priority. Refused once the
 * night has started; a live request of hers that night (open, or booked again)
 * is returned instead, so she never holds two for one night.
 */
export async function republishGarde(userId: string, bookingId: string, now: Date): Promise<RepublishResult> {
  if (!UUID.test(bookingId)) return { ok: false, reason: "nonModifiable" };
  const [row] = await db
    .select({
      status: bookings.status,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      children: careRequests.children,
      babyAgeValue: careRequests.babyAgeValue,
      babyAgeUnit: careRequests.babyAgeUnit,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .where(and(eq(bookings.id, bookingId), eq(bookings.familyUserId, userId)))
    .limit(1);
  if (!row || !canRepublish(row, now)) return { ok: false, reason: "nonModifiable" };
  // Her night already has a live request (open, or booked again since): she lands on it.
  const live = await liveRequestOn(userId, row.nightDate);
  if (live) return { ok: false, reason: "doublon", existing: live };

  const values = {
    nightDate: row.nightDate,
    startTime: row.startTime,
    children: row.children,
    babyAgeValue: row.babyAgeValue,
    babyAgeUnit: row.babyAgeUnit,
  };
  const urgent = values.nightDate <= addDays(brusselsNow(now).date, URGENT_LAST_DAY);
  const published: PublishResult = await publishRequest(userId, values, urgent, now);
  if (published.ok) return { ok: true, id: published.id, urgent };
  if (published.reason === "commune") return { ok: false, reason: "commune" };
  return { ok: false, reason: "doublon", existing: await liveRequestOn(userId, values.nightDate) };
}

// ---------------------------------------------------------------------------
// The reminder of the day before (D-108)
// ---------------------------------------------------------------------------

/**
 * Claims every confirmed garde of tomorrow's night not yet reminded, marking
 * it in the same statement, so a second call the same day finds none.
 */
export async function claimReminders(now: Date): Promise<string[]> {
  const claimed = await db
    .update(bookings)
    .set({ reminderSentAt: now })
    .where(
      and(
        eq(bookings.status, "confirmee"),
        sql`${bookings.reminderSentAt} IS NULL`,
        eq(bookings.nightDate, reminderNight(now)),
      ),
    )
    .returning({ id: bookings.id });
  return claimed.map((row) => row.id);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

const familyUser = alias(users, "family_user");
const professionalUser = alias(users, "professional_user");

/** What the e-mails of a garde need: both sides' address and first name, the night, how it ended. */
export type GardeNotice = {
  id: string;
  nightDate: string;
  startTime: string;
  cancelledBy: BookingSide | null;
  cancellationKind: CancellationKind | null;
  family: { email: string; firstName: string };
  professional: { email: string; firstName: string };
};

export async function gardeNotice(bookingId: string): Promise<GardeNotice | null> {
  const [row] = await db
    .select({
      id: bookings.id,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      cancelledBy: bookings.cancelledBy,
      cancellationKind: bookings.cancellationKind,
      family: { email: familyUser.email, firstName: familyUser.firstName },
      professional: { email: professionalUser.email, firstName: professionalUser.firstName },
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(familyUser, eq(familyUser.id, bookings.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  return row ?? null;
}

/** The fee of one of her gardes, for the fee line of her page. */
export async function gardeFee(bookingId: string): Promise<BookingFee | null> {
  return (await bookingFees([bookingId])).get(bookingId) ?? null;
}

/** A reported absence, as the founders read it (D-106): both full names, who reported, the fee. */
export type AbsenceRow = {
  id: string;
  nightDate: string;
  startTime: string;
  reportedAt: Date;
  /** The side recorded absent; the other one reported it. */
  absent: BookingSide;
  family: string;
  professional: string;
  fee: BookingFee | null;
};

/** How many absences the list holds, for the admin home's link. */
export async function absenceCount(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(bookings).where(eq(bookings.cancellationKind, "absence"));
  return row?.n ?? 0;
}

/** Every reported absence, newest first (the list is read-only; the refund is on /admin/paiements). */
export async function reportedAbsences(): Promise<AbsenceRow[]> {
  const rows = await db
    .select({
      id: bookings.id,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      reportedAt: bookings.cancelledAt,
      absent: bookings.cancelledBy,
      familyFirst: familyUser.firstName,
      familyLast: familyUser.lastName,
      professionalFirst: professionalUser.firstName,
      professionalLast: professionalUser.lastName,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(familyUser, eq(familyUser.id, bookings.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(eq(bookings.cancellationKind, "absence"))
    .orderBy(desc(bookings.cancelledAt));
  const fees = await bookingFees(rows.map((row) => row.id));
  return rows.flatMap((row) =>
    row.reportedAt && row.absent
      ? [
          {
            id: row.id,
            nightDate: row.nightDate,
            startTime: row.startTime,
            reportedAt: row.reportedAt,
            absent: row.absent,
            family: `${row.familyFirst} ${row.familyLast}`.trim(),
            professional: `${row.professionalFirst} ${row.professionalLast}`.trim(),
            fee: fees.get(row.id) ?? null,
          },
        ]
      : [],
  );
}
