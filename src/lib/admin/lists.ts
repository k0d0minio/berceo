import "server-only";

import { and, count, desc, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalProfiles,
  users,
  type CancellationAuthor,
  type CancellationKind,
  type CancellationReason,
  type CreditOrigin,
} from "@/db";
import { gardeCredits, grantCreditStatement, grantedHere } from "@/lib/credits/credits";
import { nightEnd as nightEndOf } from "@/lib/demandes/night-end";
import { TIME_ZONE } from "@/lib/demandes/rules";
import { gardeState, hoursBeforeStart, type GardeState } from "@/lib/gardes/rules";
import { bookingFees, type BookingFee } from "@/lib/paiements/payments";

import { fullName, journalInsertAfter, type Person } from "./journal";
import { LIST_PAGE_SIZE, UUID, type BookingFilter, type ReportFilter, type RequestFilter } from "./rules";

/**
 * The founders' lists (back-office-admin): every request, every booking, and
 * the reports (cancelled gardes and reported absences). Each overview block
 * counts with the very condition its list filters on (D-133), exported here
 * once, so the number and the list cannot disagree. Read-only but for
 * « Marquer comme traité » (D-139), which writes the booking's handled marker
 * and its journal entry in one statement, and « Accorder un crédit »
 * (annulations-back-office), which writes the credit, the marker on a litige
 * and the journal entry in one transaction.
 */

const familyUser = alias(users, "family_user");
const professionalUser = alias(users, "professional_user");

const localNow = sql`(now() AT TIME ZONE ${TIME_ZONE})`;
const nightStart = sql`(${careRequests.nightDate} + ${careRequests.startTime})`;
const nightEnd = nightEndOf(careRequests);

function pages(total: number): number {
  return Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/** Each request filter in SQL, as `displayStatus` reads it. */
export function requestCondition(filter: RequestFilter | null, familyUserId: string | null): SQL | undefined {
  const state: Record<RequestFilter, SQL> = {
    ouverte: sql`(${careRequests.status} = 'ouverte' AND ${nightStart} > ${localNow})`,
    passee: sql`(${careRequests.status} = 'ouverte' AND ${nightStart} <= ${localNow})`,
    attribuee: sql`${careRequests.status} = 'attribuee'`,
    annulee: sql`${careRequests.status} = 'annulee'`,
  };
  return and(
    filter ? state[filter] : undefined,
    familyUserId ? eq(careRequests.familyUserId, familyUserId) : undefined,
  );
}

export type AdminRequestRow = {
  id: string;
  nightDate: string;
  startTime: string;
  /** The start the family asked for, when the booked answer proposed another (JAM-306). */
  requestedStartTime?: string | null;
  postcode: string;
  locality: string;
  urgent: boolean;
  status: "ouverte" | "annulee" | "attribuee";
  familyUserId: string;
  family: string;
  familySuspended: boolean;
  answers: number;
  /** The family's optional reason (demande-motif-facultatif), shown under the row. */
  reason: string | null;
};

/** One page of requests, the latest night first. */
export async function readRequests(
  filter: RequestFilter | null,
  familyUserId: string | null,
  page: number,
): Promise<{ rows: AdminRequestRow[]; pages: number }> {
  const where = requestCondition(filter, familyUserId);
  const answers = sql<number>`(select count(*)::int from ${careRequestApplications} where ${careRequestApplications.requestId} = ${careRequests.id})`;
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: careRequests.id,
        nightDate: careRequests.nightDate,
        startTime: careRequests.startTime,
        requestedStartTime: careRequests.requestedStartTime,
        postcode: careRequests.postcode,
        locality: careRequests.locality,
        urgent: careRequests.urgent,
        status: careRequests.status,
        familyUserId: careRequests.familyUserId,
        familyFirst: familyUser.firstName,
        familyLast: familyUser.lastName,
        familySuspendedAt: familyUser.suspendedAt,
        answers,
        reason: careRequests.reason,
      })
      .from(careRequests)
      .innerJoin(familyUser, eq(familyUser.id, careRequests.familyUserId))
      .where(where)
      .orderBy(desc(careRequests.nightDate), desc(careRequests.startTime), desc(careRequests.id))
      .limit(LIST_PAGE_SIZE)
      .offset((page - 1) * LIST_PAGE_SIZE),
    db.select({ n: count() }).from(careRequests).where(where),
  ]);
  return {
    rows: rows.map(({ familyFirst, familyLast, familySuspendedAt, answers: n, ...row }) => ({
      ...row,
      family: fullName({ firstName: familyFirst, lastName: familyLast }),
      familySuspended: familySuspendedAt !== null,
      answers: Number(n),
    })),
    pages: pages(total.n),
  };
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

/**
 * Each booking filter in SQL, as `gardeState` reads it by the clock, and the
 * bookings an account is on, on either side. The account page's « gardes à
 * venir » and its deletion guard read `en-cours` for one account from here too.
 */
export function bookingCondition(filter: BookingFilter, accountId: string | null): SQL;
export function bookingCondition(filter: BookingFilter | null, accountId: string): SQL;
export function bookingCondition(filter: BookingFilter | null, accountId: string | null): SQL | undefined;
export function bookingCondition(filter: BookingFilter | null, accountId: string | null): SQL | undefined {
  const confirmed = sql`${bookings.status} = 'confirmee'`;
  const state: Record<BookingFilter, SQL> = {
    "en-cours": sql`(${confirmed} AND ${nightEnd} > ${localNow})`,
    "a-venir": sql`(${confirmed} AND ${nightStart} > ${localNow})`,
    commencee: sql`(${confirmed} AND ${nightStart} <= ${localNow} AND ${nightEnd} > ${localNow})`,
    terminee: sql`(${confirmed} AND ${nightEnd} <= ${localNow})`,
    annulee: sql`${bookings.status} = 'annulee'`,
  };
  return and(
    filter ? state[filter] : undefined,
    accountId
      ? sql`(${bookings.familyUserId} = ${accountId} OR ${bookings.profileId} IN (select id from professional_profiles where user_id = ${accountId}))`
      : undefined,
  );
}

export type AdminBookingRow = {
  id: string;
  nightDate: string;
  /** The garde's start: the start the two sides agreed on (JAM-306). */
  startTime: string;
  /** The start the family asked for, when the booked answer proposed another (JAM-306). */
  requestedStartTime?: string | null;
  nightRateEur: number;
  state: GardeState;
  family: { id: string; name: string; suspended: boolean };
  professional: { id: string; name: string; suspended: boolean };
  fee: BookingFee | null;
};

const bookingColumns = {
  id: bookings.id,
  status: bookings.status,
  nightDate: careRequests.nightDate,
  startTime: careRequests.startTime,
  requestedStartTime: careRequests.requestedStartTime,
  extraHours: careRequests.extraHours,
  nightRateEur: bookings.nightRateEur,
  familyId: familyUser.id,
  familyFirst: familyUser.firstName,
  familyLast: familyUser.lastName,
  familySuspendedAt: familyUser.suspendedAt,
  professionalId: professionalUser.id,
  professionalFirst: professionalUser.firstName,
  professionalLast: professionalUser.lastName,
  professionalSuspendedAt: professionalUser.suspendedAt,
};

/** How many bookings a filter holds: the overview's « Réservations en cours » with `en-cours`. */
export async function bookingCount(filter: BookingFilter | null): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .where(bookingCondition(filter, null));
  return row?.n ?? 0;
}

/** One page of bookings, the nearest night first. */
export async function readBookings(
  filter: BookingFilter | null,
  accountId: string | null,
  page: number,
  now: Date,
): Promise<{ rows: AdminBookingRow[]; pages: number }> {
  const where = bookingCondition(filter, accountId);
  const [rows, [total]] = await Promise.all([
    db
      .select(bookingColumns)
      .from(bookings)
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .innerJoin(familyUser, eq(familyUser.id, bookings.familyUserId))
      .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
      .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
      .where(where)
      .orderBy(sql`abs(${careRequests.nightDate} - current_date)`, desc(careRequests.nightDate), desc(bookings.id))
      .limit(LIST_PAGE_SIZE)
      .offset((page - 1) * LIST_PAGE_SIZE),
    db
      .select({ n: count() })
      .from(bookings)
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .where(where),
  ]);
  const fees = await bookingFees(rows.map((row) => row.id));
  return {
    rows: rows.map((row) => ({
      id: row.id,
      nightDate: row.nightDate,
      startTime: row.startTime,
      requestedStartTime: row.requestedStartTime,
      nightRateEur: row.nightRateEur,
      state: gardeState(row, now),
      family: {
        id: row.familyId,
        name: fullName({ firstName: row.familyFirst, lastName: row.familyLast }),
        suspended: row.familySuspendedAt !== null,
      },
      professional: {
        id: row.professionalId,
        name: fullName({ firstName: row.professionalFirst, lastName: row.professionalLast }),
        suspended: row.professionalSuspendedAt !== null,
      },
      fee: fees.get(row.id) ?? null,
    })),
    pages: pages(total.n),
  };
}

// ---------------------------------------------------------------------------
// Reports (« Signalements », D-139)
// ---------------------------------------------------------------------------

/**
 * A cancelled garde, by either side or by Berceo, or a reported absence;
 * « À traiter » until marked handled; « Litige » once the side reported
 * absent contested, handled or not (annulations-back-office).
 */
export function reportCondition(filter: ReportFilter): SQL | undefined {
  const narrow: Record<ReportFilter, SQL | undefined> = {
    "a-traiter": isNull(bookings.reportHandledAt),
    litige: isNotNull(bookings.disputedAt),
    tous: undefined,
  };
  return and(eq(bookings.status, "annulee"), narrow[filter]);
}

/** The overview's « Signalements à traiter ». */
export async function reportCount(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(bookings).where(reportCondition("a-traiter"));
  return row?.n ?? 0;
}

export type AdminReportRow = {
  id: string;
  nightDate: string;
  startTime: string;
  cancelledAt: Date;
  /** The side responsible: who cancelled, or who was absent; or Berceo (annulations-back-office). */
  side: CancellationAuthor;
  kind: CancellationKind;
  /** The reason the cancelling side chose (annulations-delai-et-motif); null for an absence or an older garde. */
  reason: CancellationReason | null;
  /** The founders' note on a cancellation for Berceo (annulations-back-office). */
  note: string | null;
  /** Whole hours from the cancellation to the start hour, for a cancellation; null for an absence. */
  hoursBefore: number | null;
  family: { id: string; name: string };
  professional: { id: string; name: string };
  fee: BookingFee | null;
  /** The origin of the garde's live credit (annulations-table, annulations-back-office); null when it has none. */
  creditOrigin: CreditOrigin | null;
  /** When the side reported absent contested the report: the garde is in « litige » (annulations-table). */
  disputedAt: Date | null;
  handled: { at: Date; by: string } | null;
};

const handledBy = alias(users, "handled_by");

/** One page of reports, the latest first. */
export async function readReports(
  filter: ReportFilter,
  page: number,
): Promise<{ rows: AdminReportRow[]; pages: number }> {
  const where = reportCondition(filter);
  const [rows, [total]] = await Promise.all([
    db
      .select({
        ...bookingColumns,
        cancelledAt: bookings.cancelledAt,
        side: bookings.cancelledBy,
        kind: bookings.cancellationKind,
        reason: bookings.cancellationReason,
        note: bookings.cancellationNote,
        disputedAt: bookings.disputedAt,
        handledAt: bookings.reportHandledAt,
        handledFirst: handledBy.firstName,
        handledLast: handledBy.lastName,
      })
      .from(bookings)
      .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
      .innerJoin(familyUser, eq(familyUser.id, bookings.familyUserId))
      .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
      .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
      .leftJoin(handledBy, eq(handledBy.id, bookings.reportHandledBy))
      .where(where)
      .orderBy(desc(bookings.cancelledAt), desc(bookings.id))
      .limit(LIST_PAGE_SIZE)
      .offset((page - 1) * LIST_PAGE_SIZE),
    db.select({ n: count() }).from(bookings).where(where),
  ]);
  const ids = rows.map((row) => row.id);
  const [fees, live] = await Promise.all([bookingFees(ids), gardeCredits(ids)]);
  return {
    rows: rows.flatMap((row) =>
      row.cancelledAt && row.side && row.kind
        ? [
            {
              id: row.id,
              nightDate: row.nightDate,
              startTime: row.startTime,
              cancelledAt: row.cancelledAt,
              side: row.side,
              kind: row.kind,
              reason: row.reason,
              note: row.note,
              hoursBefore:
                row.kind === "annulation" ? hoursBeforeStart(row.nightDate, row.startTime, row.cancelledAt) : null,
              family: { id: row.familyId, name: fullName({ firstName: row.familyFirst, lastName: row.familyLast }) },
              professional: {
                id: row.professionalId,
                name: fullName({ firstName: row.professionalFirst, lastName: row.professionalLast }),
              },
              fee: fees.get(row.id) ?? null,
              creditOrigin: live.get(row.id)?.origin ?? null,
              disputedAt: row.disputedAt,
              handled: row.handledAt
                ? {
                    at: row.handledAt,
                    by: row.handledFirst === null ? "" : fullName({ firstName: row.handledFirst, lastName: row.handledLast ?? "" }),
                  }
                : null,
            },
          ]
        : [],
    ),
    pages: pages(total.n),
  };
}

/**
 * « Marquer comme traité »: the handled marker on a cancelled garde nobody has
 * marked, and its journal entry naming the side responsible (the family for a
 * cancellation by Berceo), in one statement.
 * Not reversible; a second founder's click changes nothing.
 */
export async function markReportHandled(bookingId: string, admin: Person, now: Date): Promise<boolean> {
  if (!UUID.test(bookingId)) return false;
  const result = await journalInsertAfter(
    sql`handled as (
      update bookings
      set report_handled_at = ${now.toISOString()}::timestamptz, report_handled_by = ${admin.id}::uuid
      where id = ${bookingId} and status = 'annulee' and report_handled_at is null
      returning id, family_user_id, profile_id, cancelled_by, night_date
    ),
    subject as (
      select h.night_date, u.id, trim(u.first_name || ' ' || u.last_name) as name
      from handled h
      join professional_profiles p on p.id = h.profile_id
      join users u on u.id = case when h.cancelled_by = 'professionnelle' then p.user_id else h.family_user_id end
    )`,
    "subject",
    {
      action: "signalement_traite",
      subject: { id: sql`subject.id`, name: sql`subject.name` },
      admin,
      detail: sql`to_char(subject.night_date, 'YYYY-MM-DD')`,
      at: now,
    },
  );
  return result.rows.length > 0;
}

/**
 * « Accorder un crédit » (annulations-back-office): a credit of the fee for the
 * family, on a garde in litige or whose fee her own cancellation or absence
 * left at Berceo, with the founder's note. One transaction writes the credit
 * (`grantCreditStatement`, which holds the rule), marks a litige handled, and
 * writes one journal entry naming the family, the night and the amount. A
 * second click or a second founder writes nothing. The caller has checked
 * the note.
 */
export async function grantFeeCredit(bookingId: string, admin: Person, note: string, now: Date): Promise<boolean> {
  if (!UUID.test(bookingId) || !UUID.test(admin.id) || note.trim().length === 0) return false;
  const granted = grantedHere(bookingId, admin.id, now);
  const [credit] = await db.batch([
    db.execute<{ id: string }>(grantCreditStatement(bookingId, admin.id, note, now)),
    db.execute(sql`
      update bookings
      set report_handled_at = ${now.toISOString()}::timestamptz, report_handled_by = ${admin.id}::uuid
      where id = ${bookingId} and disputed_at is not null and report_handled_at is null and ${granted}
    `),
    journalInsertAfter(
      sql`subject as (
        select b.night_date, u.id, trim(u.first_name || ' ' || u.last_name) as name, p.amount_cents
        from bookings b
        join users u on u.id = b.family_user_id
        join payments p on p.booking_id = b.id and p.status = 'payee'
        where b.id = ${bookingId} and ${granted}
      )`,
      "subject",
      {
        action: "credit_accorde",
        subject: { id: sql`subject.id`, name: sql`subject.name` },
        admin,
        detail: sql`to_char(subject.night_date, 'YYYY-MM-DD') || ', '
          || replace(to_char(subject.amount_cents / 100.0, 'FM9999990.00'), '.', ',') || ' €, ' || ${note}::text`,
        at: now,
      },
    ),
  ]);
  return credit.rows.length > 0;
}
