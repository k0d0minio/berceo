import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { formatDate, formatTime } from "@/lib/demandes/format";
import { agreedStartLine } from "@/lib/reservations/format";

/**
 * How a garde still standing reads on an account's page and in the suspension
 * dialog (back-office-admin, D-134): its line, and under it the record line of
 * an adapted schedule (JAM-306, JAM-350). The record line is the one of the
 * lists « Réservations » and « Demandes » (`agreedStartLine`). It is null on a
 * night with no adapted schedule, so that night reads as it did before. Pure,
 * so the tests hold the wording.
 */

export type GardeLine = {
  /** « 30/09/2026 à 20h00, avec Emma Dubois (0470 12 34 56) »: the start is the agreed start. */
  line: string;
  /** The record line of an adapted schedule (`agreedStartLine`), or null. */
  record: string | null;
};

export function upcomingGardeLine(garde: {
  nightDate: string;
  startTime: string;
  requestedStartTime?: string | null;
  other: { name: string; phone: string | null };
}): GardeLine {
  const t = words(admin).compte;
  return {
    line: fill(t.garde, {
      date: formatDate(garde.nightDate),
      heure: formatTime(garde.startTime),
      nom: garde.other.name,
      telephone: garde.other.phone ?? t.nonRenseigne,
    }),
    record: agreedStartLine(garde),
  };
}
