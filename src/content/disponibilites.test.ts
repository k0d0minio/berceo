import { describe, expect, it } from "vitest";

import { disponibilites } from "./disponibilites";

/**
 * Spec (disponibilites-indicatives, D-19, D-8, D-12): every word of « Mes
 * disponibilités » and of « Prochaines disponibilités » lives in the catalogue,
 * follows the guide's rules (no exclamation mark, em dash or ellipsis, no
 * insurance wording, no price), and the guide's lines stay verbatim.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("disponibilites catalogue", () => {
  const all = strings(disponibilites.fr);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(30);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text.toLowerCase()).not.toMatch(/couverte|€/);
  });
});

describe("the guide's lines, verbatim", () => {
  const t = disponibilites.fr;

  it("keeps the professional's title, instructions, buttons and help message", () => {
    expect(t.professionnelle.titre).toBe("Mes disponibilités");
    expect(t.professionnelle.instructions).toBe(
      "Indiquez les nuits où vous êtes disponible. Ces informations sont indicatives : vous restez libre d'accepter ou de refuser toute demande.",
    );
    expect(t.professionnelle.boutons.disponible).toBe("Disponible");
    expect(t.professionnelle.boutons.indisponible).toBe("Indisponible");
    expect(t.professionnelle.aide).toBe(
      "Vos disponibilités ne sont pas contractuelles. Vous pouvez les modifier à tout moment et rester libre de refuser une demande même si vous avez indiqué être disponible.",
    );
  });

  it("keeps the families' heading and caveat", () => {
    expect(t.famille.titre).toBe("Prochaines disponibilités");
    expect(t.famille.avertissement).toBe(
      "Ces disponibilités sont indicatives. La professionnelle confirmera lors de l'acceptation de votre demande.",
    );
  });

  it("never tells a family she is unavailable (D-80)", () => {
    expect(t.famille.vide.toLowerCase()).not.toMatch(/indisponible|pas disponible/);
  });

  it("names the seven days from Monday and the twelve months", () => {
    expect(t.nuits.jours).toHaveLength(7);
    expect(t.nuits.jours[0]).toBe("lundi");
    expect(t.nuits.joursCourts).toHaveLength(7);
    expect(t.nuits.mois).toHaveLength(12);
  });
});
