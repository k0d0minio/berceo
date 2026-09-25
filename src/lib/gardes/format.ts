import { gardes } from "@/content/gardes";
import { fill, words } from "@/content/locale";
import type { BookingSide } from "@/db/schema";
import type { GardeRecord } from "@/lib/reservations/bookings";

import { feeLine, type FeeLine } from "./rules";

const t = words(gardes);

const moment = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
});

/**
 * The line under a cancelled garde, for the side `viewer` reading it: who
 * cancelled or who was reported absent, and when (D-105, D-106). `other` is
 * the other side's first name, never a surname. Null on a confirmed garde.
 */
export function cancelledLine(garde: GardeRecord, viewer: BookingSide, other: string): string | null {
  if (garde.status !== "annulee" || !garde.cancelledAt || !garde.cancelledBy) return null;
  const date = moment.format(garde.cancelledAt);
  const mine = garde.cancelledBy === viewer;
  if (garde.cancellationKind === "absence") {
    return mine ? fill(t.annulee.absenceVous, { date }) : fill(t.annulee.absenceAutre, { prenom: other, date });
  }
  return mine ? fill(t.annulee.parVous, { date }) : fill(t.annulee.parAutre, { prenom: other, date });
}

/** The fee line of the family's cancelled garde (D-2), or null. */
export function feeText(garde: GardeRecord, payment: Parameters<typeof feeLine>[1]): string | null {
  const cancellation =
    garde.status === "annulee" && garde.cancelledBy && garde.cancellationKind
      ? { by: garde.cancelledBy, kind: garde.cancellationKind }
      : null;
  const line: FeeLine | null = feeLine(cancellation, payment);
  return line ? t.frais[line] : null;
}
