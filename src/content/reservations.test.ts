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

  it("names a price only in the rate lines", () => {
    expect(all.filter((text) => text.includes("€"))).toEqual([reservations.fr.tarif, reservations.fr.tarifHeure]);
    expect(reservations.fr.tarif).toBe("{montant} € pour la garde de nuit");
    expect(reservations.fr.tarifHeure).toBe("{montant} € par heure supplémentaire");
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

/**
 * Spec (JAM-306): the adapted schedule has words for both sides. The family
 * reads the start asked for, the start proposed and the new end, and accepts
 * the proposal in words before the payment. The professional reads how to
 * change her proposal. Every slot a line fills is in its text.
 */
describe("the adapted schedule's words (JAM-306)", () => {
  const t = reservations.fr;

  it("gives the family the three times of a proposal, on one night and on a regular request", () => {
    for (const slot of ["{propose}", "{demande}", "{fin}"]) {
      expect(t.famille.horaires.ligne).toContain(slot);
      expect(t.famille.horaires.ligneNuit).toContain(slot);
    }
    expect(t.famille.horaires.ligneNuit).toContain("{date}");
  });

  it("asks the family for an explicit agreement, and says how to refuse", () => {
    expect(t.famille.horaires.accepter).toBe("J'accepte l'horaire proposé par {prenom}.");
    expect(t.famille.horaires.accepterRequis.length).toBeGreaterThan(0);
    expect(t.famille.horaires.explication).toContain("ne réservez pas cette réponse");
    expect(t.famille.erreurs.horaires.length).toBeGreaterThan(0);
  });

  it("gives the professional her own proposal, the choice of the family's start, and a refusal", () => {
    for (const slot of ["{propose}", "{demande}", "{fin}"]) {
      expect(t.professionnelle.horaires.votreProposition).toContain(slot);
      expect(t.professionnelle.horaires.votrePropositionNuit).toContain(slot);
    }
    expect(t.professionnelle.horaires.demandee).toContain("{heure}");
    expect(t.professionnelle.horaires.option).toContain("{fin}");
    expect(t.professionnelle.erreurs.horaire.length).toBeGreaterThan(0);
  });

  it("keeps the start the family asked for readable after the booking", () => {
    expect(t.horaireConvenu.ligne).toContain("{demande}");
    expect(t.horaireConvenu.ligne).toContain("{convenu}");
  });
});
