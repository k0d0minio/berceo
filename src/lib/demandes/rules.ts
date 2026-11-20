/**
 * The rules of a care request that do not need the database: which nights a
 * request may be for, the start times, the extra half hours, the children
 * (four at most, each 24 months at most) and their feedings, when a night has
 * started and when it has ended, the two sides of it, and when the daily
 * digest may leave. Pure and dependency-free, so the form, the server actions,
 * the digest route and the tests read the same rules; the conversation (D-89),
 * the garde (D-109, D-110) and the rating read the night's end and the other
 * side from here, so they end at the same moment.
 *
 * Every date is a calendar date in Brussels (`YYYY-MM-DD`) and every time a
 * wall-clock time there (`HH:MM`): a family in Belgium means « ce soir » in
 * Belgian time, whatever the server's clock says.
 */

export const TIME_ZONE = "Europe/Brussels";

/** A standard night is 11 hours (the guide, "Les annonces"). */
export const NIGHT_HOURS = 11;

/**
 * The family adds 0 to 6 extra hours to the night, by half hours (feedback
 * round 1; the half hours are feedback round 2, JAM-303). The latest night
 * ends the next day at 16:00: 23:00 + 11 + 6.
 */
export const MAX_EXTRA_HOURS = 6;

/** Every choice of extra hours, in order: 0, 0.5, 1, and so on to 6. */
export const EXTRA_HOURS: readonly number[] = Array.from({ length: MAX_EXTRA_HOURS * 2 + 1 }, (_, i) => i / 2);

/** A normal request: from the day after tomorrow up to 8 weeks ahead (D-60). */
export const NORMAL_FIRST_DAY = 2;
export const NORMAL_LAST_DAY = 56;

/** An urgent request: tonight or tomorrow night (D-60). */
export const URGENT_LAST_DAY = 1;

/**
 * « Nuit ponctuelle » or « Nuits régulières » (demande-nuits-regulieres). Regular
 * nights are one request per night with a shared series id, never urgent.
 */
export const REQUEST_KINDS = ["ponctuelle", "reguliere"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

/** The most nights one series holds (Jamie, 2026-10-28). */
export const MAX_SERIES_NIGHTS = 31;

/** Start times: every half hour from 18:00 to 23:00 (D-65). */
export const START_TIMES: readonly string[] = Array.from({ length: 11 }, (_, i) => {
  const minutes = 18 * 60 + i * 30;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

/** The baby's age, in whole weeks or months (D-64). */
export const AGE_UNITS = ["semaines", "mois"] as const;
export type AgeUnit = (typeof AGE_UNITS)[number];
export const AGE_RANGES: Readonly<Record<AgeUnit, { min: number; max: number }>> = {
  semaines: { min: 0, max: 12 },
  mois: { min: 1, max: 24 },
};

/** One child of the night: its age in whole weeks or whole months (JAM-303). */
export type ChildAge = { value: number; unit: AgeUnit };

/** A request is for 1 to 4 children (Jamie, JAM-303). */
export const MAX_CHILDREN = 4;

/** Berceo cares for children up to 24 months: an older child is refused (Jamie, JAM-303). */
export const MAX_AGE_MONTHS = AGE_RANGES.mois.max;

/**
 * How the children are fed, in the founders' order (demande-retour-1), then
 * « diversification alimentaire » (feedback round 2, JAM-303). The family
 * ticks one answer or more.
 */
export const FEEDINGS = [
  "allaitement_maternel",
  "lait_infantile",
  "allaitement_mixte",
  "diversification_alimentaire",
] as const;
export type Feeding = (typeof FEEDINGS)[number];

/**
 * The longest answer to the optional « Pourquoi souhaitez-vous être
 * accompagné(e) la nuit ? » (demande-motif-facultatif), like the profile's
 * context line. The schema's check holds the same number.
 */
export const REASON_MAX = 300;

/** The daily digest leaves at 18:00 in Brussels, or at the first call after (D-61). */
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

/**
 * The nights a series may hold, as of `now`: from the day after tomorrow, as a
 * normal request (D-60), to the last day of next month in Brussels (« le mois
 * qui suit », Jamie, 2026-10-28). D-60's day 56 does not bind a series.
 */
export function seriesWindow(now: Date): { min: string; max: string } {
  const today = brusselsNow(now).date;
  const [y, m] = today.split("-").map(Number);
  // Day 0 of the month after next is the last day of next month.
  const last = new Date(Date.UTC(y, m + 1, 0));
  return {
    min: addDays(today, NORMAL_FIRST_DAY),
    max: `${last.getUTCFullYear()}-${pad(last.getUTCMonth() + 1)}-${pad(last.getUTCDate())}`,
  };
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

/**
 * The end of a night that starts at `startTime`: 11 hours plus the extra hours
 * later, the next day. The one place the night's end is computed: the SQL
 * twin is `nightEnd` in `./night-end.ts`.
 */
export function endTime(startTime: string, extraHours: number): string {
  const [h, m] = toHourMinute(startTime).split(":").map(Number);
  const minutes = (h * 60 + m + nightHours(extraHours) * 60) % (24 * 60);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Whether the night of `date` starting at `startTime`, with its extra hours, has ended in Brussels at `now`. */
export function hasNightEnded(date: string, startTime: string, extraHours: number, now: Date): boolean {
  // Every night starts between 18:00 and 23:00 and lasts 11 to 17 hours, so it ends the next day.
  const here = brusselsNow(now);
  return `${addDays(date, 1)}T${endTime(startTime, extraHours)}` <= `${here.date}T${here.time}`;
}

/** The two sides of a night, as `booking_side`, `rating_side` and `messages.author` name them. */
export type Side = "famille" | "professionnelle";

/** The other side: the one told of a cancellation, reported absent, or rated. */
export function otherSide(side: Side): Side {
  return side === "famille" ? "professionnelle" : "famille";
}

/** Extra hours by half hours, 0 to 6. */
export function isExtraHours(value: number): boolean {
  return Number.isInteger(value * 2) && value >= 0 && value <= MAX_EXTRA_HOURS;
}

/**
 * The extra hours of a form value: « 0 », « 1 », « 1.5 » or « 1,5 ». Empty
 * reads as 0. NaN for anything that is not a half hour from 0 to 6.
 */
export function parseExtraHours(value: string): number {
  if (value === "") return 0;
  if (!/^\d(?:[.,][05])?$/.test(value)) return NaN;
  const hours = Number(value.replace(",", "."));
  return isExtraHours(hours) ? hours : NaN;
}

/** The night's length: 11 hours plus the extra hours. */
export function nightHours(extraHours: number): number {
  return NIGHT_HOURS + extraHours;
}

export function isAgeUnit(value: string): value is AgeUnit {
  return (AGE_UNITS as readonly string[]).includes(value);
}

export function isAgeInRange(value: number, unit: AgeUnit): boolean {
  const { min, max } = AGE_RANGES[unit];
  return Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Whether an age is past what Berceo cares for: more than 24 months, or a
 * number of weeks that no child under 24 months is counted in (more than 104).
 * The form says so in its own words, apart from an age that is not a number.
 */
export function isTooOld(value: number, unit: AgeUnit): boolean {
  if (!Number.isInteger(value)) return false;
  return unit === "mois" ? value > MAX_AGE_MONTHS : value > 104;
}

/** One to four children. */
export function isChildCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= MAX_CHILDREN;
}

export function isFeeding(value: string): value is Feeding {
  return (FEEDINGS as readonly string[]).includes(value);
}

/** One answer or more, each of the list, none twice. */
export function areFeedings(values: readonly string[]): values is Feeding[] {
  return values.length > 0 && values.every(isFeeding) && new Set(values).size === values.length;
}

/** The answers in the list's order, whatever order the form posted them in. */
export function sortFeedings(values: readonly Feeding[]): Feeding[] {
  return FEEDINGS.filter((feeding) => values.includes(feeding));
}

/** Whether the digest may leave at `now`: 18:00 or later in Brussels, summer and winter. */
export function isDigestTime(now: Date): boolean {
  return brusselsNow(now).hour >= DIGEST_HOUR;
}

/** A request's stored status (candidature-et-reservation adds `attribuee`). */
export type RequestStatus = "ouverte" | "annulee" | "attribuee";

/**
 * What the family sees: the stored status, or « passée » once an open night
 * has started. A booked request stays « attribuée »: its garde's own states
 * come with cycle-de-garde-et-annulation.
 */
export type DisplayStatus = "ouverte" | "annulee" | "attribuee" | "passee";

export function displayStatus(
  request: { status: RequestStatus; nightDate: string; startTime: string },
  now: Date,
): DisplayStatus {
  if (request.status !== "ouverte") return request.status;
  return hasNightStarted(request.nightDate, request.startTime, now) ? "passee" : "ouverte";
}

/**
 * Only an open request whose night has not started can be cancelled or
 * republished. A booked one (`attribuee`) cannot: cancelling a confirmed
 * garde is cycle-de-garde-et-annulation's.
 */
export function isChangeable(
  request: { status: RequestStatus; nightDate: string; startTime: string },
  now: Date,
): boolean {
  return displayStatus(request, now) === "ouverte";
}

/**
 * Editing needs more: no professional may ever have answered it, or, for a
 * regular request, any of its nights (JAM-302, Q4; D-76 superseded). A
 * withdrawn or declined answer counts too: to change an answered request, the
 * family cancels it and publishes a new one.
 */
export function isEditable(
  request: { status: RequestStatus; nightDate: string; startTime: string },
  answersEver: number,
  now: Date,
): boolean {
  return isChangeable(request, now) && answersEver === 0;
}
