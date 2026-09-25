import { describe, expect, it } from "vitest";

import { messagerie } from "./messagerie";

/**
 * Spec (messagerie, D-19, D-8, D-87, D-88): every word of the lists, the
 * conversation and Berceo's two messages lives in the catalogue, follows the
 * guide's rules (no exclamation mark, em dash or ellipsis, no insurance
 * wording), and keeps the guide's opening line and the two Berceo messages as
 * §2 of the spec quotes them.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("messagerie catalogue", () => {
  const all = strings(messagerie.fr);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(25);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toMatch(/assurance|assurée|couverte/);
  });
});

describe("the guide's and the cahier des charges' lines", () => {
  const t = messagerie.fr;

  it("keeps the guide's opening line for the family", () => {
    expect(t.liste.introFamille).toBe(
      "La messagerie s'ouvre dès qu'une professionnelle postule à votre demande. Vous pouvez échanger pour préciser les modalités de la garde.",
    );
  });

  it("keeps the guide's amorce, « Bonjour. » for « Bonjour ! » (D-87)", () => {
    expect(t.berceo.amorce).toBe(
      "Bonjour. Pour préparer au mieux cette garde, nous vous suggérons d'échanger sur : le rythme de votre bébé, ses habitudes d'endormissement, et tout ce que vous souhaitez partager sur son quotidien. La professionnelle répondra dès que possible.",
    );
  });

  it("keeps the cahier des charges' booking message, its « ! » as « . » and its 🤍 (D-87)", () => {
    expect(t.berceo.bonneGarde).toBe(
      "L'équipe Berceo vous souhaite une excellente garde. 🤍 N'hésitez pas également à confirmer ensemble les derniers détails pratiques (heure d'arrivée, adresse, accès au domicile, besoins particuliers du bébé, etc.). Nous vous souhaitons une belle expérience et une garde en toute sérénité.",
    );
  });

  it("rewords the guide's reminder without its insurance claim (D-88)", () => {
    expect(t.conversation.rappel).toBe("Une garde est réservée une fois confirmée sur Berceo.");
  });

  it("names the closed conversation as the spec does (D-89)", () => {
    expect(t.conversation.fermee).toBe("Cette conversation est fermée. Vous pouvez toujours la relire.");
  });
});
