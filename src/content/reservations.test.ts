import { describe, expect, it } from "vitest";

import { reservations } from "./reservations";

/**
 * Spec (candidature-et-reservation, D-19, D-8, D-4, D-1): every word of the
 * answer, the choice, the profile and the booking lives in the catalogue,
 * follows the guide's rules (no exclamation mark, em dash or ellipsis, no
 * insurance wording), names no price but the professional's own rate, says
 * nothing of how the family pays, and keeps the guide's and the DA's lines
 * verbatim.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("reservations catalogue", () => {
  const all = strings(reservations.fr);

  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(40);
  });

  it.each(all)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toMatch(/assurance|assuré|couverte/);
    expect(text.toLowerCase()).not.toMatch(/virement|espèces|carte bancaire|bancontact/);
  });

  it("names a price only in the rate line", () => {
    expect(all.filter((text) => text.includes("€"))).toEqual([reservations.fr.tarif]);
    expect(reservations.fr.tarif).toBe("{montant} € pour la garde de nuit");
  });
});

describe("the guide's and the DA's lines, verbatim", () => {
  const t = reservations.fr;

  it("keeps « La mise en relation »", () => {
    expect(t.professionnelle.disponible).toBe("Je suis disponible pour cette garde");
    expect(t.professionnelle.confirmation).toBe(
      "Votre disponibilité a bien été transmise à la famille. Vous serez notifiée dès qu'elle aura fait son choix.",
    );
    expect(t.famille.reponsesTitre).toBe("Les professionnelles qui ont répondu à votre demande");
    expect(t.famille.voirProfil).toBe("Voir le profil complet");
    expect(t.famille.accepter).toBe("Accepter et réserver");
    expect(t.profil.priorite).toBe("Lui envoyer ma demande en priorité");
    expect(t.priorite.message).toBe(
      "Votre demande sera envoyée en priorité à {prenom}. Elle restera également visible des autres professionnelles de votre zone jusqu'à confirmation.",
    );
  });

  it("keeps « La réservation », without its insurance line (D-8)", () => {
    expect(t.recapitulatif.titre).toBe("Récapitulatif de votre garde");
    expect(Object.keys(t.recapitulatif.libelles)).toEqual(
      expect.arrayContaining(["date", "heure", "duree", "professionnelle", "profession", "tarif"]),
    );
  });

  it("keeps the DA's profile card line", () => {
    expect(t.profil.verifie).toBe("Profil vérifié par Berceo");
  });
});
