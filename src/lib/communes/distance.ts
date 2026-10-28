import "server-only";

import { CENTRES } from "./centres";

/**
 * The distance between communes, for the radius of a professional's zone
 * (profil-zone-rayon): a straight line between two official centres, not a
 * road distance. Server-only, apart from `index.ts`, because client components
 * import the commune list and the centres must stay out of the browser bundle.
 */

/** The mean radius of the Earth, the sphere the haversine distance runs on. */
const EARTH_KM = 6371;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

function centre(ins: string): readonly [number, number] | null {
  // Own keys only, as `communeName` does.
  return Object.hasOwn(CENTRES, ins) ? CENTRES[ins] : null;
}

function haversine([lat1, lon1]: readonly [number, number], [lat2, lon2]: readonly [number, number]): number {
  const h =
    Math.sin(radians(lat2 - lat1) / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/** The distance in km between the centres of two communes, or null when a code has no centre. */
export function distanceKm(a: string, b: string): number | null {
  const from = centre(a);
  const to = centre(b);
  return from && to ? haversine(from, to) : null;
}

/**
 * Her own communes, and every commune whose centre is at `km` or less from the
 * centre of one of them: each code once, sorted. 0 km gives her own communes;
 * Infinity gives every commune. A code with no centre stays and reaches nothing.
 */
export function communesWithin(communes: readonly string[], km: number): string[] {
  if (!(km >= 0)) throw new RangeError(`communesWithin: km must be 0 or more, got ${km}`);
  const reached = new Set(communes);
  const origins = communes.map(centre).filter((c): c is readonly [number, number] => c !== null);
  for (const [ins, point] of Object.entries(CENTRES)) {
    if (!reached.has(ins) && origins.some((origin) => haversine(origin, point) <= km)) reached.add(ins);
  }
  return [...reached].sort();
}
