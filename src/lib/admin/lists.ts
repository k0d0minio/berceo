import "server-only";

import { and, count, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalProfiles,
  users,
  type BookingSide,
  type CancellationKind,
} from "@/db";
import { NIGHT_HOURS, TIME_ZONE } from "@/lib/demandes/rules";
import { gardeState, type GardeState } from "@/lib/gardes/rules";
import { bookingFees, type BookingFee } from "@/lib/paiements/payments";

import { fullName, type Person } from "./journal";
import { LIST_PAGE_SIZE, UUID, type BookingFilter, type ReportFilter, type RequestFilter } from "./rules";

/**
 * The founders' lists (back-office-admin): every request, every booking, and
 * the reports (cancelled gardes and reported absences). Each overview block
 * counts with the very condition its list filters on (D-133), exported here
 * once, so the number and the list cannot disagree. Read-only but for
 * « Marquer comme traité » (D-139), which writes the booking's handled marker
 * and its journal entry in one statement.
 */

const familyUser = alias(users, "family_user");
const professionalUser = alias(users, "professional_user");

const localNow = sql`(now() AT TIME ZONE ${TIME_ZONE})`;
const nightStart = sql`(${careRequests.nightDate} + ${careRequests.startTime})`;
const nightEnd = sql`(${nightStart} + make_interval(hours => ${NIGHT_HOURS}::int))`;

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
  postcode: string;
  locality: string;
  urgent: boolean;
  status: "ouverte" | "annulee" | "attribuee";
  familyUserId: string;
  family: string;
  familySuspended: boolean;
  answers: number;
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
        postcode: careRequests.postcode,
        locality: careRequests.locality,
        urgent: careRequests.urgent,
        status: careRequests.status,
        familyUserId: careRequests.familyUserId,
        familyFirst: familyUser.firstName,
        familyLast: familyUser.lastName,
        familySuspendedAt: familyUser.suspendedAt,
        answers,
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

/** Each booking filter in SQL, as `gardeState` reads it by the clock. */
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
  startTime: string;
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

/** A cancelled garde, by either side, or a reported absence; « À traiter » until marked handled. */
export function reportCondition(filter: ReportFilter): SQL | undefined {
  return and(eq(bookings.status, "annulee"), filter === "a-traiter" ? isNull(bookings.reportHandledAt) : undefined);
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
  /** The side responsible: who cancelled, or who was absent. */
  side: BookingSide;
  kind: CancellationKind;
  family: { id: string; name: string };
  professional: { id: string; name: string };
  fee: BookingFee | null;
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
  const fees = await bookingFees(rows.map((row) => row.id));
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
              family: { id: row.familyId, name: fullName({ firstName: row.familyFirst, lastName: row.familyLast }) },
              professional: {
                id: row.professionalId,
                name: fullName({ firstName: row.professionalFirst, lastName: row.professionalLast }),
              },
              fee: fees.get(row.id) ?? null,
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
 * marked, and its journal entry naming the side responsible, in one statement.
 * Not reversible; a second founder's click changes nothing.
 */
export async function markReportHandled(bookingId: string, admin: Person, now: Date): Promise<boolean> {
  if (!UUID.test(bookingId)) return false;
  const at = now.toISOString();
  const result = await db.execute<{ id: string }>(sql`
    with handled as (
      update bookings
      set report_handled_at = ${at}::timestamptz, report_handled_by = ${admin.id}::uuid
      where id = ${bookingId} and status = 'annulee' and report_handled_at is null
      returning id, family_user_id, profile_id, cancelled_by, night_date
    ),
    subject as (
      select h.night_date, u.id, trim(u.first_name || ' ' || u.last_name) as name
      from handled h
      join professional_profiles p on p.id = h.profile_id
      join users u on u.id = case when h.cancelled_by = 'famille' then h.family_user_id else p.user_id end
    )
    insert into admin_journal (occurred_at, action, subject_user_id, subject_name, admin_user_id, admin_name, detail)
    select ${at}::timestamptz, 'signalement_traite'::admin_action, subject.id, subject.name,
           ${admin.id}::uuid, ${admin.name}::text, to_char(subject.night_date, 'YYYY-MM-DD')
    from subject
    returning id
  `);
  return result.rows.length > 0;
}
