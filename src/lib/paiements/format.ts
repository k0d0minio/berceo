import { paiement } from "@/content/paiement";
import { fill, words } from "@/content/locale";

import { eurosFromCents, feeCents } from "./rules";

const t = words(paiement);

/** « 4,11 € »: the fee on a rate, computed on the server from the answer's stored rate (D-99). */
export function feeLine(nightRateEur: number): string {
  return fill(t.recapitulatif.montant, { montant: eurosFromCents(feeCents(nightRateEur)) });
}

const euros = (cents: number) => fill(t.recapitulatif.montant, { montant: eurosFromCents(cents) });

/**
 * The récapitulatif's credit lines for a rate (credits-au-paiement): the part
 * her credit pays and the rest Stripe asks, from `shares` (fee in cents →
 * credit part, `creditShares`). Nothing when her credit pays nothing.
 */
export function creditRecap(
  nightRateEur: number,
  shares: ReadonlyMap<number, number>,
): { credit?: string; reste?: string | null } {
  const fee = feeCents(nightRateEur);
  const share = shares.get(fee) ?? 0;
  if (share <= 0) return {};
  return { credit: euros(share), reste: share < fee ? euros(fee - share) : null };
}
