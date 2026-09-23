/**
 * The catalogue's languages.
 *
 * Berceo speaks French only (the scope keeps Dutch and English out of V1),
 * but the catalogue is shaped so a second language is an addition, not a
 * rewrite: add its code to `locales`, then give every surface an entry under
 * that code. French defines the shape; `Catalogue<T>` makes TypeScript refuse
 * a locale that misses a key.
 */
export const locales = ["fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** The shape of a set of words, with the French literals widened to `string`. */
export type Shape<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Shape<U>[]
    : { readonly [K in keyof T]: Shape<T[K]> };

/** One surface's words: French as written, every other locale in the same shape. */
export type Catalogue<T> = { readonly fr: T } & {
  readonly [L in Exclude<Locale, "fr">]: Shape<T>;
};

/** Declares a surface's words; its only job is the type check. */
export function catalogue<const T>(entries: Catalogue<T>): Catalogue<T> {
  return entries;
}

/**
 * Puts values into a catalogue entry's `{name}` slots, e.g.
 * `fill("Bonjour {prenom},", { prenom: "Julie" })`. A slot with no value is
 * left as written, so a missing value shows up in review, not as "undefined".
 */
export function fill(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(/\{(\w+)\}/g, (slot, name: string) =>
    Object.hasOwn(values, name) ? values[name] : slot,
  );
}

/** A surface's words in one locale (French unless told otherwise). */
export function words<T>(
  surface: Catalogue<T>,
  locale: Locale = defaultLocale,
): Shape<T> {
  return surface[locale] as Shape<T>;
}
