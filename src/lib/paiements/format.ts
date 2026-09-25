import { paiement } from "@/content/paiement";
import { fill, words } from "@/content/locale";

import { eurosFromCents, feeCents } from "./rules";

const t = words(paiement);

/** « 4,11 € »: the fee on a rate, computed on the server from the answer's stored rate (D-99). */
export function feeLine(nightRateEur: number): string {
  return fill(t.recapitulatif.montant, { montant: eurosFromCents(feeCents(nightRateEur)) });
}
