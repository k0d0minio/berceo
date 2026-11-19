import { gardes } from "@/content/gardes";
import { fill, words } from "@/content/locale";
import { paiement } from "@/content/paiement";
import type { BookingSide, PaymentStatus } from "@/db/schema";
import type { GardeCredit } from "@/lib/credits/credits";
import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { eurosFromCents } from "@/lib/paiements/rules";
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
 * the other side's first name, never a surname. A cancellation by Berceo reads
 * the same for both sides. Null on a confirmed garde.
 */
export function cancelledLine(garde: GardeRecord, viewer: BookingSide, other: string): string | null {
  if (garde.status !== "annulee" || !garde.cancelledAt || !garde.cancelledBy) return null;
  const date = moment.format(garde.cancelledAt);
  // A founder cancelled it for Berceo (annulations-back-office): both sides read the same line, never her note.
  if (garde.cancelledBy === "berceo") return fill(t.annulee.parBerceo, { date });
  const mine = garde.cancelledBy === viewer;
  if (garde.cancellationKind === "absence") {
    return mine ? fill(t.annulee.absenceVous, { date }) : fill(t.annulee.absenceAutre, { prenom: other, date });
  }
  return mine ? fill(t.annulee.parVous, { date }) : fill(t.annulee.parAutre, { prenom: other, date });
}

/**
 * The reason line under a cancelled garde (annulations-delai-et-motif): the
 * reason the cancelling side chose, as that side read it. Null on a confirmed
 * garde, an absence, or a garde cancelled before the reason existed.
 */
export function reasonLine(garde: GardeRecord): string | null {
  if (garde.status !== "annulee" || garde.cancellationKind !== "annulation" || !garde.cancellationReason) return null;
  return fill(t.annulee.motif, { motif: t.motifs[garde.cancellationReason] });
}

/**
 * The litige line under a cancelled garde (annulations-table): when the side
 * reported absent contested the report. Null otherwise.
 */
export function disputeLine(garde: GardeRecord): string | null {
  if (garde.status !== "annulee" || !garde.disputedAt) return null;
  return fill(t.annulee.litige, { date: moment.format(garde.disputedAt) });
}

/**
 * The fee line of a cancelled garde (D-2, annulations-table), for the side
 * `viewer` reading it, or null. `credit` is the garde's live credit: the
 * family reads its amount and its expiry, the professional that it exists.
 */
export function feeText(
  garde: GardeRecord,
  payment: PaymentStatus | null,
  credit: GardeCredit | null,
  viewer: BookingSide,
): string | null {
  const cancellation =
    garde.status === "annulee" && garde.cancelledBy && garde.cancellationKind
      ? { by: garde.cancelledBy, kind: garde.cancellationKind }
      : null;
  const line: FeeLine | null = feeLine(cancellation, garde.disputedAt !== null, payment, credit !== null);
  if (!line) return null;
  if (viewer === "professionnelle") return t.fraisProfessionnelle[line];
  if (line === "credit" && credit) {
    return fill(t.frais.credit, {
      montant: fill(words(paiement).recapitulatif.montant, { montant: eurosFromCents(credit.amountCents) }),
      date: formatDate(brusselsNow(credit.expiresAt).date),
    });
  }
  return t.frais[line];
}
