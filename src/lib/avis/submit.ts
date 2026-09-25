import "server-only";

import type { RatingSide } from "@/db";

import { logError, submitRating } from "./ratings";
import { parseScores, type RatingState } from "./rules";

/**
 * The body both sides' server actions share (D-117): four whole scores read
 * from the form, nothing else; the side is the caller's (its route), the user
 * the session's; the write holds every rule in its SQL. Returns the form's
 * state on a refusal, or `{}` once stored, for the caller to redirect.
 */
export async function rateFromForm(
  side: RatingSide,
  userId: string,
  bookingId: string,
  form: FormData,
): Promise<RatingState & { stored?: true }> {
  const scores = parseScores(form);
  if (!scores) return { error: "incomplet" };
  try {
    const result = await submitRating(side, userId, bookingId, scores, new Date());
    if (result.ok) return { stored: true };
    if (result.reason === "introuvable") return { error: "generique" };
    return { error: result.reason };
  } catch (error) {
    logError("rating not stored", { userId, bookingId, side }, error);
    return { error: "generique" };
  }
}
