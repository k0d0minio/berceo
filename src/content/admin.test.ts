import { describe, expect, it } from "vitest";

import { adminActionEnum, bookingSideEnum, cancellationKindEnum, paymentStatusEnum, refundReasonEnum } from "@/db/schema";
import { BOOKING_FILTERS, REQUEST_FILTERS } from "@/lib/admin/rules";

import { admin } from "./admin";
import { words } from "./locale";
import { professionnelle } from "./professionnelle";

/**
 * Spec (verification-back-office, D-19): the guide's lines for the
 * verification tool and the journal stay verbatim, the validated line in her
 * space is the guide's, and the words name every journal action. The writing
 * rules over the whole admin catalogue are in professionnelle.test.ts.
 */
const a = words(admin);
const p = words(professionnelle);

describe("the guide's lines, verbatim", () => {
  it("keeps the queue's title and columns", () => {
    expect(a.file.titre).toBe("Dossiers en attente de vérification");
    expect(Object.values(a.file.colonnes)).toEqual([
      "Prénom / Nom",
      "Profession",
      "Date d'inscription",
      "Documents déposés",
      "Statut",
    ]);
  });

  it("keeps the three actions and the validation's confirmation", () => {
    expect([a.decisions.valider, a.decisions.complement, a.decisions.refuser]).toEqual([
      "Valider le profil",
      "Demander un complément",
      "Refuser le profil",
    ]);
    expect(a.decisions.confirmation.valider).toBe(
      "Êtes-vous sûre de vouloir valider le profil de {nom} ? Cette action activera son compte et rendra son profil visible.",
    );
  });

  it("keeps the journal's title and columns", () => {
    expect(a.journal.titre).toBe("Journal des actions administratives");
    expect(Object.values(a.journal.colonnes)).toEqual([
      "Date",
      "Heure",
      "Action",
      "Compte concerné",
      "Administrateur",
    ]);
  });

  it("shows her the guide's line once her profile is validated", () => {
    expect(p.messages.valide).toBe(
      "Votre profil Berceo a été validé. Vous pouvez désormais accéder aux demandes de garde dans votre zone. Bienvenue dans le réseau.",
    );
  });
});

describe("the back-office's lines, verbatim (back-office-admin, D-19)", () => {
  it("keeps the overview's title and its four blocks", () => {
    expect(a.vueEnsemble.titre).toBe("Vue d'ensemble");
    expect(Object.values(a.vueEnsemble.blocs)).toEqual([
      "Dossiers en attente de validation",
      "Réservations en cours",
      "Signalements à traiter",
      "Paiements récents",
    ]);
  });

  it("keeps the search box and the actions on an account", () => {
    expect(a.utilisateurs.recherche).toBe("Rechercher un utilisateur par nom, e-mail ou téléphone");
    expect([
      a.utilisateurs.voirProfil,
      a.actionsCompte.suspendre,
      a.actionsCompte.reactiver,
      a.actionsCompte.contacter,
      a.actionsCompte.supprimer,
    ]).toEqual([
      "Voir le profil",
      "Suspendre le compte",
      "Réactiver le compte",
      "Contacter l'utilisateur",
      "Supprimer le compte",
    ]);
  });

  it("shows the person's name in every confirmation of an act on an account", () => {
    const c = a.actionsCompte.confirmation;
    for (const title of [c.suspendreTitre, c.reactiverTitre, c.supprimerTitre]) expect(title).toContain("{nom}");
    expect(a.actionsCompte.contact.titre).toContain("{nom}");
  });
});

describe("the catalogue covers every key the rules use", () => {
  it("names every filter, report and refusal of the back-office (back-office-admin)", () => {
    for (const filter of BOOKING_FILTERS) expect(a.reservations.filtres[filter]).toBeTruthy();
    for (const filter of REQUEST_FILTERS) expect(a.demandes.filtres[filter]).toBeTruthy();
    for (const kind of cancellationKindEnum.enumValues) {
      for (const side of bookingSideEnum.enumValues) expect(a.signalements.types[kind][side]).toBeTruthy();
    }
    for (const error of ["admin", "supprime", "dejaSuspendu", "nonSuspendu", "gardesAVenir", "nomDifferent", "introuvable", "envoi", "generique"] as const) {
      expect(a.actionsCompte.erreurs[error]).toBeTruthy();
    }
  });

  it("names every journal action", () => {
    for (const action of adminActionEnum.enumValues) expect(a.journal.actions[action]).toBeTruthy();
  });

  it("names every payment status and refund reason (frais-de-service)", () => {
    for (const status of paymentStatusEnum.enumValues) expect(a.paiements.statuts[status]).toBeTruthy();
    for (const reason of refundReasonEnum.enumValues) expect(a.paiements.raisons[reason]).toBeTruthy();
  });

  it("names every queue statut", () => {
    for (const statut of ["enAttente", "complementDemande", "complementRecu", "etudiantes"] as const) {
      expect(a.file.statuts[statut]).toBeTruthy();
    }
  });

  it("points her to no contact address the platform does not have (D-51)", () => {
    expect(p.messages.refuse).not.toMatch(/contact|@/i);
  });
});
