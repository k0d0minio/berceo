import "server-only";

import { communesWithin } from "@/lib/communes/distance";

import type { Zone } from "./rules";

/**
 * The communes her zone reaches, as `professional_reach` stores them
 * (profil-zone-rayon-saisie): her communes and every commune within her radius.
 * « Toute la Belgique » stores none, because her profile's flag carries it.
 * Server-only: the centres stay out of the browser.
 */
export function reachOf(communes: readonly string[], zone: Zone): string[] {
  return zone.wholeBelgium ? [] : communesWithin(communes, zone.radiusKm);
}
