/**
 * Regenerates `src/lib/communes/communes.json`, the Belgian commune register a
 * professional's zone is picked from (D-11): every current commune with its NIS
 * code, its French name, its Dutch name where it differs, and its postcodes.
 *
 *   npx tsx scripts/communes/build.ts
 *
 * Sources:
 *
 * - `georef-belgium-municipality`, year 2025, published by the National
 *   Geographic Institute (NGI-IGN, ngi.be) under its open licence and served
 *   by Opendatasoft's public hub: the 565 communes left by the 1 January 2025
 *   mergers, with their NIS codes, names and boundaries.
 * - `jief/zipcode-belgium` on GitHub: bpost's postcode list, one row per
 *   postcode and locality, each with its OpenStreetMap coordinates. It carries
 *   no licence file; a postcode list is a list of facts, and the operator can
 *   swap in bpost's own file when one is reachable.
 *
 * Each locality's point is placed in the 2025 commune whose boundary contains
 * it, so a postcode belongs to every commune one of its localities lies in.
 * OpenStreetMap misplaces a few localities (3400 Laar once landed in
 * Antwerp), so a point is kept only when it lies in its postcode's province
 * (bpost's ranges) and within 20 km of the postcode's other localities. A
 * postcode with a single, misplaced locality still slips through (2223 Schriek
 * sits in Heist-op-den-Berg, not Antwerp); the effect is an extra suggestion in
 * the commune picker, never a wrong NIS code. NGI's postcode table and areas
 * were tried and are worse: one commune per postcode, and areas misplaced (2400
 * Mol carries Dessel's). bpost's own file is not reachable from a build.
 *
 * Statbel's own REFNIS files are the register of record, but statbel.fgov.be
 * refuses non-browser clients; NGI's copy carries the same codes. The script
 * fails loudly rather than write a short list, and the test in
 * src/lib/communes/communes.test.ts holds the count.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const HUB = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets";
const MUNICIPALITIES = `${HUB}/georef-belgium-municipality/exports/geojson?where=${encodeURIComponent("year=date'2025'")}`;
const POSTCODES = "https://raw.githubusercontent.com/jief/zipcode-belgium/master/zipcode-belgium.json";
/** How far (km) a locality may sit from the middle of its postcode's other localities. */
const OUTLIER_KM = 20;
const EXPECTED = 565;

type Point = [number, number];
type Ring = Point[];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };
type Box = [number, number, number, number];
type Feature<P> = { properties: P; geometry: Geometry | null };

export type Commune = { nis: string; fr: string; nl?: string; postcodes: string[] };
type Placed = Commune & { geometry: Geometry; box: Box; province: string };

/**
 * bpost's postcode ranges by province (Brussels as its own). A locality whose
 * point lands in a commune of another province was geocoded wrong by
 * OpenStreetMap (3400 Landen once landed in Antwerp); that point is dropped.
 */
const RANGES: [number, number, string][] = [
  [1000, 1299, "bruxelles"],
  [1300, 1499, "20002"],
  [1500, 1999, "20001"],
  [2000, 2999, "10000"],
  [3000, 3499, "20001"],
  [3500, 3999, "70000"],
  [4000, 4999, "60000"],
  [5000, 5999, "90000"],
  [6000, 6599, "50000"],
  [6600, 6999, "80000"],
  [7000, 7999, "50000"],
  [8000, 8999, "30000"],
  [9000, 9999, "40000"],
];

/**
 * Postcodes whose commune moved province in the 2025 mergers: Burcht and
 * Zwijndrecht (2070, Antwerp's range) joined Beveren-Kruibeke-Zwijndrecht, in
 * East Flanders.
 */
const MOVED: Record<string, string> = { "2070": "40000" };

function provinceOf(postcode: string): string | undefined {
  if (MOVED[postcode]) return MOVED[postcode];
  const n = Number(postcode);
  return RANGES.find(([from, to]) => n >= from && n <= to)?.[2];
}

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return (await response.json()) as T;
}

function polygons(geometry: Geometry): Ring[][] {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function box(geometry: Geometry): Box {
  const points = polygons(geometry).flat(2);
  return [
    Math.min(...points.map((p) => p[0])),
    Math.min(...points.map((p) => p[1])),
    Math.max(...points.map((p) => p[0])),
    Math.max(...points.map((p) => p[1])),
  ];
}

/** Distance in km between two lng/lat points (equirectangular; fine at Belgium's scale). */
function km([x0, y0]: Point, [x1, y1]: Point): number {
  const rad = Math.PI / 180;
  const dx = (x1 - x0) * rad * Math.cos(((y0 + y1) / 2) * rad);
  const dy = (y1 - y0) * rad;
  return Math.hypot(dx, dy) * 6371;
}

function inBox([x, y]: Point, [x0, y0, x1, y1]: Box): boolean {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

/** The commune with a boundary vertex closest to the point, for a point just over a border. */
function nearest(communes: Placed[], [x, y]: Point): Placed {
  let best = communes[0];
  let bestDistance = Infinity;
  for (const commune of communes) {
    for (const [xi, yi] of polygons(commune.geometry).flat(2)) {
      const d = (xi - x) ** 2 + (yi - y) ** 2;
      if (d < bestDistance) [best, bestDistance] = [commune, d];
    }
  }
  return best;
}

/** Ray casting on one ring. */
function inRing([x, y]: Point, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function contains(geometry: Geometry, point: Point): boolean {
  return polygons(geometry).some(
    ([outer, ...holes]) => inRing(point, outer) && !holes.some((hole) => inRing(point, hole)),
  );
}

async function main() {
  const municipalities = await get<{
    features: Feature<{
      mun_code: string[];
      mun_name_fr: string[];
      mun_name_nl: string[];
      prov_code: string[] | null;
    }>[];
  }>(MUNICIPALITIES);
  const localities = await get<{ zip: string; city: string; lng: number; lat: number }[]>(POSTCODES);

  // The middle of each postcode's localities, to spot a point geocoded far away.
  const middles = new Map<string, Point>();
  const byPostcode = new Map<string, typeof localities>();
  for (const l of localities) byPostcode.set(String(l.zip), [...(byPostcode.get(String(l.zip)) ?? []), l]);
  for (const [postcode, rows] of byPostcode) {
    const lngs = rows.map((r) => r.lng).sort((a, b) => a - b);
    const lats = rows.map((r) => r.lat).sort((a, b) => a - b);
    middles.set(postcode, [lngs[lngs.length >> 1], lats[lats.length >> 1]]);
  }

  const communes: Placed[] = municipalities.features.map(({ properties: p, geometry }) => {
    if (!geometry) throw new Error(`commune ${p.mun_code[0]} has no boundary`);
    const fr = p.mun_name_fr[0].trim();
    const nl = p.mun_name_nl[0].trim();
    return {
      nis: p.mun_code[0],
      fr,
      ...(nl !== fr ? { nl } : {}),
      postcodes: [],
      geometry,
      box: box(geometry),
      // The Brussels region has no province.
      province: p.prov_code?.[0] ?? "bruxelles",
    };
  });
  if (communes.length !== EXPECTED) {
    throw new Error(`expected ${EXPECTED} communes for 2025, got ${communes.length}`);
  }

  const placed = new Set<string>();
  const dropped: string[] = [];
  for (const { zip, city, lng, lat } of localities) {
    const postcode = String(zip);
    if (!/^\d{4}$/.test(postcode) || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new Error(`malformed locality row: ${JSON.stringify({ zip, city, lng, lat })}`);
    }
    const province = provinceOf(postcode);
    const candidates = communes.filter((c) => c.province === province);
    if (candidates.length === 0) throw new Error(`postcode ${postcode} is in no province range`);
    const point: Point = [lng, lat];
    const commune =
      km(point, middles.get(postcode)!) > OUTLIER_KM
        ? undefined
        : candidates.find((c) => inBox(point, c.box) && contains(c.geometry, point));
    if (!commune) {
      dropped.push(`${postcode} ${city}`);
      continue;
    }
    placed.add(postcode);
    if (!commune.postcodes.includes(postcode)) commune.postcodes.push(postcode);
  }

  // A postcode none of whose localities could be placed goes to the nearest
  // commune of its own province, so no postcode is lost.
  for (const { zip, lng, lat } of localities) {
    const postcode = String(zip);
    if (placed.has(postcode)) continue;
    const commune = nearest(
      communes.filter((c) => c.province === provinceOf(postcode)),
      [lng, lat],
    );
    placed.add(postcode);
    commune.postcodes.push(postcode);
  }
  if (dropped.length > 0) console.warn(`localities geocoded outside their province or far from their postcode, dropped: ${dropped.join(", ")}`);

  const withoutPostcode = communes.filter((c) => c.postcodes.length === 0);
  if (withoutPostcode.length > 0) {
    throw new Error(`communes with no postcode: ${withoutPostcode.map((c) => c.fr).join(", ")}`);
  }

  const out: Commune[] = communes
    .map(({ nis, fr, nl, postcodes: codes }) => ({ nis, fr, ...(nl ? { nl } : {}), postcodes: codes.sort() }))
    .sort((a, b) => a.fr.localeCompare(b.fr, "fr"));

  const target = fileURLToPath(new URL("../../src/lib/communes/communes.json", import.meta.url));
  writeFileSync(target, `${JSON.stringify(out)}\n`);
  console.log(`wrote ${out.length} communes to ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
