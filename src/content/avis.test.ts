import { describe, expect, it } from "vitest";

import { avis } from "./avis";
import { emails } from "./emails";

/**
 * Spec (avis-etoiles, D-19, D-8, D-18, D-115): every word of the ratings lives
 * in the catalogue and follows the guide's rules (no exclamation mark, em dash
 * or ellipsis, no insurance wording, no price); the criteria are the four of
 * each side; the guide's post-garde e-mail and its button stay verbatim.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const all = [...strings(avis.fr), ...strings(emails.fr.avisFamille), ...strings(emails.fr.avisProfessionnelle)];

describe("avis catalogue", () => {
  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(30);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text.toLowerCase()).not.toMatch(/couverte|€/);
    expect(text.toLowerCase()).not.toContain("diplômée");
  });
});

describe("the criteria (D-115)", () => {
  it("are the family's four and the professional's four, in order", () => {
    expect(Object.values(avis.fr.criteres.famille)).toEqual(["Ponctualité", "Communication", "Soin", "Confiance"]);
    expect(Object.values(avis.fr.criteres.professionnelle)).toEqual([
      "Accueil",
      "Communication",
      "Clarté des consignes",
      "Respect du cadre",
    ]);
  });
});

describe("the guide's lines, verbatim", () => {
  it("keeps the button of the post-garde e-mail", () => {
    expect(avis.fr.lien).toBe("Laisser un avis");
  });

  it("keeps the family's post-garde e-mail", () => {
    const e = emails.fr.avisFamille;
    expect(e.objet).toBe("Votre garde avec {prenom} est terminée : partagez votre retour");
    expect(e.corps).toBe(
      "La garde de {prenom} s'est terminée. Votre retour nous aide à maintenir la qualité du réseau Berceo. Cela prend moins de 2 minutes.",
    );
    expect(e.cta).toBe("Laisser un avis");
  });

  it("gives the professional the same button", () => {
    expect(emails.fr.avisProfessionnelle.cta).toBe("Laisser un avis");
  });
});
