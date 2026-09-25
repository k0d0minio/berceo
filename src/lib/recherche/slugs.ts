import { allCommunes, communeName } from "@/lib/communes";
import { SPACES } from "@/lib/auth/routing";

/**
 * The addresses of the search and the public pages (D-14, D-125, D-127). Pure,
 * so the slugs are tests, not a reading of three routes.
 *
 * - `/professionnelles/[prenom]-[id8]`: her first name, slugged, and the first
 *   eight hexadecimal characters of her profile id. Never her surname (D-14);
 *   the short id keeps two « Marie » apart (D-125).
 * - `/garde-de-nuit/[commune]`: the commune's name, slugged. The 565 names
 *   slug to 565 distinct paths (a test holds it).
 */

export const SEARCH_PATH = `${SPACES.parent}/recherche`;
export const PUBLIC_PROFESSIONALS_PATH = "/professionnelles";
export const COMMUNE_PAGES_PATH = "/garde-de-nuit";

/** Lower case, no accents, every run of non-letters one hyphen: « Marie-Hélène » → « marie-helene ». */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SHORT_ID = /^[0-9a-f]{8}$/;

/** The first eight hexadecimal characters of a profile id. */
export function shortId(profileId: string): string {
  return profileId.slice(0, 8).toLowerCase();
}

/** Her public page. A first name that slugs to nothing leaves the short id alone. */
export function publicProfessionalPath(firstName: string, profileId: string): string {
  const prenom = slugify(firstName);
  const id8 = shortId(profileId);
  return `${PUBLIC_PROFESSIONALS_PATH}/${prenom ? `${prenom}-${id8}` : id8}`;
}

/** The short id a public slug names, or null: the page resolves on it alone. */
export function shortIdOfSlug(slug: string): string | null {
  const id8 = slug.slice(-8).toLowerCase();
  if (!SHORT_ID.test(id8)) return null;
  const rest = slug.slice(0, -8);
  return rest === "" || rest.endsWith("-") ? id8 : null;
}

let slugs: { bySlug: Map<string, string>; byIns: Map<string, string> } | null = null;

function communeSlugs() {
  if (!slugs) {
    slugs = { bySlug: new Map(), byIns: new Map() };
    for (const { ins, name } of allCommunes()) {
      const slug = slugify(name);
      slugs.bySlug.set(slug, ins);
      slugs.byIns.set(ins, slug);
    }
  }
  return slugs;
}

/** The commune a page's slug names, by REFNIS code, or null. */
export function communeOfSlug(slug: string): string | null {
  return communeSlugs().bySlug.get(slug) ?? null;
}

/** A commune's page, or null for an unknown code. */
export function communePath(ins: string): string | null {
  const slug = communeSlugs().byIns.get(ins);
  return slug && communeName(ins) ? `${COMMUNE_PAGES_PATH}/${slug}` : null;
}

/** Every commune page, in the list's order (the sitemap). */
export function allCommunePaths(): string[] {
  return [...communeSlugs().bySlug.keys()].map((slug) => `${COMMUNE_PAGES_PATH}/${slug}`);
}
