/**
 * The rules of a garde that do not need the database (D-105 to D-111): its
 * state read from the night and the clock, when each side may cancel it or
 * report the other absent, when the family may republish, when the professional
 * reads the address, what the fee line says, and when the reminder leaves.
 * Pure, so the pages, the server functions, the reminder route and the tests
 * read the same rules; `./gardes.ts` holds each of them again in the SQL of the
 * write it governs.
 *
 * Dates and times are Brussels wall-clock values, as in `src/lib/demandes/rules.ts`.
 */

import type { BookingSide, BookingStatus, CancellationKind, PaymentStatus } from "@/db/schema";
import { addDays, brusselsNow, endTime, hasNightStarted, toHourMinute } from "@/lib/demandes/rules";

/** What each side sees (D-17): the stored `confirmee` split by the clock, or `annulee`. */
export type GardeState = "a_venir" | "en_cours" | "terminee" | "annulee";

export type GardeFacts = { status: BookingStatus; nightDate: string; startTime: string };

/** An absence can be reported until 24 hours after the night ends (D-106). */
export const ABSENCE_HOURS_AFTER_END = 24;

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

/** The end of the night: start + 11 hours, the next morning (every start is between 18:00 and 23:00). */
export function nightEnd(nightDate: string, startTime: string): string {
  return stamp(addDays(nightDate, 1), endTime(startTime));
}

/** Whether the night has ended in Brussels at `now`. */
export function hasNightEnded(nightDate: string, startTime: string, now: Date): boolean {
  return nightEnd(nightDate, startTime) <= nowStamp(now);
}

/** The last moment an absence can be reported: the night's end plus 24 hours. */
export function absenceDeadline(nightDate: string, startTime: string): string {
  return stamp(addDays(nightDate, 2), endTime(startTime));
}

/** The garde's state at `now`, never stored (D-109). */
export function gardeState(garde: GardeFacts, now: Date): GardeState {
  if (garde.status === "annulee") return "annulee";
  if (!hasNightStarted(garde.nightDate, garde.startTime, now)) return "a_venir";
  return hasNightEnded(garde.nightDate, garde.startTime, now) ? "terminee" : "en_cours";
}

/** Either side cancels a confirmed garde until its start hour (D-105). */
export function canCancel(garde: GardeFacts, now: Date): boolean {
  return gardeState(garde, now) === "a_venir";
}

/** From the start hour until 24 hours after the night ends, either side reports the other absent (D-106). */
export function canReportAbsence(garde: GardeFacts, now: Date): boolean {
  if (garde.status !== "confirmee") return false;
  if (!hasNightStarted(garde.nightDate, garde.startTime, now)) return false;
  return nowStamp(now) < absenceDeadline(garde.nightDate, garde.startTime);
}

/** After any cancelled garde whose night has not started, the family may publish it again (D-107). */
export function canRepublish(garde: GardeFacts, now: Date): boolean {
  return garde.status === "annulee" && !hasNightStarted(garde.nightDate, garde.startTime, now);
}

/** The professional reads the family's address on a confirmed garde until the night ends (D-110). */
export function isAddressVisible(garde: GardeFacts, now: Date): boolean {
  return garde.status === "confirmee" && !hasNightEnded(garde.nightDate, garde.startTime, now);
}

/** The other side of a garde: the side an absence is recorded against is the one not reporting it. */
export function otherSide(side: BookingSide): BookingSide {
  return side === "famille" ? "professionnelle" : "famille";
}

/** Whether the reminder may leave now: 10:00 to 10:59 in Brussels. */
export function isReminderTime(now: Date): boolean {
  return brusselsNow(now).hour === REMINDER_HOUR;
}

/** The night the reminder sent today is about: tomorrow's, in Brussels. */
export function reminderNight(now: Date): string {
  return addDays(brusselsNow(now).date, 1);
}

export type Cancellation = { by: BookingSide; kind: CancellationKind };

/** The fee line on the family's page, or null when there is nothing to say. */
export type FeeLine = "rembourses" | "remboursementEnCours" | "conserves";

/**
 * What the family reads about the 3 % once a garde is cancelled (D-2): a
 * refunded fee says so whoever refunded it; a professional's cancellation not
 * yet refunded at Stripe is « en cours »; a family's cancellation keeps the
 * fee. An absence refunds nothing on its own (D-106), so it says nothing until
 * the founders refund. No paid fee (a garde booked before the fee existed),
 * nothing.
 */
export function feeLine(cancellation: Cancellation | null, payment: PaymentStatus | null): FeeLine | null {
  if (!cancellation || !payment) return null;
  if (payment === "remboursee") return "rembourses";
  if (payment !== "payee" && payment !== "remboursement_echoue") return null;
  if (cancellation.kind !== "annulation") return null;
  return cancellation.by === "professionnelle" ? "remboursementEnCours" : "conserves";
}
