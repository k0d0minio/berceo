/**
 * The rules of a garde that do not need the database (D-105 to D-111): its
 * state read from the night and the clock, when each side may cancel it or
 * report the other absent, when the family may republish, when the professional
 * reads the address, what the founders' table does with the fee
 * (annulations-table), what the fee line says, and when the reminder leaves.
 * Pure, so the pages, the server functions, the reminder route and the tests
 * read the same rules; `./gardes.ts` holds each of them again in the SQL of the
 * write it governs.
 *
 * Dates and times are Brussels wall-clock values, as in `src/lib/demandes/rules.ts`,
 * which also holds the night's end the conversation closes on (D-89) and the
 * other side: « Terminée » and the address (D-110) read that same end.
 */

import type {
  BookingSide,
  BookingStatus,
  CancellationAuthor,
  CancellationKind,
  CancellationReason,
  CreditOrigin,
  PaymentStatus,
} from "@/db/schema";
import { addDays, brusselsNow, endTime, hasNightEnded, hasNightStarted, toHourMinute } from "@/lib/demandes/rules";

/** What each side sees (D-17): the stored `confirmee` split by the clock, or `annulee`. */
export type GardeState = "a_venir" | "en_cours" | "terminee" | "annulee";

export type GardeFacts = { status: BookingStatus; nightDate: string; startTime: string; extraHours: number };

/** An absence can be reported until 24 hours after the night ends (D-106). */
export const ABSENCE_HOURS_AFTER_END = 24;

/** The side reported absent can contest the report for 24 hours after it (annulations-table). */
export const CONTEST_HOURS = 24;

/**
 * The founders' cancellation delay (annulations-delai-et-motif, the answers
 * [9.2]): a cancellation this many hours or fewer before the start hour is
 * late. 24 until the founders change it in `app_settings`, in whole hours from
 * 1 to 168, a week.
 */
export const CANCELLATION_DELAY_HOURS = 24;
export const CANCELLATION_DELAY_MIN = 1;
export const CANCELLATION_DELAY_MAX = 168;

/** The reminder of the day before leaves between 10:00 and 10:59 in Brussels (D-108). */
export const REMINDER_HOUR = 10;

/** `YYYY-MM-DDTHH:MM`, the form every comparison below uses. */
function stamp(date: string, time: string): string {
  return `${date}T${toHourMinute(time)}`;
}

function nowStamp(now: Date): string {
  const here = brusselsNow(now);
  return stamp(here.date, here.time);
}

/** The last moment an absence can be reported: the night's end plus 24 hours. */
export function absenceDeadline(nightDate: string, startTime: string, extraHours: number): string {
  return stamp(addDays(nightDate, 2), endTime(startTime, extraHours));
}

/** The garde's state at `now`, never stored (D-109). */
export function gardeState(garde: GardeFacts, now: Date): GardeState {
  if (garde.status === "annulee") return "annulee";
  if (!hasNightStarted(garde.nightDate, garde.startTime, now)) return "a_venir";
  return hasNightEnded(garde.nightDate, garde.startTime, garde.extraHours, now) ? "terminee" : "en_cours";
}

/** Either side cancels a confirmed garde until its start hour (D-105). */
export function canCancel(garde: GardeFacts, now: Date): boolean {
  return gardeState(garde, now) === "a_venir";
}

/**
 * A founder cancels a confirmed garde for Berceo (annulations-back-office)
 * until the end of its night: before its start, or while it is under way.
 */
export function canCancelForBerceo(garde: GardeFacts, now: Date): boolean {
  const state = gardeState(garde, now);
  return state === "a_venir" || state === "en_cours";
}

/** Whether `value` is a delay the founders may set: a whole number of hours from 1 to 168. */
export function isCancellationDelay(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= CANCELLATION_DELAY_MIN &&
    value <= CANCELLATION_DELAY_MAX
  );
}

/**
 * The moment a cancellation becomes late: `delayHours` wall-clock hours before
 * the start hour, in Brussels, like every other deadline here.
 */
export function lateCancellationFrom(nightDate: string, startTime: string, delayHours: number): string {
  const [y, m, d] = nightDate.split("-").map(Number);
  const [hour, minute] = toHourMinute(startTime).split(":").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d, hour - delayHours, minute));
  return at.toISOString().slice(0, 16);
}

/**
 * The whole hours from the moment `at` to the start hour, in Brussels wall-clock
 * time, rounded down: what the founders read on « Signalements »
 * (annulations-back-office). Negative once the night has started.
 */
export function hoursBeforeStart(nightDate: string, startTime: string, at: Date): number {
  const start = Date.parse(`${stamp(nightDate, startTime)}:00Z`);
  const moment = Date.parse(`${nowStamp(at)}:00Z`);
  return Math.floor((start - moment) / 3_600_000);
}

/** Whether the moment `at` falls `delayHours` or fewer before the start hour, or after it. */
export function isWithinDelay(nightDate: string, startTime: string, at: Date, delayHours: number): boolean {
  return nowStamp(at) >= lateCancellationFrom(nightDate, startTime, delayHours);
}

/**
 * Whether a cancellation at `now` falls inside the founders' delay: the garde
 * may still be cancelled, and its start is `delayHours` or fewer away. The
 * family's cancel dialog reads it to say what happens to her fee.
 */
export function isLateCancellation(garde: GardeFacts, now: Date, delayHours: number): boolean {
  if (!canCancel(garde, now)) return false;
  return isWithinDelay(garde.nightDate, garde.startTime, now, delayHours);
}

/**
 * The reasons each side chooses from when it cancels (annulations-delai-et-motif,
 * D-20: no free text). The words are `gardes.motifs`.
 */
export const CANCELLATION_REASONS = {
  famille: ["plus_besoin", "imprevu", "autre_solution", "autre"],
  professionnelle: ["malade", "empechement", "indisponible", "autre"],
} as const satisfies Record<BookingSide, readonly CancellationReason[]>;

/** Whether `value` is one of `side`'s reasons: the server's check of what the dialog sent. */
export function isReasonOf(side: BookingSide, value: unknown): value is CancellationReason {
  return (CANCELLATION_REASONS[side] as readonly unknown[]).includes(value);
}

/** From the start hour until 24 hours after the night ends, either side reports the other absent (D-106). */
export function canReportAbsence(garde: GardeFacts, now: Date): boolean {
  if (garde.status !== "confirmee") return false;
  if (!hasNightStarted(garde.nightDate, garde.startTime, now)) return false;
  return nowStamp(now) < absenceDeadline(garde.nightDate, garde.startTime, garde.extraHours);
}

/** After any cancelled garde whose night has not started, the family may publish it again (D-107). */
export function canRepublish(garde: GardeFacts, now: Date): boolean {
  return garde.status === "annulee" && !hasNightStarted(garde.nightDate, garde.startTime, now);
}

/** The professional reads the family's address on a confirmed garde until the night ends (D-110). */
export function isAddressVisible(garde: GardeFacts, now: Date): boolean {
  return garde.status === "confirmee" && !hasNightEnded(garde.nightDate, garde.startTime, garde.extraHours, now);
}

/** Whether the reminder may leave now: 10:00 to 10:59 in Brussels. */
export function isReminderTime(now: Date): boolean {
  return brusselsNow(now).hour === REMINDER_HOUR;
}

/** The night the reminder sent today is about: tomorrow's, in Brussels. */
export function reminderNight(now: Date): string {
  return addDays(brusselsNow(now).date, 1);
}

export type Cancellation = { by: CancellationAuthor; kind: CancellationKind };

/** What the founders' table does with a garde's fee (the answers [9.2, 9.3]). */
export type FeeOutcome = "credit" | "conserve" | "litige" | "rien";

/** One end of a garde, as the table reads it. */
export type TableFacts = {
  /** The side responsible (who cancelled, or who was absent), or Berceo. */
  by: CancellationAuthor;
  kind: CancellationKind;
  nightDate: string;
  startTime: string;
  /** When the garde was cancelled, or the absence reported. */
  at: Date;
  /** The side reported absent contested the report. */
  disputed: boolean;
  /** The fee was paid and is still held: no fee (a garde booked before it existed), nothing to do. */
  paid: boolean;
};

/**
 * The line of the founders' table that applies (annulations-table, the
 * answers [9.2, 9.3]), with the delay of the settings:
 *
 * - The family cancels more than the delay before the start: a credit.
 * - The family cancels within the delay: the fee stays at Berceo.
 * - The professional cancels, at any delay: a credit.
 * - The professional is reported absent: a credit.
 * - The family is reported absent, or the garde could not start at her home: the fee stays.
 * - The absent side contests the report: « litige », no credit, the founders decide.
 * - Berceo cancels: a credit.
 *
 * A cancellation « d'un commun accord » follows the side who clicks. `./gardes.ts`
 * holds the same lines again in the SQL of the statement that ends the garde.
 */
export function outcomeOf(facts: TableFacts, delayHours: number): FeeOutcome {
  if (facts.kind === "absence" && facts.disputed) return "litige";
  if (!facts.paid) return "rien";
  if (facts.by === "berceo" || facts.by === "professionnelle") return "credit";
  if (facts.kind === "absence") return "conserve";
  return isWithinDelay(facts.nightDate, facts.startTime, facts.at, delayHours) ? "conserve" : "credit";
}

/** Why the credit of a table line exists: its `credit_origin`. */
export function creditOriginOf(by: CancellationAuthor, kind: CancellationKind): CreditOrigin {
  if (by === "berceo") return "annulation_berceo";
  if (by === "famille") return "annulation_famille";
  return kind === "absence" ? "absence_professionnelle" : "annulation_professionnelle";
}

/** What a garde page reads to decide whether the viewer may contest an absence. */
export type ContestFacts = {
  status: BookingStatus;
  cancellationKind: CancellationKind | null;
  cancelledBy: CancellationAuthor | null;
  cancelledAt: Date | null;
  disputedAt: Date | null;
};

/**
 * The side reported absent contests the report (annulations-table, the
 * answers [9.3]: « absence contestée »), once, for 24 hours after it. The
 * garde then enters « litige ».
 */
export function canContest(garde: ContestFacts, viewer: BookingSide, now: Date): boolean {
  if (garde.status !== "annulee" || garde.cancellationKind !== "absence") return false;
  if (garde.cancelledBy !== viewer || garde.disputedAt || !garde.cancelledAt) return false;
  return now.getTime() < garde.cancelledAt.getTime() + CONTEST_HOURS * 3_600_000;
}

/** The fee line on a cancelled garde's page, or null when there is nothing to say. */
export type FeeLine = "credit" | "conserves" | "litige" | "rembourses";

/**
 * What each side reads about the 3 % once a garde ends early (D-2,
 * annulations-table): a litige says the founders decide, until they grant a
 * credit of the fee (annulations-back-office); a refunded fee says
 * so whoever refunded it; a live credit of the garde names the credit; a fee
 * the family's own cancellation or absence left at Berceo says it stays. A
 * professional's cancellation made before the table has no credit: nothing,
 * the founders refund it. No paid fee (a garde booked before the fee existed),
 * nothing.
 */
export function feeLine(
  cancellation: Cancellation | null,
  disputed: boolean,
  payment: PaymentStatus | null,
  credited: boolean,
): FeeLine | null {
  if (!cancellation) return null;
  // A litige the founders closed with a credit of the fee reads as that credit (annulations-back-office).
  if (disputed && !credited) return "litige";
  if (!payment) return null;
  if (payment === "remboursee") return "rembourses";
  if (credited) return "credit";
  if (payment !== "payee" && payment !== "remboursement_echoue") return null;
  return cancellation.by === "famille" ? "conserves" : null;
}
