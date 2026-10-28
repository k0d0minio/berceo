import { describe, expect, it } from "vitest";

import { abonnements } from "./abonnements";
import { accueil } from "./accueil";
import { commentCaMarche } from "./comment-ca-marche";
import { common } from "./common";
import { faq } from "./faq";
import { legal } from "./legal";
import { words } from "./locale";
import { photos } from "./photos";
import { quiSommesNous } from "./qui-sommes-nous";
import { tarifs } from "./tarifs";

/*
 * The vitrine's writing rules, asserted over the catalogue's values (never its
 * comments), from the spec's acceptance criteria: Surya's punctuation rules
 * (D-19), no insurance (D-8), no Facebook group (D-23), no amount but the
 * four subscriptions, the 130 € floor and the 3 % fee (feedback round 1,
 * which supersedes D-3 and D-4), and the guide's title and meta lengths.
 */

const surfaces = {
  abonnements: words(abonnements),
  accueil: words(accueil),
  commentCaMarche: words(commentCaMarche),
  common: words(common),
  faq: words(faq),
  legal: words(legal),
  photos: words(photos),
  quiSommesNous: words(quiSommesNous),
  tarifs: words(tarifs),
};

/** Every string in a surface, with the path it sits at. */
function strings(value: unknown, path: string): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([key, item]) =>
      strings(item, `${path}.${key}`),
    );
  return [];
}

const all = Object.entries(surfaces).flatMap(([name, surface]) =>
  strings(surface, name),
);

/* URLs are not prose: the rules apply to what a visitor reads. */
const prose = all.filter(([path]) => !/\.(href|src)$/.test(path));

/*
 * Whole words only, so "rassurant" and "rassurée" pass. Built with the RegExp
 * constructor because the Unicode property escapes and look-behinds postdate
 * the ES2017 target tsc checks literals against.
 */
const word = (pattern: string, flags = "iu") =>
  new RegExp(`(?<!\\p{L})(?:${pattern})(?!\\p{L})`, flags);

const banned: [string, RegExp][] = [
  ["exclamation mark", /!/],
  ["ellipsis", /…|\.\.\./],
  ["em dash", /—/],
  ["insurance (D-8)", word("assurances?|assuré(?:e|es|s)?")],
  ["coverage (D-8)", word("couvert(?:e|es|s)?")],
  ["Facebook group (D-23)", word("facebook")],
];

describe("the vitrine's catalogue", () => {
  it("has prose to check", () => {
    expect(prose.length).toBeGreaterThan(50);
  });

  for (const [rule, pattern] of banned) {
    it(`contains no ${rule}`, () => {
      const offenders = prose.filter(([, text]) => pattern.test(text));
      expect(offenders).toEqual([]);
    });
  }

  it("drops the intro the founders struck out (feedback round 1)", () => {
    const offenders = prose.filter(([, text]) =>
      /Trois étapes de chaque côté/i.test(text),
    );
    expect(offenders).toEqual([]);
  });

  it("names no amount in euros but the four subscriptions and 130 € (feedback round 1)", () => {
    const amounts = prose.flatMap(([path, text]) =>
      [...text.matchAll(/(\d[\d  .,]*)\s*€/g)].map(
        (match) => [path, match[1].replace(/[\s  ]/g, "")] as const,
      ),
    );
    expect(amounts.length).toBeGreaterThan(0);
    expect(
      amounts.filter(
        ([, amount]) =>
          !["24,90", "59,90", "94,90", "159,90", "130"].includes(amount),
      ),
    ).toEqual([]);
  });

  it("names no percentage but the 3 % fee (D-2)", () => {
    const percents = prose.flatMap(([path, text]) =>
      [...text.matchAll(/(\d[\d,]*)\s*%/g)].map(
        (match) => [path, match[1]] as const,
      ),
    );
    expect(percents.length).toBeGreaterThan(0);
    expect(percents.filter(([, n]) => n !== "3")).toEqual([]);
  });

  it("never says there is no subscription (feedback round 1)", () => {
    const offenders = prose.filter(([, text]) =>
      /(?:sans|aucun|pas d['’])\s*abonnements?/i.test(text),
    );
    expect(offenders).toEqual([]);
  });
});

describe("the subscriptions on « Tarifs »", () => {
  it("lists the four plans of the devis, in its order", () => {
    expect(surfaces.abonnements.plans).toEqual([
      { name: "Découverte", duree: "1 mois", prix: "24,90 €" },
      { name: "Parenthèse", duree: "3 mois", prix: "59,90 €" },
      { name: "Sérénité", duree: "6 mois", prix: "94,90 €" },
      { name: "Premium", duree: "12 mois", prix: "159,90 €" },
    ]);
  });

  it("sets the night rate from 130 € and names no ceiling", () => {
    const [rate] = surfaces.tarifs.tarif.paragraphs;
    expect(rate).toContain("à partir de 130 €");
    expect(rate).not.toMatch(/\bentre\b|maximum|jusqu/i);
  });
});

describe("the vitrine's titles and meta descriptions", () => {
  const metas = [
    surfaces.accueil.meta,
    surfaces.commentCaMarche.familles.meta,
    surfaces.commentCaMarche.professionnelles.meta,
    surfaces.tarifs.meta,
    surfaces.faq.meta,
    surfaces.quiSommesNous.meta,
    surfaces.legal.conditionsGenerales.meta,
    surfaces.legal.confidentialite.meta,
  ];
  const length = (text: string) => [...text].length;

  it.each(metas.map((meta) => [meta.title, meta.description]))(
    "%s is 50 to 60 characters, its description 140 to 160",
    (title, description) => {
      expect(length(title)).toBeGreaterThanOrEqual(50);
      expect(length(title)).toBeLessThanOrEqual(60);
      expect(length(description)).toBeGreaterThanOrEqual(140);
      expect(length(description)).toBeLessThanOrEqual(160);
    },
  );

  it("never repeats a title or a description", () => {
    const titles = metas.map((meta) => meta.title);
    const descriptions = metas.map((meta) => meta.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});

describe("the FAQ's links", () => {
  it("each names a page of the URL map", () => {
    const pages = Object.keys(surfaces.common.pages);
    const linked = surfaces.faq.groups.flatMap((group) =>
      group.items.flatMap((item) => ("link" in item ? [item.link.page] : [])),
    );
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.filter((page) => !pages.includes(page))).toEqual([]);
  });
});
