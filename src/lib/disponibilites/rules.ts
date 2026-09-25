import { NORMAL_LAST_DAY, addDays, brusselsNow, isIsoDate } from "@/lib/demandes/rules";

/**
 * The rules of the indicative calendar that do not need the database: which
 * nights a professional may mark, the calendar's weeks, what a save may carry,
 * and how many nights families see. Pure and dependency-free (beyond the care
 * request's Brussels date helpers), so the page, the server action, the read
 * and the tests share them.
 *
 * A night is named by the date of its evening (`YYYY-MM-DD` in Brussels), the
 * same date a care request carries: the night of the 12th runs to the 13th.
 */

/** The last night she may mark: the last day of a normal care request (D-70). */
export const LAST_DAY = NORMAL_LAST_DAY;

/** Tonight to today + 56 days: 57 nights, and the most a save may carry. */
export const NIGHTS_IN_WINDOW = LAST_DAY + 1;

/** « Prochaines disponibilités » shows this many nights at most (D-71). */
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

export type CalendarDay = { date: string; inWindow: boolean };

/**
 * One row of the calendar, Monday to Sunday. `month` (`YYYY-MM`) heads the
 * first row and every row where a month starts inside the window.
 */
export type CalendarWeek = { month: string | null; days: CalendarDay[] };

/** The window as week rows, padded to whole weeks with days outside it. */
export function calendarWeeks(range: NightWindow): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  let monday = addDays(range.first, -weekdayIndex(range.first));

  while (monday <= range.last) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      return { date, inWindow: date >= range.first && date <= range.last };
    });
    const starting = days.find((day) => day.inWindow && day.date.endsWith("-01"));
    const month = weeks.length === 0 ? range.first.slice(0, 7) : (starting?.date.slice(0, 7) ?? null);
    weeks.push({ month, days });
    monday = addDays(monday, 7);
  }

  return weeks;
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
