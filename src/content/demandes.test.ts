import { describe, expect, it } from "vitest";

import { demandes } from "./demandes";

/**
 * Spec (demande-de-garde, D-19, D-8, D-20): every word of the request form, the
 * lists and the card lives in the catalogue, follows the guide's rules (no
 * exclamation mark, em dash or ellipsis, no insurance wording, no price), and
 * the guide's lines for the form and the urgent message stay verbatim.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("demandes catalogue", () => {
  const all = strings(demandes.fr);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(40);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
    expect(text.toLowerCase()).not.toMatch(/couverte|€/);
  });
});

describe("the guide's lines, verbatim", () => {
  const t = demandes.fr;

  it("keeps the form's title, subtitle, labels and notes", () => {
    expect(t.formulaire.titre).toBe("Publier une demande de garde de nuit");
    expect(t.formulaire.sousTitre).toBe(
      "Plus votre demande est précise, plus vite vous trouverez la professionnelle qui vous correspond.",
    );
    expect(t.formulaire.champs).toMatchObject({
      date: "Date de la garde",
      heure: "Heure de début",
      enfants: "Nombre d'enfants",
      age: "Âge du bébé",
      commune: "Votre commune",
    });
    expect(t.formulaire.aides.heure).toBe("La garde de nuit standard est de 11 heures.");
    expect(t.formulaire.aides.commune).toBe(
      "L'adresse exacte sera communiquée uniquement après confirmation de la réservation.",
    );
    expect(t.formulaire.enfants).toEqual({ un_bebe: "Un bébé", jumeaux: "Jumeaux" });
  });

  it("keeps the mandatory checkbox (D-20)", () => {
    expect(t.formulaire.confirmation).toBe(
      "Mon enfant n'a pas de condition médicale particulière nécessitant des soins spécialisés.",
    );
  });

  it("keeps the urgent button and the message after an urgent request", () => {
    expect(t.boutons.publierUrgente).toBe("Publier une demande urgente");
    expect(t.confirmations.publieeUrgente).toBe(
      "Votre demande urgente a bien été publiée. Les professionnelles disponibles dans votre zone seront notifiées immédiatement. Nous ne pouvons garantir qu'une professionnelle sera disponible dans ce délai, mais nous faisons tout pour vous aider.",
    );
  });

  it("writes the numbers the age needs, 0 to 24", () => {
    expect(t.carte.nombres).toHaveLength(25);
    expect(t.carte.nombres[3]).toBe("trois");
  });
});
