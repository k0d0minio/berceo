import { describe, expect, it } from "vitest";

import { adminActionEnum } from "@/db/schema";

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

describe("the catalogue covers every key the rules use", () => {
  it("names every journal action", () => {
    for (const action of adminActionEnum.enumValues) expect(a.journal.actions[action]).toBeTruthy();
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
