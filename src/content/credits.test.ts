import { describe, expect, it } from "vitest";

import { creditsFamille } from "./credits";
import { fill } from "./locale";
import { CREDIT_ORIGINS } from "@/lib/credits/rules";

/**
 * Spec (credits-registre, D-19): every word of « Mes crédits » lives in the
 * catalogue and follows the guide's rules (no exclamation mark, em dash or
 * ellipsis, no insurance wording, no price). The € stands only after a
 * `{montant}` slot (D-99).
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("credits catalogue", () => {
  const all = strings(creditsFamille.fr);

  it("has words to check", () => {
    expect(all.length).toBe(14);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text).not.toMatch(/\d+ ?€/);
  });

  it("writes the € after the amount's slot only", () => {
    for (const text of all.filter((line) => line.includes("€"))) {
      expect(text).toContain("{montant} €");
    }
  });

  it("names every origin of the rules", () => {
    expect(Object.keys(creditsFamille.fr.origines).sort()).toEqual([...CREDIT_ORIGINS].sort());
  });

  it("fills a credit's line", () => {
    expect(fill(creditsFamille.fr.valable, { montant: "4,50", date: "29/10/2028" })).toBe(
      "4,50 €, valable jusqu'au 29/10/2028",
    );
    expect(fill(creditsFamille.fr.solde, { montant: "0,00" })).toBe("Votre solde : 0,00 €");
  });
});
