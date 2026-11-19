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
        formations: "Formations complémentaires",
        zone: "Zone d'intervention",
        /** @relecture Surya — le rayon autour de ses communes (profil-zone-rayon-saisie). */
        rayon: "Rayon",
        tarif: "Tarif de nuit",
        /** @relecture Surya — profil-tarifs. */
        tarifHeure: "Heure supplémentaire",
        bio: "Quelques mots sur elle",
        inami: "Numéro INAMI",
        photo: "Photo",
        motif: "Dernier motif",
      },
      /** @relecture Surya — valeurs absentes. */
      aucune: "Aucune",
      nonRenseigne: "Non renseigné",
      /** @relecture Surya — le numéro INAMI est facultatif (onboarding-retour-1). */
      inamiNonRenseigne: "INAMI non renseigné",
      /** @relecture Surya — tarif affiché. */
      tarif: "{montant} € par nuit",
      /** @relecture Surya — profil-tarifs. */
      tarifHeure: "{montant} € par heure",
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
        compte_suspendu: "Compte suspendu",
        compte_reactive: "Compte réactivé",
        compte_supprime: "Compte supprimé",
        utilisateur_contacte: "Utilisateur contacté",
        signalement_traite: "Signalement traité",
        reglage_delai_annulation: "Réglage : délai d'annulation",
        /** @relecture Surya — les actions des fondatrices sur une garde et ses frais (annulations-back-office). */
        credit_accorde: "Crédit Berceo accordé",
        garde_annulee_berceo: "Garde annulée par Berceo",
      },
      /** @relecture Surya — détail du réglage, de la purge, du message et du signalement. */
      details: {
        etudiantesAdmises: "étudiantes admises",
        etudiantesNonAdmises: "étudiantes non admises",
        purge: "30 jours après le refus",
        suppression: "après la suppression du compte",
        objet: "Objet : {objet}",
        garde: "Garde du {date}",
        delai: "{heures} heures avant le début de la garde",
      },
      /** @relecture Surya — l'auteur d'une action automatique. */
      automatique: "Berceo (automatique)",
      /** @relecture Surya — journal vide et pagination. */
      vide: "Aucune action enregistrée.",
      precedente: "Page précédente",
      suivante: "Page suivante",
      page: "Page {n}",
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
        "Activé, « étudiante sage-femme, 3e année » et « étudiante sage-femme, 4e année » sont proposés aux professionnelles qui s'inscrivent. Désactivé, ils ne le sont plus, et les dossiers qui portent déjà l'un d'eux le gardent.",
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
          "Les professionnelles qui s'inscrivent pourront choisir « étudiante sage-femme, 3e année » ou « étudiante sage-femme, 4e année ».",
        descriptionDesactiver:
          "Ces deux choix ne seront plus proposés. Les dossiers qui portent déjà l'un d'eux le garderont.",
        oui: "Oui, confirmer",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — échec de l'enregistrement. */
      erreur: "Le réglage n'a pas pu être enregistré. Réessayez dans un instant.",
    },

    /**
     * Le délai d'annulation (annulations-delai-et-motif, les réponses [9.2]) :
     * combien d'heures avant le début une annulation devient tardive. Le
     * barème des frais qui le lit arrive avec annulations-table.
     */
    delaiAnnulation: {
      /** @relecture Surya — nom du réglage. */
      titre: "Délai d'annulation",
      /** @relecture Surya — ce que fait le réglage. */
      description:
        "Une annulation faite moins de ce nombre d'heures avant le début de la garde est tardive. Le délai se compte en heures entières, de 1 à 168.",
      /** @relecture Surya — valeur actuelle. */
      actuel: "{heures} heures avant le début de la garde",
      /** @relecture Surya — dernier changement. */
      modifie: "Modifié le {date} par {nom}",
      jamais: "Jamais modifié",
      /** @relecture Surya — le champ et le bouton. */
      champ: "Nouveau délai, en heures",
      enregistrer: "Enregistrer le délai",
      confirmation: {
        titre: "Changer le délai d'annulation ?",
        description: "Le délai passera de {avant} à {apres} heures avant le début de la garde.",
        oui: "Oui, confirmer",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — valeur refusée, inchangée, ou échec de l'enregistrement. */
      invalide: "Indiquez un nombre entier d'heures, de 1 à 168.",
      inchange: "Le délai est déjà de {heures} heures.",
      erreur: "Le délai n'a pas pu être enregistré. Réessayez dans un instant.",
      /** @relecture Surya — après l'enregistrement. */
      enregistre: "Le délai est enregistré.",
    },

    /** Les avis après les gardes (avis-etoiles, G-03, D-118), en lecture seule. */
    avis: {
      /** @relecture Surya — titre de la page. */
      titre: "Avis après les gardes",
      /** @relecture Surya — ce que la page montre. */
      intro:
        "Chaque avis donné par une famille ou une professionnelle, le plus récent en premier, publié ou non. Un avis compte dans la note dès que les deux côtés ont donné le leur, ou 14 jours après la garde.",
      /** @relecture Surya — colonnes. */
      colonnes: {
        donne: "Donné le",
        garde: "Garde",
        par: "Par",
        sur: "Sur",
        notes: "Étoiles",
        moyenne: "Moyenne",
        etat: "État",
      },
      /** @relecture Surya — le rôle de chaque personne. */
      roles: {
        famille: "famille",
        professionnelle: "professionnelle",
      },
      /** @relecture Surya — une personne et son rôle. */
      personne: "{nom} ({role})",
      /** @relecture Surya — la nuit et la commune de la garde. */
      nuit: "{date}, {commune}",
      /** @relecture Surya — un critère et sa note. */
      critere: "{critere} : {n}",
      /** @relecture Surya — l'état de publication (D-116). */
      etats: {
        publiee: "Publiée",
        enAttente: "En attente de publication",
        annulee: "Garde annulée, ne compte pas",
      },
      /** @relecture Surya — aucun avis encore. */
      vide: "Aucun avis pour l'instant.",
      /** @relecture Surya — pagination. */
      pages: {
        precedente: "Page précédente",
        suivante: "Page suivante",
        position: "Page {page}",
      },
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
      /** @relecture Surya — la part des frais payée par un crédit Berceo (credits-au-paiement). */
      dontCredit: "dont {montant} en crédit Berceo",
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
      /** @relecture Surya — des frais encore dus après l'annulation par la professionnelle (D-162). */
      aRembourser: "À rembourser",
      /** @relecture Surya — pourquoi ces frais sont à rembourser (D-2). */
      aRembourserDetail: "Garde annulée par la professionnelle, frais dus en entier.",
      /** @relecture Surya — des frais devenus un crédit Berceo de la famille (annulations-table). */
      devenusCredit: "Devenus un crédit Berceo",
      /** @relecture Surya — compte supprimé depuis. */
      inconnu: "Compte supprimé",
      /** @relecture Surya — le bouton et sa confirmation (D-24). */
      rembourser: "Rembourser les frais",
      confirmation: {
        titre: "Rembourser les frais de {nom}",
        description:
          "Les frais de service de {montant} seront intégralement remboursés à la famille. La garde n'est pas annulée. Le motif sera inscrit au journal.",
        /** @relecture Surya — la même confirmation, sur des frais à rembourser (D-164). */
        descriptionARembourser:
          "La professionnelle a annulé cette garde. Les frais de service de {montant} sont dus en entier à la famille. Le motif sera inscrit au journal.",
        /** @relecture Surya — la part payée par crédit revient au crédit de la famille (credits-au-paiement). */
        creditRendu: "La part réglée en crédit Berceo, {montant}, revient au crédit de la famille. Elle n'est pas remboursée sur une carte.",
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
        /** @relecture Surya — des frais devenus un crédit Berceo ne sont pas remboursés en plus (annulations-table). */
        credit: "Ces frais sont devenus un crédit Berceo. Ils ne peuvent pas être remboursés en plus.",
        generique: "Le remboursement n'a pas pu être fait. Réessayez dans un instant.",
      },
      /** @relecture Surya — liste vide et pagination. */
      vide: "Aucun paiement enregistré.",
      precedente: "Page précédente",
      suivante: "Page suivante",
      page: "Page {n}",
      /** @relecture Surya — le filtre des paiements récents (back-office-admin, D-133). */
      filtres: {
        /** @relecture Surya — le nom des filtres pour les lecteurs d'écran (D-164). */
        libelle: "Filtrer les paiements",
        recents: "Payés ces 7 derniers jours",
        tous: "Tous les paiements",
        /** @relecture Surya — le filtre des frais à rembourser (D-164). */
        aRembourser: "À rembourser",
      },
      /** @relecture Surya — aucun paiement récent. */
      videRecents: "Aucun frais payé ces 7 derniers jours.",
      /** @relecture Surya — aucun frais à rembourser (D-164). */
      videARembourser: "Aucun frais à rembourser.",
    },

    /** Les abonnements des familles (abonnements-back-office). */
    abonnements: {
      /** @relecture Surya — titre de la page. */
      titre: "Abonnements des familles",
      /** @relecture Surya — colonnes. */
      colonnes: {
        famille: "Famille",
        formule: "Formule",
        statut: "Statut",
        debut: "Début",
        renouvellement: "Renouvellement",
        grace: "Période de grâce",
        stripe: "Stripe",
      },
      /** @relecture Surya — l'état d'un abonnement, les mots de « Votre abonnement » quand ils existent. */
      etats: {
        en_attente: "Premier paiement en cours",
        active: "Actif",
        resiliee: "Résiliation programmée",
        grace: "Paiement en attente",
        suspendue: "Suspendu",
        terminee: "Terminé",
      },
      /** @relecture Surya — la date dans la colonne du renouvellement, quand l'abonnement ne se renouvelle plus. */
      finLe: "Fin le {date}",
      termineLe: "Terminé le {date}",
      /** @relecture Surya — la fin de la période de grâce. */
      graceJusquau: "Jusqu'au {date}",
      /** @relecture Surya — le lien vers l'abonnement dans Stripe. */
      voirStripe: "Voir dans Stripe",
      /** @relecture Surya — compte supprimé depuis. */
      inconnu: "Compte supprimé",
      /** @relecture Surya — les filtres (D-133). */
      filtres: {
        libelle: "Filtrer les abonnements",
        tous: "Tous les abonnements",
        actifs: "Actifs",
      },
      /** @relecture Surya — listes vides. */
      vide: "Aucun abonnement enregistré.",
      videActifs: "Aucun abonnement actif.",
    },

    /** La navigation de chaque page de l'administration (back-office-admin, D-132). */
    nav: {
      /** @relecture Surya — nom de la navigation pour les lecteurs d'écran. */
      libelle: "Navigation de l'administration",
      vueEnsemble: "Vue d'ensemble",
      /** @relecture Surya — entrées de la navigation. */
      dossiers: "Dossiers",
      utilisateurs: "Utilisateurs",
      demandes: "Demandes",
      reservations: "Réservations",
      signalements: "Signalements",
      paiements: "Paiements",
      /** @relecture Surya — la liste des crédits Berceo (annulations-back-office). */
      creditsBerceo: "Crédits",
      abonnements: "Abonnements",
      avis: "Avis",
      journal: "Journal",
    },

    /** Le tableau de bord (le guide, « Le backoffice »). */
    vueEnsemble: {
      titre: "Vue d'ensemble",
      blocs: {
        dossiers: "Dossiers en attente de validation",
        reservations: "Réservations en cours",
        signalements: "Signalements à traiter",
        paiements: "Paiements récents",
        /** @relecture Surya — le bloc des abonnements (abonnements-back-office). */
        abonnements: "Abonnements actifs",
        /** @relecture Surya — le bloc des crédits Berceo (annulations-back-office). */
        creditsBerceo: "Crédits disponibles",
      },
      /** @relecture Surya — ce que chaque chiffre compte (D-133). */
      precisions: {
        dossiers: "Dossiers envoyés ou en attente d'un complément",
        reservations: "Gardes confirmées à venir ou en cours",
        signalements: "Gardes annulées et absences signalées, pas encore traitées",
        paiements: "Frais de service payés ces 7 derniers jours",
        abonnements: "Abonnements en cours, période de grâce comprise",
        creditsBerceo: "Crédits Berceo ni utilisés, ni annulés, ni expirés",
      },
      /** @relecture Surya — ce que les crédits disponibles peuvent encore régler (annulations-back-office). */
      resteCredits: "{montant} € à utiliser en tout",
      /** @relecture Surya — le lien de chaque bloc. */
      voir: "Voir la liste complète",
      /** @relecture Surya — les frais encore dus, dans le bloc des paiements (D-164). */
      aRembourser: "{n} frais à rembourser",
    },

    /** La page des dossiers : la file et le réglage des étudiantes, déplacés de l'accueil (D-132). */
    dossiers: {
      /** @relecture Surya — titre de la page. */
      titre: "Dossiers",
    },

    /** La gestion des utilisateurs (le guide, « Le backoffice »). */
    utilisateurs: {
      /** @relecture Surya — titre de la page. */
      titre: "Utilisateurs",
      recherche: "Rechercher un utilisateur par nom, e-mail ou téléphone",
      /** @relecture Surya — boutons de la recherche. */
      rechercher: "Rechercher",
      effacer: "Effacer la recherche",
      /** @relecture Surya — ce que la liste montre. */
      recents: "Les comptes les plus récents, du plus récent au plus ancien.",
      resultats: "Comptes trouvés pour « {q} »",
      /** @relecture Surya — colonnes. */
      colonnes: {
        nom: "Nom",
        role: "Rôle",
        email: "E-mail",
        telephone: "Téléphone",
        etat: "État",
        inscription: "Inscription",
      },
      /** @relecture Surya — les rôles ; « Pro » est admis dans le back-office seulement. */
      roles: {
        parent: "Famille",
        professionnel: "Pro",
        admin: "Admin",
      },
      /** @relecture Surya — l'état d'un compte. */
      etats: {
        actif: "Actif",
        suspendu: "Suspendu",
        supprime: "Supprimé",
      },
      voirProfil: "Voir le profil",
      /** @relecture Surya — aucun résultat. */
      vide: "Aucun compte ne correspond à cette recherche.",
    },

    /** La fiche d'un compte (« Voir le profil »). */
    compte: {
      /** @relecture Surya — titres des sections. */
      sections: {
        identite: "Identité",
        activite: "Activité",
        gardes: "Gardes à venir ou en cours",
        actions: "Actions",
        historique: "Historique du compte",
      },
      /** @relecture Surya — libellés. */
      champs: {
        role: "Rôle",
        email: "E-mail",
        telephone: "Téléphone",
        inscription: "Compte créé le",
        etat: "État",
        commune: "Commune",
        dossier: "Dossier",
        profession: "Profession",
        communes: "Communes desservies",
        /** @relecture Surya — le rayon autour de ses communes (profil-zone-rayon-saisie). */
        rayon: "Rayon",
        tarif: "Tarif de nuit",
        note: "Note",
        /** @relecture Surya — la ligne d'abonnement d'une famille (abonnements-back-office). */
        abonnement: "Abonnement",
        etatAbonnement: "État de l'abonnement",
      },
      /** @relecture Surya — une famille qui n'a jamais eu d'abonnement. */
      sansAbonnement: "Aucun abonnement",
      /** @relecture Surya — l'état avec sa date. */
      suspenduLe: "Suspendu depuis le {date}",
      supprimeLe: "Supprimé le {date}",
      /** @relecture Surya — la note et le nombre de gardes. */
      note: "{note} sur 5, {n} gardes",
      sansNote: "Pas encore de note",
      nonRenseigne: "Non renseigné",
      aucune: "Aucune",
      /** @relecture Surya — les compteurs et leurs liens. */
      compteurs: {
        demandes: "Demandes publiées : {n}",
        reponses: "Réponses données : {n}",
        gardes: "Gardes réservées : {n}",
      },
      liens: {
        demandes: "Voir ses demandes",
        gardes: "Voir ses réservations",
        dossier: "Ouvrir son dossier",
      },
      /** @relecture Surya — une garde à venir, l'autre personne et son téléphone. */
      garde: "{date} à {heure}, avec {nom} ({telephone})",
      aucuneGarde: "Aucune garde à venir ou en cours.",
      /** @relecture Surya — pas d'action possible. */
      sansActionAdmin: "Aucune action n'est possible sur un compte administrateur.",
      sansActionSupprime: "Ce compte est supprimé. Aucune action n'est plus possible.",
      /** @relecture Surya — historique vide. */
      aucunHistorique: "Aucune action sur ce compte pour le moment.",
    },

    /** Les actions sur un compte (le guide, « Le backoffice »), et leurs confirmations. */
    actionsCompte: {
      contacter: "Contacter l'utilisateur",
      suspendre: "Suspendre le compte",
      reactiver: "Réactiver le compte",
      supprimer: "Supprimer le compte",
      /** @relecture Surya — chaque confirmation affiche le nom de la personne (le guide). */
      confirmation: {
        suspendreTitre: "Suspendre le compte de {nom} ?",
        suspendre:
          "{nom} ne pourra plus se connecter et n'apparaîtra plus sur Berceo. Ses réponses en attente sont retirées et ses demandes ouvertes annulées.",
        suspendreGardes:
          "Ces gardes ne sont pas annulées. Prévenez vous-même les personnes concernées :",
        reactiverTitre: "Réactiver le compte de {nom} ?",
        reactiver:
          "{nom} pourra de nouveau se connecter. Ce qui a été retiré ou annulé pendant la suspension n'est pas rétabli.",
        supprimerTitre: "Supprimer le compte de {nom} ?",
        supprimer:
          "Cette action est irréversible. Ses coordonnées, son profil et ses documents sont effacés. Ses demandes, gardes, paiements et avis restent enregistrés sous « Compte supprimé ».",
        nom: "Pour confirmer, saisissez son nom de famille : {nom}",
        oui: "Oui, confirmer",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — pourquoi la suppression n'est pas proposée. */
      indisponible: {
        nonSuspendu: "Suspendez d'abord le compte.",
        gardesAVenir: "Des gardes sont à venir.",
      },
      /** @relecture Surya — résultats. */
      resultats: {
        suspendu: "Le compte est suspendu.",
        reactive: "Le compte est réactivé.",
        supprime: "Le compte est supprimé.",
        contacte: "Votre message est envoyé.",
      },
      /** @relecture Surya — erreurs. */
      erreurs: {
        admin: "Un compte administrateur ne peut pas être modifié ici.",
        supprime: "Ce compte est supprimé.",
        dejaSuspendu: "Ce compte est déjà suspendu. Rechargez la page.",
        nonSuspendu: "Ce compte n'est pas suspendu. Rechargez la page.",
        gardesAVenir: "Des gardes sont à venir sur ce compte. Il ne peut pas être supprimé.",
        nomDifferent: "Le nom saisi ne correspond pas.",
        introuvable: "Ce compte n'existe pas.",
        envoi: "Le message n'a pas pu partir. Réessayez dans un instant.",
        generique: "Une erreur est survenue. Réessayez dans un instant.",
      },
      /** @relecture Surya — le message envoyé depuis l'administration (D-138). */
      contact: {
        titre: "Écrire à {nom}",
        description:
          "Le message part de l'adresse de Berceo. Sa réponse arrivera à l'adresse e-mail de votre compte.",
        objet: "Objet",
        message: "Message",
        messageAide: "5 000 caractères au plus. Une ligne vide sépare deux paragraphes.",
        envoyer: "Envoyer le message",
        annuler: "Annuler",
        erreurs: {
          objetRequis: "Indiquez un objet.",
          objetLong: "L'objet dépasse 150 caractères.",
          messageRequis: "Écrivez un message.",
          messageLong: "Le message dépasse 5 000 caractères.",
        },
      },
    },

    /** Toutes les demandes de garde. */
    demandes: {
      /** @relecture Surya — titre de la page. */
      titre: "Demandes",
      /** @relecture Surya — colonnes. */
      colonnes: {
        nuit: "Nuit",
        commune: "Commune",
        famille: "Famille",
        reponses: "Réponses",
        etat: "État",
      },
      /** @relecture Surya — filtres. */
      filtres: {
        toutes: "Toutes",
        ouverte: "Ouvertes",
        passee: "Passées",
        attribuee: "Attribuées",
        annulee: "Annulées",
      },
      /** @relecture Surya — la nuit, l'urgence. */
      nuit: "{date} à {heure}",
      urgente: "Urgente",
      /** @relecture Surya — le filtre sur une famille. */
      deCompte: "Les demandes de {nom}",
      toutesLesDemandes: "Voir toutes les demandes",
      /** @relecture Surya — liste vide. */
      vide: "Aucune demande.",
      /** @relecture Surya — la réponse facultative de la famille, dépliée sous la ligne (demande-motif-facultatif). */
      motif: "Motif de la famille",
    },

    /** Toutes les réservations. */
    reservations: {
      /** @relecture Surya — titre de la page. */
      titre: "Réservations",
      /** @relecture Surya — colonnes. */
      colonnes: {
        nuit: "Nuit",
        famille: "Famille",
        professionnelle: "Professionnelle",
        tarif: "Tarif",
        frais: "Frais",
        etat: "État",
      },
      /** @relecture Surya — filtres ; « En cours » compte les gardes à venir et celles de cette nuit. */
      filtres: {
        toutes: "Toutes",
        "en-cours": "En cours",
        "a-venir": "À venir",
        commencee: "Cette nuit",
        terminee: "Terminées",
        annulee: "Annulées",
      },
      /** @relecture Surya — compte suspendu, frais absents. */
      suspendu: "Suspendu",
      sansFrais: "Aucun",
      /** @relecture Surya — le filtre sur un compte. */
      deCompte: "Les réservations de {nom}",
      toutesLesReservations: "Voir toutes les réservations",
      /** @relecture Surya — liste vide. */
      vide: "Aucune réservation.",
      /** @relecture Surya — la colonne et le bouton de l'annulation par Berceo (annulations-back-office). */
      action: "Action",
      annuler: "Annuler la garde",
      /** @relecture Surya — la confirmation (D-24) : la note reste interne, les deux parties reçoivent un e-mail. */
      annulation: {
        titre: "Annuler la garde du {date} pour Berceo",
        description:
          "La garde entre {famille} et {professionnelle} est annulée. Les frais de service payés deviennent un crédit Berceo de la famille. Les deux parties reçoivent un e-mail, sans votre note. L'action est inscrite au journal et ne peut pas être annulée.",
        motif: "Note",
        motifAide: "500 caractères au plus. La note reste interne à Berceo.",
        oui: "Oui, annuler la garde",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — résultats de l'annulation par Berceo. */
      annulationResultats: {
        ok: "La garde est annulée. Les deux parties sont prévenues.",
        refuse: "Cette garde ne peut plus être annulée. Rechargez la page.",
        generique: "Une erreur est survenue. Réessayez dans un instant.",
      },
    },

    /** @relecture Surya — la note d'une fondatrice, 500 caractères au plus (annulations-back-office). */
    note: {
      motifRequis: "Écrivez une note.",
      motifLong: "La note dépasse 500 caractères.",
    },

    /** Les signalements : gardes annulées et absences signalées (D-139). */
    signalements: {
      /** @relecture Surya — titre de la page. */
      titre: "Signalements",
      /** @relecture Surya — ce que la page montre, le litige (annulations-table), et où rembourser. */
      intro:
        "Chaque garde annulée par une famille, une professionnelle ou Berceo, et chaque absence signalée, la plus récente en premier. Une absence contestée est un litige : aucun crédit n'est accordé d'office, l'équipe Berceo décide. Sur un litige, ou sur des frais conservés par Berceo, vous pouvez accorder un crédit des frais. Les frais ne sont jamais remboursés d'office : le remboursement se fait depuis la page des paiements.",
      /** @relecture Surya — colonnes. */
      colonnes: {
        date: "Signalé le",
        nuit: "Nuit",
        famille: "Famille",
        professionnelle: "Professionnelle",
        signalement: "Signalement",
        motif: "Motif",
        /** @relecture Surya — le délai qui s'est appliqué (annulations-back-office). */
        delai: "Délai",
        frais: "Frais",
        suivi: "Suivi",
      },
      /** @relecture Surya — filtres ; « Litige » montre les litiges traités ou non (annulations-back-office). */
      filtres: {
        "a-traiter": "À traiter",
        litige: "Litige",
        tous: "Tous",
      },
      /** @relecture Surya — ce qui s'est passé. */
      types: {
        annulation: {
          famille: "Annulée par la famille",
          professionnelle: "Annulée par la professionnelle",
          /** @relecture Surya — annulée par une fondatrice (annulations-back-office). */
          berceo: "Annulée par Berceo",
        },
        absence: {
          famille: "Absence de la famille signalée",
          professionnelle: "Absence de la professionnelle signalée",
        },
      },
      /** @relecture Surya — une absence, ou une garde annulée avant les motifs (annulations-delai-et-motif). */
      sansMotif: "Aucun motif",
      /** @relecture Surya — la note interne d'une annulation par Berceo (annulations-back-office). */
      note: "Note : {note}",
      /** @relecture Surya — le délai : les heures avant le début, et la ligne du tableau (annulations-back-office, Q1). */
      heuresAvant: "{n} h avant le début",
      apresDebut: "Après le début",
      verdicts: {
        dansLeDelai: "Dans le délai",
        horsDelai: "Hors délai",
      },
      sansDelai: "Sans objet",
      /** @relecture Surya — ce que sont devenus les frais (annulations-back-office). */
      resultats: {
        litige: "Litige : l'équipe Berceo décide",
        credit: "Devenus un crédit Berceo",
        geste: "Crédit offert par Berceo",
        conserves: "Conservés par Berceo",
        rembourses: "Remboursés",
        aRembourser: "À rembourser",
        aucun: "Aucuns frais",
      },
      /** @relecture Surya — accorder un crédit des frais (annulations-back-office), et sa confirmation (D-24). */
      accorder: "Accorder un crédit",
      accord: {
        titre: "Accorder un crédit à {nom}",
        description:
          "Un crédit Berceo de {montant}, valable 24 mois, est ajouté au compte de la famille. Elle reçoit un e-mail, sans votre note. Sur un litige, le signalement est marqué comme traité. L'action est inscrite au journal et ne peut pas être annulée.",
        motif: "Note",
        motifAide: "500 caractères au plus. La note reste interne à Berceo.",
        oui: "Oui, accorder le crédit",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — résultats du bouton. */
      accordResultats: {
        ok: "Le crédit est accordé. La famille est prévenue.",
        refuse: "Ce crédit ne peut plus être accordé. Rechargez la page.",
        generique: "Une erreur est survenue. Réessayez dans un instant.",
      },
      /** @relecture Surya — l'absence a été contestée : la garde est en litige (annulations-table). */
      litige: "Litige : signalement contesté le {date}",
      /** @relecture Surya — le suivi. */
      marquer: "Marquer comme traité",
      traite: "Traité le {date} par {nom}",
      confirmation: {
        titre: "Marquer ce signalement comme traité ?",
        description:
          "Il quittera la liste des signalements à traiter. L'action est inscrite au journal et ne peut pas être annulée.",
        oui: "Oui, marquer comme traité",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — déjà traité par une autre personne. */
      erreur: "Ce signalement est déjà traité. Rechargez la page.",
      /** @relecture Surya — lien vers les paiements. */
      lienPaiements: "Voir les paiements",
      /** @relecture Surya — listes vides. */
      vide: "Aucun signalement à traiter.",
      videTous: "Aucun signalement.",
      /** @relecture Surya — aucun litige (annulations-back-office). */
      videLitige: "Aucun litige.",
    },

    /** @relecture Surya — la liste des crédits Berceo (annulations-back-office). */
    creditsBerceo: {
      titre: "Crédits",
      intro:
        "Chaque crédit Berceo, le plus récent en premier : né d'une annulation ou d'une absence selon le tableau, ou offert par l'équipe Berceo. Un crédit dure 24 mois et règle les frais de service d'une prochaine réservation.",
      resume: "{n} crédits disponibles, {montant} € à utiliser en tout.",
      colonnes: {
        date: "Émis le",
        famille: "Famille",
        montant: "Montant",
        origine: "Origine",
        garde: "Garde",
        expiration: "Expire le",
        utilise: "Utilisé",
        etat: "État",
      },
      etats: {
        disponible: "Disponible",
        utilise: "Utilisé",
        annule: "Annulé",
        expire: "Expiré",
      },
      origines: {
        annulation_famille: "Garde annulée par la famille",
        annulation_professionnelle: "Garde annulée par la professionnelle",
        absence_professionnelle: "Absence de la professionnelle",
        annulation_berceo: "Garde annulée par Berceo",
        geste_berceo: "Offert par Berceo",
      },
      offertPar: "Par {nom} : {note}",
      sansGarde: "Aucune",
      compteSupprime: "Compte supprimé",
      vide: "Aucun crédit n'existe encore.",
    },

    /** La pagination des listes de l'administration. */
    pages: {
      /** @relecture Surya — pagination. */
      precedente: "Page précédente",
      suivante: "Page suivante",
      position: "Page {n}",
    },
  },
});
