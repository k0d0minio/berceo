import { SPACES } from "@/lib/auth/routing";
import { allCommunes, postcodesOf, searchLocalities } from "@/lib/communes";
import type { ServingCounts } from "@/lib/recherche/professionals";
import { COMMUNE_PAGES_PATH, communePath } from "@/lib/recherche/slugs";

/**
 * « Communes » (JAM-361): the founders' list of the 565 communes, each with its
 * postcodes, the number of validated professionals who serve it and the share
 * link of its public page. Pure: the counts come from `src/lib/recherche/`
 * (`servingCounts`), the names and postcodes from `src/lib/communes/`, the
 * address from the slug rule of `src/lib/recherche/slugs.ts`. A row holds a
 * count only: no name of a family or of a professional.
 */

export const ADMIN_COMMUNES_PATH = `${SPACES.admin}/communes`;

/** The communes on one page. */
export const COMMUNES_PAGE_SIZE = 50;

export type CommuneRow = {
  /** The REFNIS code: the key of the row. */
  ins: string;
  name: string;
  /** The slug of the public page: it names the commune in the address of its QR code. */
  slug: string;
  postcodes: string[];
  /** The validated professionals who serve the commune. */
  professionals: number;
  /** The full address of the public page: the share link. */
  shareUrl: string;
};

/**
 * The communes a search names: a postcode prefix (« 105 ») or part of a name,
 * of the commune or of one of its localities, accents and case ignored. An
 * empty search names every commune.
 */
export function matchingCommunes(q: string): { ins: string; name: string }[] {
  if (q.trim() === "") return allCommunes();
  const found = new Map<string, { ins: string; name: string }>();
  for (const l of searchLocalities(q, Number.MAX_SAFE_INTEGER)) {
    if (!found.has(l.ins)) found.set(l.ins, { ins: l.ins, name: l.commune });
  }
  return [...found.values()];
}

/** The validated professionals who serve a commune: « Toute la Belgique » and its reach. */
export function professionalsServing(counts: ServingCounts, ins: string): number {
  return counts.everywhere + (counts.byCommune.get(ins) ?? 0);
}

/** The slug of a commune's public page, or null for an unknown code. */
export function communeSlug(ins: string): string | null {
  const path = communePath(ins);
  return path ? path.slice(COMMUNE_PAGES_PATH.length + 1) : null;
}

/** The share link of a commune: this origin and the path of its public page, or null for an unknown code. */
export function communeShareUrl(origin: string, ins: string): string | null {
  const path = communePath(ins);
  return path ? new URL(path, origin).toString() : null;
}

/**
 * One page of the list. The communes with the most professionals are first,
 * then the names in French order, then the code, so the order never moves. A
 * page after the last one reads as the last one.
 */
export function communeRows(
  q: string,
  page: number,
  counts: ServingCounts,
  origin: string,
): { rows: CommuneRow[]; page: number; pages: number; total: number } {
  const all: CommuneRow[] = [];
  for (const { ins, name } of matchingCommunes(q)) {
    const slug = communeSlug(ins);
    const shareUrl = communeShareUrl(origin, ins);
    if (!slug || !shareUrl) continue;
    all.push({ ins, name, slug, postcodes: postcodesOf(ins), professionals: professionalsServing(counts, ins), shareUrl });
  }
  all.sort(
    (a, b) =>
      b.professionals - a.professionals ||
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" }) ||
      (a.ins < b.ins ? -1 : a.ins > b.ins ? 1 : 0),
  );
  const pages = Math.max(1, Math.ceil(all.length / COMMUNES_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const from = (current - 1) * COMMUNES_PAGE_SIZE;
  return { rows: all.slice(from, from + COMMUNES_PAGE_SIZE), page: current, pages, total: all.length };
}
