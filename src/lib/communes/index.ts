import { COMMUNES, LOCALITIES } from "./data";

/**
 * The official list of Belgian postal localities and their communes, shared by
 * every feature that places someone: the family's commune (profil-famille), the
 * communes a professional serves, a request's commune, the search. A commune is
 * identified by its REFNIS (INS) code; a locality by its postcode and name.
 *
 * Pure and dependency-free, so the profile form's combobox searches it in the
 * browser and the server validates against the same data.
 */

export type Locality = {
  postcode: string;
  /** The name shown: French where one exists, e.g. « Ixelles ». */
  locality: string;
  /** The commune's REFNIS (INS) code, e.g. "21009". */
  ins: string;
  /** The commune's name, e.g. « Ixelles », « Merelbeke-Melle ». */
  commune: string;
};

type Indexed = Locality & { keys: string[] };

/** Lower-case, no accents, no punctuation: « Saint-Josse » and « saint josse » meet. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

let index: Indexed[] | null = null;

function all(): Indexed[] {
  if (index) return index;
  index = LOCALITIES.map(([postcode, locality, ins, alias]) => {
    const commune = COMMUNES[ins];
    const names = [locality, alias, commune.name, ...(commune.aliases ?? [])];
    return {
      postcode,
      locality,
      ins,
      commune: commune.name,
      keys: [...new Set(names.filter((n): n is string => !!n).map(normalize))],
    };
  });
  return index;
}

function strip({ postcode, locality, ins, commune }: Indexed): Locality {
  return { postcode, locality, ins, commune };
}

/**
 * Localities matching what a person typed: a postcode prefix (« 105 ») or part
 * of a name (« ixel », « elsene »), accents and case ignored. Names that start
 * with the query come first, then postcode order.
 */
export function searchLocalities(query: string, limit = 20): Locality[] {
  const q = normalize(query);
  if (q === "") return [];

  const digits = q.replace(/ /g, "");
  if (/^\d+$/.test(digits)) {
    return all()
      .filter((l) => l.postcode.startsWith(digits))
      .slice(0, limit)
      .map(strip);
  }

  const starts: Indexed[] = [];
  const contains: Indexed[] = [];
  for (const l of all()) {
    if (l.keys.some((k) => k.startsWith(q) || k.includes(` ${q}`))) starts.push(l);
    else if (l.keys.some((k) => k.includes(q))) contains.push(l);
  }
  return [...starts, ...contains].slice(0, limit).map(strip);
}

/** The list entry for a postcode and locality, or null when there is none. */
export function findLocality(postcode: string, locality: string): Locality | null {
  const found = all().find((l) => l.postcode === postcode && l.locality === locality);
  return found ? strip(found) : null;
}

/** The commune's name for a REFNIS code, or null for an unknown code. */
export function communeName(ins: string): string | null {
  // Own keys only: « constructor » or « toString » is not a commune.
  return Object.hasOwn(COMMUNES, ins) ? COMMUNES[ins].name : null;
}

/** « 1050 Ixelles », or « 9090 Gontrode (Merelbeke-Melle) » for a sub-locality. */
export function localityLabel({ postcode, locality, commune }: Locality): string {
  return locality === commune || locality.startsWith(`${commune} (`)
    ? `${postcode} ${locality}`
    : `${postcode} ${locality} (${commune})`;
}

/** The single form value a combobox posts for a locality: « 1050|Ixelles ». */
export function localityValue({ postcode, locality }: Pick<Locality, "postcode" | "locality">): string {
  return `${postcode}|${locality}`;
}

/** The list entry a posted form value names, or null when it names none. */
export function parseLocalityValue(value: string): Locality | null {
  const at = value.indexOf("|");
  if (at < 0) return null;
  return findLocality(value.slice(0, at), value.slice(at + 1));
}

// ---------------------------------------------------------------------------
// Communes, for a zone (onboarding-professionnelle, D-11)
// ---------------------------------------------------------------------------

/** A commune as a professional's zone lists it: its code, its name, its postcodes. */
export type Commune = { ins: string; name: string; postcodes: string[] };

/** Whether a REFNIS code names a current commune. */
export function isKnownCommune(ins: string): boolean {
  return communeName(ins) !== null;
}

/**
 * Communes matching what a person typed, through their localities: a postcode
 * prefix or part of a name (the commune's, a locality's, or their other
 * official name). One entry per commune, in the order its first locality
 * matched, with every postcode the commune has.
 */
export function searchCommunes(query: string, limit = 8): Commune[] {
  const seen = new Map<string, Commune>();
  for (const l of searchLocalities(query, 200)) {
    if (!seen.has(l.ins)) seen.set(l.ins, { ins: l.ins, name: l.commune, postcodes: postcodesOf(l.ins) });
    if (seen.size >= limit) break;
  }
  return [...seen.values()];
}

let postcodes: Map<string, string[]> | null = null;

/** Every postcode serving a commune, in order (built once, then a lookup). */
export function postcodesOf(ins: string): string[] {
  if (!postcodes) {
    postcodes = new Map();
    for (const l of all()) {
      const list = postcodes.get(l.ins) ?? [];
      if (!list.includes(l.postcode)) list.push(l.postcode);
      postcodes.set(l.ins, list);
    }
    for (const list of postcodes.values()) list.sort();
  }
  return postcodes.get(ins) ?? [];
}

// ---------------------------------------------------------------------------
// Communes, for the search and the commune pages (recherche-et-fiches-publiques)
// ---------------------------------------------------------------------------

/** Every current commune, by REFNIS code, in the list's order. */
export function allCommunes(): { ins: string; name: string }[] {
  return Object.entries(COMMUNES).map(([ins, commune]) => ({ ins, name: commune.name }));
}

/** Every commune a four-digit postcode covers, once each, in list order. */
export function communesOfPostcode(postcode: string): string[] {
  const codes: string[] = [];
  for (const l of all()) {
    if (l.postcode === postcode && !codes.includes(l.ins)) codes.push(l.ins);
  }
  return codes;
}

/**
 * The one commune whose name, or other official name, is exactly what was
 * typed (accents, case and punctuation ignored); null when none or several.
 */
export function communeByName(query: string): string | null {
  const q = normalize(query);
  if (q === "") return null;
  const found = Object.entries(COMMUNES).filter(([, commune]) =>
    [commune.name, ...(commune.aliases ?? [])].some((name) => normalize(name) === q),
  );
  return found.length === 1 ? found[0][0] : null;
}
