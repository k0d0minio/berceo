import type { Profession } from "@/db/schema";
import { fill, words } from "@/content/locale";
import { recherche } from "@/content/recherche";
import {
  communeByName,
  communeName,
  communesOfPostcode,
  isKnownCommune,
  parseLocalityValue,
} from "@/lib/communes";
import { professionInSentence, professionLabel } from "@/lib/reservations/format";

/**
 * The search's rules (D-11, D-123), pure so each one is a test: what a query
 * resolves to, the order of the results, the zone line and the public pages'
 * titles. `src/lib/recherche/professionals.ts` reads the database with them.
 */

const t = words(recherche);

/** What the family's query names: communes by REFNIS code, nothing typed, or nothing we know. */
export type Resolved =
  | { kind: "communes"; ins: string[] }
  | { kind: "vide" }
  | { kind: "inconnue" };

/**
 * A query, as the search field posts it: a locality picked from the list
 * (« 1050|Ixelles ») → its commune; a four-digit postcode → every commune it
 * covers; a name that is exactly one commune's → that commune; else unknown.
 */
export function resolveQuery(raw: string | null | undefined): Resolved {
  const query = (raw ?? "").trim();
  if (query === "") return { kind: "vide" };

  const picked = parseLocalityValue(query);
  if (picked) return { kind: "communes", ins: [picked.ins] };

  if (/^\d{4}$/.test(query)) {
    const ins = communesOfPostcode(query);
    return ins.length > 0 ? { kind: "communes", ins } : { kind: "inconnue" };
  }

  const byName = communeByName(query);
  return byName ? { kind: "communes", ins: [byName] } : { kind: "inconnue" };
}

/** The communes a result URL names (`?commune=` repeated): known codes only, once each. */
export function communesOfParams(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list)].filter(isKnownCommune).slice(0, 20);
}

/** The result URL for a set of communes. */
export function searchQuery(ins: readonly string[]): string {
  return ins.map((code) => `commune=${encodeURIComponent(code)}`).join("&");
}

/** What the order needs of a professional. */
export type Orderable = { id: string; firstName: string; nextNight: string | null };

/**
 * D-123: the soonest indicative night first, then those with none; ties by
 * first name (French collation), then by profile id so the order never moves.
 */
export function compareProfessionals(a: Orderable, b: Orderable): number {
  if (a.nextNight !== b.nextNight) {
    if (a.nextNight === null) return 1;
    if (b.nextNight === null) return -1;
    return a.nextNight < b.nextNight ? -1 : 1;
  }
  const byName = a.firstName.localeCompare(b.firstName, "fr", { sensitivity: "base" });
  if (byName !== 0) return byName;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function orderProfessionals<T extends Orderable>(list: readonly T[]): T[] {
  return [...list].sort(compareProfessionals);
}

/** Her communes' names, the given ones first (the searched commune), then the rest by name. */
export function zoneNames(communes: readonly string[], first: readonly string[] = []): string[] {
  const named = communes.map((ins) => ({ ins, name: communeName(ins) ?? ins }));
  const lead = named.filter((c) => first.includes(c.ins));
  const rest = named
    .filter((c) => !first.includes(c.ins))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return [...lead, ...rest].map((c) => c.name);
}

/** A card's zone line: at most three names, then how many more. */
export function zoneLine(names: readonly string[]): string {
  const shown = names.slice(0, 3).join(", ");
  const more = names.length - 3;
  if (more <= 0) return fill(t.carte.zone, { communes: shown });
  if (more === 1) return fill(t.carte.zoneEtUneAutre, { communes: shown });
  return fill(t.carte.zoneEtAutres, { communes: shown, n: String(more) });
}

/** The zone a professional's meta names: her first commune by name, « et environs » for more. */
export function metaZone(communes: readonly string[]): string {
  const names = zoneNames(communes);
  if (names.length === 0) return t.meta.zoneBelgique;
  return names.length === 1 ? names[0] : fill(t.meta.zoneEtEnvirons, { commune: names[0] });
}

/** The guide's title and meta for her page (SEO, « Fiche professionnelle »). */
export function professionalMeta(p: {
  firstName: string;
  profession: Profession | null;
  communes: readonly string[];
}): { title: string; description: string } {
  return {
    title: fill(t.meta.ficheTitre, { prenom: p.firstName, profession: professionLabel(p.profession) }),
    description: fill(t.meta.ficheDescription, {
      prenom: p.firstName,
      profession: professionInSentence(p.profession),
      zone: metaZone(p.communes),
    }),
  };
}

/** A commune page's title and meta, unique per commune. */
export function communeMeta(commune: string): { title: string; description: string } {
  return {
    title: fill(t.meta.communeTitre, { commune }),
    description: fill(t.meta.communeDescription, { commune }),
  };
}
