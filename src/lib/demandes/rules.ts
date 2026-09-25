/**
 * The rules of a care request that do not need the database: which nights a
 * request may be for, the start times, the baby's age, when a night has
 * started, the end of the night, and when the daily digest may leave. Pure and
 * dependency-free, so the form, the server actions, the digest route and the
 * tests read the same rules.
 *
 * Every date is a calendar date in Brussels (`YYYY-MM-DD`) and every time a
 * wall-clock time there (`HH:MM`): a family in Belgium means « ce soir » in
 * Belgian time, whatever the server's clock says.
 */

export const TIME_ZONE = "Europe/Brussels";

/** A standard night is 11 hours (the guide, "Les annonces"). */
export const NIGHT_HOURS = 11;

/** A normal request: from the day after tomorrow up to 8 weeks ahead (D-50). */
export const NORMAL_FIRST_DAY = 2;
export const NORMAL_LAST_DAY = 56;

/** An urgent request: tonight or tomorrow night (D-50). */
export const URGENT_LAST_DAY = 1;

/** Start times: every half hour from 18:00 to 23:00 (D-55). */
export const START_TIMES: readonly string[] = Array.from({ length: 11 }, (_, i) => {
  const minutes = 18 * 60 + i * 30;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

/** The baby's age, in whole weeks or months (D-54). */
export const AGE_UNITS = ["semaines", "mois"] as const;
export type AgeUnit = (typeof AGE_UNITS)[number];
export const AGE_RANGES: Readonly<Record<AgeUnit, { min: number; max: number }>> = {
  semaines: { min: 0, max: 12 },
  mois: { min: 1, max: 24 },
};

export const CHILDREN = ["un_bebe", "jumeaux"] as const;
export type Children = (typeof CHILDREN)[number];

/** The daily digest leaves at 18:00 in Brussels, or at the first call after (D-51). */
export const DIGEST_HOUR = 18;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** The date and time it is in Brussels at `now`. */
export function brusselsNow(now: Date): { date: string; time: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    hour: Number(parts.hour),
  };
}

/** A well-formed calendar date that exists (no 31 February). */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** `date` plus `days` calendar days. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** The first and last night a request of this kind may be for, as of `now`. */
export function dateWindow(urgent: boolean, now: Date): { min: string; max: string } {
  const today = brusselsNow(now).date;
  return urgent
    ? { min: today, max: addDays(today, URGENT_LAST_DAY) }
    : { min: addDays(today, NORMAL_FIRST_DAY), max: addDays(today, NORMAL_LAST_DAY) };
}

/** Whether `date` is inside the window of its kind. ISO dates compare as strings. */
export function isDateInWindow(urgent: boolean, date: string, now: Date): boolean {
  if (!isIsoDate(date)) return false;
  const { min, max } = dateWindow(urgent, now);
  return date >= min && date <= max;
}

export function isStartTime(value: string): boolean {
  return START_TIMES.includes(value);
}

/** `HH:MM` from a stored `time` (`HH:MM:SS`) or a form value. */
export function toHourMinute(value: string): string {
  return value.slice(0, 5);
}

/** Whether the night of `date` starting at `startTime` has begun in Brussels at `now`. */
export function hasNightStarted(date: string, startTime: string, now: Date): boolean {
  const here = brusselsNow(now);
  return `${date}T${toHourMinute(startTime)}` <= `${here.date}T${here.time}`;
}

/** The end of a night that starts at `startTime`: 11 hours later, the next morning. */
export function endTime(startTime: string): string {
  const [h, m] = toHourMinute(startTime).split(":").map(Number);
  const minutes = (h * 60 + m + NIGHT_HOURS * 60) % (24 * 60);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function isAgeUnit(value: string): value is AgeUnit {
  return (AGE_UNITS as readonly string[]).includes(value);
}

export function isAgeInRange(value: number, unit: AgeUnit): boolean {
  const { min, max } = AGE_RANGES[unit];
  return Number.isInteger(value) && value >= min && value <= max;
}

export function isChildren(value: string): value is Children {
  return (CHILDREN as readonly string[]).includes(value);
}

/** Whether the digest may leave at `now`: 18:00 or later in Brussels, summer and winter. */
export function isDigestTime(now: Date): boolean {
  return brusselsNow(now).hour >= DIGEST_HOUR;
}

/** What the family sees: the stored status, or « passée » once an open night has started. */
export type DisplayStatus = "ouverte" | "annulee" | "passee";

export function displayStatus(
  request: { status: "ouverte" | "annulee"; nightDate: string; startTime: string },
  now: Date,
): DisplayStatus {
  if (request.status === "annulee") return "annulee";
  return hasNightStarted(request.nightDate, request.startTime, now) ? "passee" : "ouverte";
}

/** Only an open request whose night has not started can be edited or cancelled. */
export function isChangeable(
  request: { status: "ouverte" | "annulee"; nightDate: string; startTime: string },
  now: Date,
): boolean {
  return displayStatus(request, now) === "ouverte";
}
