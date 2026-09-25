import { catalogue } from "./locale";

/**
 * The founders' back-office. Entries without a tag are the guide's, verbatim
 * ("L'outil de vérification", "Le backoffice"); every other entry is ours,
 * written in its rules and tagged `@relecture`. `{name}` slots are filled with
 * `fill()`.
 */
export const admin = catalogue({
  fr: {
    /** La file d'attente (verification-back-office). */
    file: {
      titre: "Dossiers en attente de vérification",
      colonnes: {
        nom: "Prénom / Nom",
        profession: "Profession",
        date: "Date d'inscription",
        documents: "Documents déposés",
        statut: "Statut",
      },
      /** @relecture Surya — file vide. */
      vide: "Aucun dossier n'attend de vérification.",
      /** @relecture Surya — les quatre statuts de la file (D-50, D-52). */
      statuts: {
        enAttente: "En attente",
        complementDemande: "Complément demandé",
        complementRecu: "Complément reçu",
        etudiantes: "Étudiantes non admises",
      },
      /** @relecture Surya — nombre de fichiers par justificatif, ex. « diplôme (2) ». */
      nombre: "{document} ({n})",
      /** @relecture Surya — noms courts des justificatifs dans la file. */
      documents: {
        diplome: "diplôme",
        attestation_inscription: "attestation d'inscription",
        photo: "photo",
      },
      /** @relecture Surya — lien vers le journal. */
      lienJournal: "Journal des actions administratives",
      /** @relecture Surya — lien vers les paiements (frais-de-service). */
      lienPaiements: "Paiements des frais de service",
    },

    /** La page d'un dossier. */
    dossier: {
      /** @relecture Surya — titre de la page, le nom de la professionnelle. */
      titre: "Dossier de {nom}",
      /** @relecture Surya — retour à la file. */
      retour: "Revenir aux dossiers en attente",
      /** @relecture Surya — titres des sections. */
      sections: {
        identite: "Identité",
        profil: "Profil",
        justificatifs: "Justificatifs",
        declarations: "Déclarations",
        historique: "Historique du dossier",
        decision: "Décision",
      },
      /** @relecture Surya — libellés de l'identité et du profil. */
      champs: {
        email: "E-mail",
        telephone: "Téléphone",
        compteCree: "Compte créé le",
        dossierEnvoye: "Dossier envoyé le",
        statut: "Statut",
        profession: "Profession",
        specialisations: "Spécialisations",
        zone: "Zone d'intervention",
        tarif: "Tarif de nuit",
        experience: "Expérience",
        bio: "Quelques mots sur elle",
        inami: "Numéro INAMI",
        photo: "Photo",
        motif: "Dernier motif",
      },
      /** @relecture Surya — valeurs absentes. */
      aucune: "Aucune",
      nonRenseigne: "Non renseigné",
      /** @relecture Surya — tarif affiché. */
      tarif: "{montant} € par nuit",
      /** @relecture Surya — états du dossier hors file. */
      etats: {
        brouillon: "Dossier en cours de remplissage",
        en_attente: "En attente",
        complement_demande: "Complément demandé",
        valide: "Profil validé",
        refuse: "Profil refusé",
      },
      /** @relecture Surya — les justificatifs. */
      ouvrir: "Ouvrir dans un nouvel onglet",
      pdfIndisponible: "L'aperçu n'est pas disponible sur cet appareil.",
      aucunDocument: "Aucun fichier déposé.",
      /** @relecture Surya — déclarations. */
      accepteeLe: "Acceptée le {date} (version {version})",
      /** @relecture Surya — historique vide. */
      aucunHistorique: "Aucune action sur ce dossier pour le moment.",
      /** @relecture Surya — pas de décision possible dans cet état. */
      sansDecision: "Ce dossier n'attend pas de décision.",
      /** @relecture Surya — dossier d'étudiante retenu par le réglage (D-52). */
      etudiantesRetenue:
        "Berceo n'accueille pas les étudiantes sages-femmes pour le moment. Ce dossier peut recevoir une demande de complément ou un refus, et pourra être validé une fois le réglage activé.",
    },

    /** Les trois actions et leurs confirmations. */
    decisions: {
      valider: "Valider le profil",
      complement: "Demander un complément",
      refuser: "Refuser le profil",
      confirmation: {
        /** La confirmation du guide, avec le prénom et le nom. */
        valider:
          "Êtes-vous sûre de vouloir valider le profil de {nom} ? Cette action activera son compte et rendra son profil visible.",
        /** @relecture Surya — titre de la confirmation de validation. */
        validerTitre: "Valider le profil",
        /** @relecture Surya — confirmation de la demande de complément. */
        complementTitre: "Demander un complément à {nom}",
        complement:
          "Indiquez ce qui manque. Le motif lui sera envoyé par e-mail et s'affichera dans son espace.",
        /** @relecture Surya — confirmation du refus. */
        refuserTitre: "Refuser le profil de {nom}",
        refuser:
          "Indiquez la raison du refus. Elle lui sera envoyée par e-mail et s'affichera dans son espace. Un refus est définitif.",
        /** @relecture Surya — champ du motif. */
        motif: "Motif",
        motifAide: "1 000 caractères au plus.",
        /** @relecture Surya — réponses. */
        oui: "Oui, confirmer",
        non: "Non, revenir au dossier",
      },
      /** @relecture Surya — résultats et erreurs. */
      resultats: {
        valider: "Le profil est validé. L'e-mail de validation est envoyé.",
        complement: "Le complément est demandé. L'e-mail est envoyé.",
        refuser: "Le profil est refusé. L'e-mail est envoyé.",
        emailEchec:
          "La décision est enregistrée, mais l'e-mail n'a pas pu partir. Prévenez la professionnelle autrement.",
      },
      erreurs: {
        motifRequis: "Indiquez un motif.",
        motifLong: "Le motif dépasse 1 000 caractères.",
        traite: "Ce dossier a déjà été traité. Rechargez la page pour voir son état.",
        etudiantes: "Berceo n'accueille pas les étudiantes sages-femmes pour le moment. Ce profil ne peut pas être validé.",
        generique: "Une erreur est survenue. Réessayez dans un instant.",
      },
    },

    /** Le journal des actions administratives. */
    journal: {
      titre: "Journal des actions administratives",
      colonnes: {
        date: "Date",
        heure: "Heure",
        action: "Action",
        compte: "Compte concerné",
        administrateur: "Administrateur",
      },
      /** @relecture Surya — intitulés des actions. */
      actions: {
        profil_valide: "Profil validé",
        complement_demande: "Complément demandé",
        profil_refuse: "Profil refusé",
        reglage_etudiantes: "Réglage : étudiantes sages-femmes",
        documents_supprimes: "Documents supprimés",
        frais_rembourses: "Frais de service remboursés",
      },
      /** @relecture Surya — détail du réglage et de la purge. */
      details: {
        etudiantesAdmises: "étudiantes admises",
        etudiantesNonAdmises: "étudiantes non admises",
        purge: "30 jours après le refus",
      },
      /** @relecture Surya — l'auteur d'une action automatique. */
      automatique: "Berceo (automatique)",
      /** @relecture Surya — journal vide et pagination. */
      vide: "Aucune action enregistrée.",
      precedente: "Page précédente",
      suivante: "Page suivante",
      page: "Page {n}",
      /** @relecture Surya — retour à la file. */
      retour: "Revenir aux dossiers en attente",
    },

    reglages: {
      /** @relecture Surya — titre de la section des réglages. */
      titre: "Réglages",
    },

    /** Le réglage des étudiantes sages-femmes (D-7). */
    etudiantes: {
      /** @relecture Surya — nom du réglage, repris du spec. */
      titre: "Accueillir les étudiantes sages-femmes",
      /** @relecture Surya — ce que fait le réglage. */
      description:
        "Activé, « étudiante sage-femme (3e ou 4e année) » est proposé aux professionnelles qui s'inscrivent. Désactivé, il ne l'est plus, et les dossiers qui le portent déjà le gardent.",
      /** @relecture Surya — état du réglage. */
      active: "Activé",
      desactive: "Désactivé",
      /** @relecture Surya — dernier changement. */
      modifie: "Modifié le {date} par {nom}",
      jamais: "Jamais modifié",
      /** @relecture Surya — boutons et confirmation. */
      activer: "Activer",
      desactiver: "Désactiver",
      confirmation: {
        titreActiver: "Accueillir les étudiantes sages-femmes ?",
        titreDesactiver: "Ne plus accueillir les étudiantes sages-femmes ?",
        descriptionActiver:
          "Les professionnelles qui s'inscrivent pourront choisir « étudiante sage-femme (3e ou 4e année) ».",
        descriptionDesactiver:
          "Ce choix ne sera plus proposé. Les dossiers qui le portent déjà le garderont.",
        oui: "Oui, confirmer",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — échec de l'enregistrement. */
      erreur: "Le réglage n'a pas pu être enregistré. Réessayez dans un instant.",
    },

    /** Les frais de service payés par les familles (frais-de-service, D-101, D-93). */
    paiements: {
      /** @relecture Surya — titre de la page. */
      titre: "Paiements des frais de service",
      /** @relecture Surya — colonnes. */
      colonnes: {
        date: "Date",
        famille: "Famille",
        professionnelle: "Professionnelle",
        nuit: "Nuit",
        tarif: "Tarif",
        frais: "Frais",
        statut: "Statut",
        reference: "Référence Stripe",
      },
      /** Le tarif et les frais, l'euro après le nombre. */
      montant: "{montant} €",
      /** @relecture Surya — les statuts d'un paiement. */
      statuts: {
        en_attente: "Paiement en cours",
        payee: "Payés",
        expiree: "Abandonnés",
        echouee: "Échoués",
        remboursee: "Remboursés",
        remboursement_echoue: "Remboursement échoué",
      },
      /** @relecture Surya — pourquoi les frais ont été remboursés. */
      raisons: {
        annulation_professionnelle: "annulation par la professionnelle",
        reservation_impossible: "réservation devenue impossible",
        berceo: "remboursés par Berceo",
        stripe: "remboursés depuis Stripe",
      },
      /** @relecture Surya — date et raison d'un remboursement. */
      rembourse: "le {date}, {raison}",
      /** @relecture Surya — compte supprimé depuis. */
      inconnu: "Compte supprimé",
      /** @relecture Surya — le bouton et sa confirmation (D-24). */
      rembourser: "Rembourser les frais",
      confirmation: {
        titre: "Rembourser les frais de {nom}",
        description:
          "Les frais de service de {montant} seront intégralement remboursés à la famille. La garde n'est pas annulée. Le motif sera inscrit au journal.",
        motif: "Motif",
        motifAide: "Le motif reste interne à Berceo.",
        oui: "Oui, rembourser",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — le détail de la ligne du journal. */
      detailJournal: "{montant} €, {motif}",
      /** @relecture Surya — résultats du bouton. */
      resultats: {
        rembourses: "Les frais ont été remboursés.",
        echec: "Stripe n'a pas pu rembourser ces frais. Réessayez dans un instant.",
        statut: "Ces frais ne peuvent pas être remboursés.",
        generique: "Le remboursement n'a pas pu être fait. Réessayez dans un instant.",
      },
      /** @relecture Surya — liste vide, pagination, retour. */
      vide: "Aucun paiement enregistré.",
      precedente: "Page précédente",
      suivante: "Page suivante",
      page: "Page {n}",
      retour: "Revenir aux dossiers en attente",
    },
  },
});
