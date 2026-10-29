import type { BookingStatus } from "@/db/schema";
import { gardeState } from "@/lib/gardes/rules";

/**
 * The list « Mes professionnelles » (favoris-liste), pure: her marks first,
 * then the professionals of her past gardes, each profile once. A garde
 * counts when it is `confirmee` and `gardeState` reads it « Terminée » at
 * `now` (D-109); a cancelled one and a night still to come count for
 * nothing. The marks keep their order (the last marked first); the past
 * gardes go from the most recent night to the oldest. The page reads the
 * profiles after, in this order.
 */

export type PastGardeFacts = {
  profileId: string;
  status: BookingStatus;
  nightDate: string;
  startTime: string;
  extraHours: number;
};

export type ListedIds = {
  /** The profiles she marked, the last marked first. */
  marked: string[];
  /** The profiles of her past gardes that she did not mark, the most recent night first. */
  past: string[];
};

export function listedIds(marks: readonly string[], gardes: readonly PastGardeFacts[], now: Date): ListedIds {
  const marked = [...new Set(marks)];
  const seen = new Set(marked);
  const past: string[] = [];
  const ended = gardes
    .filter((garde) => gardeState(garde, now) === "terminee")
    .sort((a, b) => `${b.nightDate}T${b.startTime}`.localeCompare(`${a.nightDate}T${a.startTime}`));
  for (const garde of ended) {
    if (seen.has(garde.profileId)) continue;
    seen.add(garde.profileId);
    past.push(garde.profileId);
  }
  return { marked, past };
}
