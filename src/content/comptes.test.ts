import { describe, expect, it } from "vitest";

import { comptes } from "./comptes";
import { emails } from "./emails";
import { famille } from "./famille";
import { fill } from "./locale";

/**
 * Spec (D-19, D-8): no page or e-mail of the accounts, and no line of the
 * family's profile, uses an exclamation mark, an em dash, an ellipsis or the
 * words "assurance Berceo". Walks every string the three surfaces show.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe.each([
  ["comptes", comptes.fr],
  ["emails", emails.fr],
  ["famille", famille.fr],
])("%s catalogue", (_name, surface) => {
  const all = strings(surface);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(10);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toContain("assurance");
  });
});

describe("the guide's lines, verbatim", () => {
  it("keeps the sign-in error and the neutral reset confirmation", () => {
    expect(comptes.fr.erreurs.identifiants).toBe(
      "L'adresse e-mail ou le mot de passe est incorrect. Vérifiez vos informations et réessayez.",
    );
    expect(comptes.fr.motDePasseOublie.confirmation).toBe(
      "Si un compte existe avec cette adresse, vous recevrez un e-mail dans quelques minutes.",
    );
    expect(comptes.fr.espaces.professionnelle.enAttente).toBe(
      "Votre compte est en attente de validation. Nous vous contacterons dès que votre profil sera activé.",
    );
  });

  it("drops the SMS claim from the phone helper (D-27)", () => {
    expect(comptes.fr.aides.telephone).not.toMatch(/SMS/i);
  });
});

describe("the family profile's words", () => {
  it("asks for no health information and no children's names (D-20)", () => {
    expect(famille.fr.profil.aides.contexte).toMatch(/santé/);
    expect(famille.fr.profil.aides.contexte).toMatch(/enfants/);
  });

  it("says the address is shared only once a booking is confirmed (D-15)", () => {
    expect(famille.fr.profil.aides.adresse).toMatch(/réservation confirmée/);
  });
});

describe("fill", () => {
  it("fills known slots and leaves unknown ones visible", () => {
    expect(fill("Bonjour {prenom},", { prenom: "Julie" })).toBe("Bonjour Julie,");
    expect(fill("Bonjour {prenom},", {})).toBe("Bonjour {prenom},");
  });
});
