import { describe, expect, it } from "vitest";

import { DECLARATIONS, DECLARATIONS_VERSION, PROFESSIONS } from "@/lib/professionnelle/rules";
import { declarationText } from "@/lib/professionnelle/wording";

import { admin } from "./admin";
import { charte } from "./charte";
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
  ["charte", charte.fr],
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
    expect(t.champs.zone).toBe("Ma zone d'intervention");
    expect(t.champs.tarif).toBe("Mon tarif de nuit");
    expect(t.champs.bio).toBe("Quelques mots sur moi");
  });

  it("names the trainings with the founders' word, and asks for no experience (onboarding-retour-1)", () => {
    expect(t.champs.formations).toBe("Formations complémentaires");
    expect(t.champs).not.toHaveProperty("specialisations");
    expect(t.champs).not.toHaveProperty("experience");
    expect(t).not.toHaveProperty("experiences");
    expect(t).not.toHaveProperty("specialisations");
  });

  it("keeps the message after submission and its 24-working-hour promise", () => {
    expect(t.messages.envoye).toBe(
      "Votre dossier est bien reçu. Nous le vérifierons dans les 24 heures ouvrables. Vous recevrez un e-mail dès que votre profil sera activé.",
    );
  });
});

describe("the catalogue covers every key the rules use", () => {
  const t = professionnelle.fr;

  it("names every profession and declaration", () => {
    expect(Object.keys(t.professions).sort()).toEqual([...PROFESSIONS].sort());
    expect(Object.keys(t.justificatifs.documents).sort()).toEqual([...PROFESSIONS].sort());
    expect(Object.keys(t.declarations.textes).sort()).toEqual([...DECLARATIONS].sort());
  });

  it("names each student year (D-7, onboarding-retour-1)", () => {
    expect(t.professions.etudiante_sage_femme_3e).toBe("Étudiante sage-femme, 3e année");
    expect(t.professions.etudiante_sage_femme_4e).toBe("Étudiante sage-femme, 4e année");
  });

  it("marks the INAMI field as optional", () => {
    expect(t.champs.inami).toBe("Mon numéro INAMI (facultatif)");
  });
});

describe("the declarations and the charter, in the founders' words (onboarding-retour-1)", () => {
  const t = professionnelle.fr.declarations;

  it("keeps the two sentences of the founders", () => {
    expect(t.textes.casier_judiciaire).toBe(
      "Je déclare et certifie que mon extrait de casier judiciaire destiné aux activités avec des mineurs est vierge.",
    );
    expect(t.textes.changement_de_situation).toBe(
      "Je m'engage à avertir directement Berceo de tout changement de ma situation qui m'empêcherait de travailler sur la plateforme.",
    );
    expect(t.textes.charte).toBe(
      "J'ai lu et compris la Charte des professionnelles Berceo et je m'engage à la respecter.",
    );
  });

  it("holds the charter's introduction, its 17 sections and « L'engagement Berceo »", () => {
    const c = charte.fr;
    expect(c.title).toBe("Charte des professionnelles Berceo");
    expect(c.intro.title).toBe("Notre engagement");
    expect(c.sections).toHaveLength(17);
    expect(c.sections[0].title).toBe("Une présence professionnelle et bienveillante");
    expect(c.sections[16].title).toBe("Respect de la charte");
    expect(c.engagement.title).toBe("L'engagement Berceo");
    expect(c.engagement.valeurs.map((v) => v.name)).toEqual(["Compétence", "Confiance", "Douceur"]);
  });

  it("reads each acceptance in the words of its version", () => {
    expect(declarationText("casier_judiciaire", "cdc-2026-08-02")).toBe(
      "Je déclare que mon extrait de casier judiciaire destiné aux activités avec des mineurs est vierge.",
    );
    expect(declarationText("casier_judiciaire", DECLARATIONS_VERSION)).toBe(t.textes.casier_judiciaire);
    // A sentence that did not change reads the same under both versions.
    expect(declarationText("verifications", "cdc-2026-08-02")).toBe(t.textes.verifications);
  });
});
