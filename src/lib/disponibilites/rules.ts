import { NORMAL_LAST_DAY, addDays, brusselsNow, isIsoDate } from "@/lib/demandes/rules";

/**
 * The rules of the indicative calendar that do not need the database: which
 * nights a professional may mark, the calendar's months, what a save may carry,
 * and how many nights families see. Pure and dependency-free (beyond the care
 * request's Brussels date helpers), so the page, the server action, the read
 * and the tests share them.
 *
 * A night is named by the date of its evening (`YYYY-MM-DD` in Brussels), the
 * same date a care request carries: the night of the 12th runs to the 13th.
 */

/** The last night she may mark: the last day of a normal care request (D-79). */
export const LAST_DAY = NORMAL_LAST_DAY;

/** Tonight to today + 56 days: 57 nights, and the most a save may carry. */
export const NIGHTS_IN_WINDOW = LAST_DAY + 1;

/** « Prochaines disponibilités » shows this many nights at most (D-80). */
export const SHOWN_TO_FAMILIES = 5;

export type NightWindow = { first: string; last: string };

/** The first and last night she may mark at `now`: tonight until midnight in Brussels. */
export function availabilityWindow(now: Date): NightWindow {
  const today = brusselsNow(now).date;
  return { first: today, last: addDays(today, LAST_DAY) };
}

/** Whether `date` is a real date inside the window. ISO dates compare as strings. */
export function isInWindow(date: string, range: NightWindow): boolean {
  return isIsoDate(date) && date >= range.first && date <= range.last;
}

/** 0 for Monday to 6 for Sunday. */
export function weekdayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** A cell of the calendar: a night she may mark, or padding (another month, or outside the window). */
export type CalendarDay = { date: string; inWindow: boolean };

/**
 * One month of the calendar under its own heading (`YYYY-MM`), as Monday to
 * Sunday rows. A cell is `inWindow` only when its date is in this month and in
 * the window, so a heading never sits over another month's nights.
 */
export type CalendarMonth = { month: string; weeks: CalendarDay[][] };

function lastOfMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return addDays(next, -1);
}

/** The window as one block per month, each padded to whole weeks. */
export function calendarMonths(range: NightWindow): CalendarMonth[] {
  const months: CalendarMonth[] = [];
  let month = range.first.slice(0, 7);

  while (`${month}-01` <= range.last) {
    const from = `${month}-01` > range.first ? `${month}-01` : range.first;
    const end = lastOfMonth(month);
    const to = end < range.last ? end : range.last;
    const weeks: CalendarDay[][] = [];
    for (let monday = addDays(from, -weekdayIndex(from)); monday <= to; monday = addDays(monday, 7)) {
      weeks.push(
        Array.from({ length: 7 }, (_, i) => {
          const date = addDays(monday, i);
          return { date, inWindow: date >= from && date <= to };
        }),
      );
    }
    months.push({ month, weeks });
    month = addDays(end, 1).slice(0, 7);
  }

  return months;
}

export type NightsCheck =
  | { ok: true; dates: string[] }
  | { ok: false; reason: "vide" | "horsFenetre" };

/**
 * What a save may carry: one to 57 real dates inside the window, duplicates
 * collapsed, sorted. Anything else refuses the whole set, so a save never
 * stores part of what was sent.
 */
export function validateNights(values: readonly string[], range: NightWindow): NightsCheck {
  if (values.length === 0) return { ok: false, reason: "vide" };
  if (values.length > NIGHTS_IN_WINDOW) return { ok: false, reason: "horsFenetre" };
  if (!values.every((value) => isInWindow(value, range))) return { ok: false, reason: "horsFenetre" };
  return { ok: true, dates: [...new Set(values)].sort() };
}
