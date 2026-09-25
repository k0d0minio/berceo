/**
 * The rules of a rating that do not need the database (avis-etoiles, D-18,
 * D-115 to D-122): the criteria of each side, the 14-day window, who may rate
 * now, when a rating is published, the note and its wording, and what a
 * submitted form may hold. Pure and client-safe, so the pages, the server
 * actions, the invitation route and the tests read the same rules;
 * `./ratings.ts` holds each of them again in the SQL of the write or read it
 * governs.
 *
 * The garde's state is cycle-de-garde-et-annulation's (`src/lib/gardes/rules.ts`),
 * never re-derived here. Times are Brussels wall-clock stamps `YYYY-MM-DDTHH:MM`.
 */

import type { RatingSide } from "@/db/schema";
import { addDays, brusselsNow, endTime, toHourMinute } from "@/lib/demandes/rules";
import { gardeState, type GardeFacts } from "@/lib/gardes/rules";

/** The criteria each side rates, in the order of `score_1` … `score_4` (D-115). */
export const CRITERIA = {
  famille: ["ponctualite", "communication", "soin", "confiance"],
  professionnelle: ["accueil", "communication", "clarteConsignes", "respectCadre"],
} as const satisfies Record<RatingSide, readonly [string, string, string, string]>;

export type Criterion = (typeof CRITERIA)[RatingSide][number];

/** Whole stars, 1 to 5. */
export const MIN_SCORE = 1;
export const MAX_SCORE = 5;

/** A garde can be rated for 14 days after the night ends (D-117). */
export const WINDOW_DAYS = 14;

export type Scores = readonly [number, number, number, number];

function nowStamp(now: Date): string {
  const here = brusselsNow(now);
  return `${here.date}T${here.time}`;
}

/** The last moment a garde can be rated: the night's end plus 14 days (excluded). */
export function windowCloses(nightDate: string, startTime: string): string {
  return `${addDays(nightDate, 1 + WINDOW_DAYS)}T${endTime(toHourMinute(startTime))}`;
}

/** Whether the 14 days after the night's end are over in Brussels at `now`. */
export function hasWindowClosed(nightDate: string, startTime: string, now: Date): boolean {
  return windowCloses(nightDate, startTime) <= nowStamp(now);
}

/** Why a side may not rate a garde now, or null when it may. */
export type RateRefusal = "pasTerminee" | "annulee" | "delaiPasse" | "dejaNote";

/**
 * Whether this side may rate this garde now: terminée, not annulée (D-122),
 * inside the 14 days after its end, and not yet rated by this side (D-117).
 */
export function rateRefusal(garde: GardeFacts, alreadyRated: boolean, now: Date): RateRefusal | null {
  const state = gardeState(garde, now);
  if (state === "annulee") return "annulee";
  if (state !== "terminee") return "pasTerminee";
  if (alreadyRated) return "dejaNote";
  if (hasWindowClosed(garde.nightDate, garde.startTime, now)) return "delaiPasse";
  return null;
}

/** What the rating form shows after a refused send. */
export type RatingState = { error?: "incomplet" | "generique" | RateRefusal };

export function canRate(garde: GardeFacts, alreadyRated: boolean, now: Date): boolean {
  return rateRefusal(garde, alreadyRated, now) === null;
}

/**
 * Double-blind (D-116): a rating counts once the other side has rated too, or
 * once the window has closed, whichever comes first.
 */
export function isPublished(
  otherSideRated: boolean,
  garde: Pick<GardeFacts, "nightDate" | "startTime">,
  now: Date,
): boolean {
  return otherSideRated || hasWindowClosed(garde.nightDate, garde.startTime, now);
}

/** The side that is rated by `side`. */
export function ratedSide(side: RatingSide): RatingSide {
  return side === "famille" ? "professionnelle" : "famille";
}

/** The mean of a rating's four scores. */
export function ratingMean(scores: Scores): number {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * The note (D-119): the mean of every criterion score, rounded to one decimal,
 * or null with no score. Rounded half up on the tenth from the integer sum, so
 * a mean of 4.95 reads 5,0, never 4,9 through binary floating point.
 */
export function noteOf(total: number, scoreCount: number): number | null {
  if (scoreCount <= 0) return null;
  return Math.round((total * 10) / scoreCount) / 10;
}

/** « 4,7 »: one decimal, a French comma. */
export function formatNote(note: number): string {
  return note.toFixed(1).replace(".", ",");
}

/** Whether `value` is a whole number of stars. */
export function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_SCORE && value <= MAX_SCORE;
}

/**
 * The four scores of a submitted form, `score_1` to `score_4`, or null when
 * one is missing, not a whole number, or outside 1 to 5. Every other field is
 * ignored: the side, the rater and the rated person come from the session and
 * the booking (the form carries none of them).
 */
export function parseScores(form: FormData): Scores | null {
  const scores: number[] = [];
  for (const n of [1, 2, 3, 4]) {
    const raw = form.get(`score_${n}`);
    if (typeof raw !== "string" || !/^\d$/.test(raw.trim())) return null;
    const value = Number(raw.trim());
    if (!isScore(value)) return null;
    scores.push(value);
  }
  return scores as unknown as Scores;
}
