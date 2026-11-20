import { isChangeable, type RequestStatus } from "@/lib/demandes/rules";

/**
 * « Republier ma demande » on a regular request (JAM-353), the part that needs
 * no database. Pure, so the page and the tests read the same rule. The write
 * in ./republish-series.ts holds it again in SQL.
 */

/** The fields of a night that the rule reads. */
export type SeriesNightFacts = { status: RequestStatus; nightDate: string; startTime: string };

/**
 * Offered on a regular request with one open night ahead or more, with one
 * waiting answer or more on those nights, and with no booked night. A request
 * with a booked night is not republished: its garde has its own cancellation.
 */
export function canRepublishSeries(
  nights: readonly SeriesNightFacts[],
  pendingAnswers: number,
  now: Date,
): boolean {
  if (nights.some((night) => night.status === "attribuee")) return false;
  return pendingAnswers > 0 && nights.some((night) => isChangeable(night, now));
}

export type RepublishSeriesResult = { ok: true; declined: string[] } | { ok: false };

/**
 * What the two statements of the write say together. No night marked means
 * that nothing was republished, and then no answer was declined.
 */
export function republishSeriesResult(
  marked: readonly { id: string }[],
  declined: readonly { id: string }[],
): RepublishSeriesResult {
  if (marked.length === 0) return { ok: false };
  return { ok: true, declined: declined.map((answer) => answer.id) };
}
