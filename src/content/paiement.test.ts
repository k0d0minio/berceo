import { describe, expect, it } from "vitest";

import { paiement } from "./paiement";
import { tarifs } from "./tarifs";

/**
 * Spec (frais-de-service, D-19, D-8, D-87): every word of the fee lives in
 * the catalogue, follows the guide's rules (no exclamation mark, em dash or
 * ellipsis, no insurance wording), names no amount but the fee and the 3 %,
 * and repeats the Tarifs page's two sentences word for word.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("paiement catalogue", () => {
  const all = strings(paiement.fr);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(10);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toMatch(/assurance|assuré|couverte/);
  });

  it("names no amount but the fee's slot and the 3 %", () => {
    expect(all.filter((text) => text.includes("€"))).toEqual([paiement.fr.recapitulatif.montant]);
    expect(paiement.fr.recapitulatif.montant).toBe("{montant} €");
    const percents = all.flatMap((text) => [...text.matchAll(/(\d+)\s*%/g)].map((match) => match[1]));
    expect(percents.length).toBeGreaterThan(0);
    expect(percents.every((n) => n === "3")).toBe(true);
  });
});

describe("the fee sentences, as the Tarifs page says them", () => {
  it("keeps the guide's sentence and the refund rule", () => {
    const [guide, refund] = tarifs.fr.frais.paragraphs;
    expect(guide.startsWith(paiement.fr.recapitulatif.prelevement)).toBe(true);
    expect(paiement.fr.recapitulatif.remboursement).toBe(refund);
  });
});
