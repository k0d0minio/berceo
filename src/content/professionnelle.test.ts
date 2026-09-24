import { describe, expect, it } from "vitest";

import { DECLARATIONS, EXPERIENCES, PROFESSIONS, SPECIALISATIONS } from "@/lib/professionnelle/rules";

import { admin } from "./admin";
import { professionnelle } from "./professionnelle";

/**
 * Spec (D-19, D-8, D-7): every word of the onboarding, the file page and the
 * students switch lives in the catalogue; none uses an exclamation mark, an
 * em dash, an ellipsis or insurance wording; students are never called
 * "diplômées"; the guide's lines stay verbatim.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe.each([
  ["professionnelle", professionnelle.fr],
  ["admin", admin.fr],
])("%s catalogue", (_name, surface) => {
  const all = strings(surface);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(5);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text.toLowerCase()).not.toMatch(/assur(é|e)e?s? par berceo|couverte/);
    expect(text.toLowerCase()).not.toContain("diplômées");
  });
});

describe("the guide's lines, verbatim", () => {
  const t = professionnelle.fr;

  it("keeps the four step titles", () => {
    expect(t.etapes.titres).toEqual({
      compte: "Créez votre compte",
      profil: "Complétez votre profil",
      justificatifs: "Déposez vos justificatifs",
      declarations: "Validez vos déclarations",
    });
  });

  it("keeps the profile's field labels", () => {
    expect(t.champs.profession).toBe("Ma profession");
    expect(t.champs.specialisations).toBe("Mes spécialisations");
    expect(t.champs.zone).toBe("Ma zone d'intervention");
    expect(t.champs.tarif).toBe("Mon tarif de nuit");
    expect(t.champs.experience).toBe("Mon expérience");
    expect(t.champs.bio).toBe("Quelques mots sur moi");
  });

  it("keeps the message after submission and its 24-working-hour promise", () => {
    expect(t.messages.envoye).toBe(
      "Votre dossier est bien reçu. Nous le vérifierons dans les 24 heures ouvrables. Vous recevrez un e-mail dès que votre profil sera activé.",
    );
  });
});

describe("the catalogue covers every key the rules use", () => {
  const t = professionnelle.fr;

  it("names every profession, spécialisation, experience and declaration", () => {
    expect(Object.keys(t.professions).sort()).toEqual([...PROFESSIONS].sort());
    expect(Object.keys(t.justificatifs.documents).sort()).toEqual([...PROFESSIONS].sort());
    expect(Object.keys(t.specialisations).sort()).toEqual([...SPECIALISATIONS].sort());
    expect(Object.keys(t.experiences).sort()).toEqual([...EXPERIENCES].sort());
    expect(Object.keys(t.declarations.textes).sort()).toEqual([...DECLARATIONS].sort());
  });

  it("offers the student option by name (D-7)", () => {
    expect(t.professions.etudiante_sage_femme).toBe("Étudiante sage-femme (3e ou 4e année)");
  });
});
