import { describe, expect, it } from "vitest";

import { favoris } from "./favoris";
import { fill } from "./locale";

/**
 * Spec (favoris-marquer, favoris-liste, D-19): every word of the mark and
 * of the list lives in the catalogue and follows the guide's rules (no exclamation mark, em dash or
 * ellipsis, no insurance wording, no price).
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("favoris catalogue", () => {
  const all = strings(favoris.fr);

  it("has words to check", () => {
    expect(all.length).toBe(10);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text).not.toMatch(/€/);
  });

  it("names the list as the navigation does", () => {
    expect(favoris.fr.nav).toBe("Mes professionnelles");
  });

  it("names the professional on a card", () => {
    expect(fill(favoris.fr.ajouterNom, { prenom: "Emma" })).toBe("Ajouter Emma à mes professionnelles");
    expect(fill(favoris.fr.retirerNom, { prenom: "Emma" })).toBe("Retirer Emma de mes professionnelles");
  });
});
