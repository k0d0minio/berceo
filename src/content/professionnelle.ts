import { catalogue } from "./locale";

/**
 * The professional's onboarding (steps 2 to 4 of D-21) and her file once
 * submitted. Surya's guide, "Les comptes" and "Le profil professionnel", gives
 * the entries without a tag verbatim: the step titles, the field labels, the
 * 500-character rule and the message after submission. An entry tagged
 * `@relecture` is ours, written in the guide's rules (vouvoiement, no
 * exclamation mark, no em dash, no ellipsis, professions in lower case in
 * running text), and waits for Surya. `{name}` slots are filled with `fill()`.
 */
export const professionnelle = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de page de l'inscription en quatre étapes. */
      inscription: "Mon inscription",
      /** @relecture Surya — titre de page du dossier après envoi. */
      dossier: "Mon dossier",
    },

    etapes: {
      titres: {
        compte: "Créez votre compte",
        profil: "Complétez votre profil",
        justificatifs: "Déposez vos justificatifs",
        declarations: "Validez vos déclarations",
      },
      /** @relecture Surya — repère de progression, comme à l'étape 1. */
      position: "Étape {n} sur 4",
      /** @relecture Surya — étape déjà franchie. */
      faite: "Terminée",
      /** @relecture Surya — nom de la barre de progression pour les lecteurs d'écran. */
      progression: "Progression de votre inscription",
    },

    champs: {
      profession: "Ma profession",
      specialisations: "Mes spécialisations",
      zone: "Ma zone d'intervention",
      tarif: "Mon tarif de nuit",
      experience: "Mon expérience",
      bio: "Quelques mots sur moi",
      /** @relecture Surya — le guide ne nomme pas le champ de la photo. */
      photo: "Ma photo",
      /** @relecture Surya — le numéro INAMI, à l'étape 3 (« INAMI si applicable »). */
      inami: "Mon numéro INAMI",
    },

    aides: {
      /** @relecture Surya — les spécialisations sont facultatives. */
      specialisations: "Facultatif. Cochez celles qui vous correspondent.",
      /** @relecture Surya — la recherche de communes (D-11). */
      zone: "Tapez le nom d'une commune ou son code postal, puis choisissez-la dans la liste.",
      /** @relecture Surya — la fourchette de D-4, sans tarif suggéré. */
      tarif: "Un montant entier entre 100 et 300 € pour une nuit.",
      /** Le guide : « Inviter la professionnelle à écrire en première personne ». @relecture Surya — la formulation. */
      bio: "Présentez-vous en quelques phrases, à la première personne.",
      /** @relecture Surya — compteur sous le champ. */
      bioRestant: "{n} caractères restants",
      /** @relecture Surya — formats de la photo. */
      photo: "Une photo de vous, au format JPEG, PNG ou WebP, de 5 Mo au plus.",
      /** @relecture Surya — formats des justificatifs. */
      documents: "PDF, JPEG, PNG ou WebP, 10 Mo au plus par fichier, trois fichiers au plus.",
      /** @relecture Surya — le numéro INAMI n'est pas montré aux familles. */
      inami: "Onze chiffres. Il reste entre vous et l'équipe Berceo.",
      /** @relecture Surya — une commune de la zone, retirable. */
      retirerCommune: "Retirer {commune}",
      /** @relecture Surya — aucune commune ne correspond à la recherche. */
      aucuneCommune: "Aucune commune ne correspond à votre recherche.",
      /** @relecture Surya — nom de la zone de recherche pour les lecteurs d'écran. */
      rechercheCommune: "Rechercher une commune",
    },

    /** Les professions du guide, en tête de choix. @relecture Surya — la mention de l'année des étudiantes (D-7). */
    professions: {
      sage_femme: "Sage-femme",
      infirmiere_neonatologie: "Infirmière en néonatologie",
      puericultrice: "Puéricultrice",
      etudiante_sage_femme: "Étudiante sage-femme (3e ou 4e année)",
    },

    /** @relecture Surya — liste provisoire, à corriger avec les fondatrices. */
    specialisations: {
      allaitement: "Allaitement",
      prematurite: "Prématurité",
      jumeaux: "Jumeaux",
      reanimation_neonatale: "Réanimation néonatale",
      sommeil_nourrisson: "Sommeil du nourrisson",
      soutien_post_partum: "Soutien post-partum",
    },

    /** @relecture Surya — les quatre tranches d'expérience. */
    experiences: {
      moins_d_un_an: "Moins d'un an",
      un_a_trois_ans: "Un à trois ans",
      trois_a_cinq_ans: "Trois à cinq ans",
      plus_de_cinq_ans: "Plus de cinq ans",
    },

    justificatifs: {
      /** @relecture Surya — introduction de l'étape 3. */
      intro:
        "Nous vérifions chaque dossier à la main avant d'activer un profil. Vos justificatifs ne sont visibles que par l'équipe Berceo.",
      /** @relecture Surya — avant le choix d'une profession. */
      sansProfession: "Choisissez d'abord votre profession à l'étape précédente.",
      /** @relecture Surya — libellé de chaque justificatif, selon la profession. */
      documents: {
        sage_femme: "Mon diplôme de sage-femme",
        infirmiere_neonatologie: "Mon diplôme d'infirmière",
        puericultrice: "Mon diplôme ou certificat de puériculture",
        etudiante_sage_femme: "Mon attestation d'inscription pour l'année en cours",
      },
      /** @relecture Surya — boutons des fichiers. */
      ajouter: "Ajouter un fichier",
      remplacer: "Remplacer la photo",
      envoiEnCours: "Envoi en cours",
      voir: "Voir",
      retirer: "Retirer",
    },

    declarations: {
      /** @relecture Surya — introduction de l'étape 4. */
      intro: "Pour envoyer votre dossier, confirmez chacune des déclarations suivantes.",
      /**
       * Les quatre déclarations du cahier des charges, accordées au féminin
       * selon le guide (« autorisée »). Leur texte définitif viendra des
       * fondatrices (version `cdc-2026-08-02`). @relecture Surya
       */
      textes: {
        documents_authentiques:
          "Je certifie que les documents transmis sont authentiques, complets et m'appartiennent.",
        autorisee_a_exercer:
          "Je déclare être légalement autorisée à exercer les activités proposées sur la plateforme.",
        fausse_declaration:
          "Je reconnais que toute fausse déclaration ou tout document falsifié entraînera la suppression immédiate de mon compte, sans remboursement, et pourra être signalé aux autorités compétentes.",
        verifications:
          "J'accepte que la plateforme procède à toute vérification qu'elle juge utile auprès des organismes compétents.",
        /** @relecture Surya — le casier judiciaire, déclaré et non déposé (D-6). */
        casier_judiciaire:
          "Je déclare que mon extrait de casier judiciaire destiné aux activités avec des mineurs est vierge.",
      },
      /** @relecture Surya — bouton d'envoi du dossier. */
      envoyer: "Envoyer mon dossier",
      /** @relecture Surya — titre de la liste des déclarations sur la page du dossier. */
      acceptees: "Mes déclarations",
      /** @relecture Surya — date d'acceptation. */
      accepteeLe: "Acceptée le {date}",
    },

    boutons: {
      /** @relecture Surya — passer à l'étape suivante. */
      continuer: "Continuer",
      /** @relecture Surya — D-21, la progression est gardée entre deux visites. */
      plusTard: "Enregistrer et reprendre plus tard",
      /** @relecture Surya — enregistrer sur la page du dossier. */
      enregistrer: "Enregistrer",
      /** @relecture Surya — revenir à l'étape précédente. */
      retour: "Revenir à l'étape précédente",
      enCours: "Enregistrement en cours",
    },

    messages: {
      /** @relecture Surya — après « Enregistrer et reprendre plus tard ». */
      enregistre: "Vos réponses sont enregistrées. Vous les retrouverez à votre prochaine visite.",
      /** Le message du guide après l'envoi du dossier. */
      envoye:
        "Votre dossier est bien reçu. Nous le vérifierons dans les 24 heures ouvrables. Vous recevrez un e-mail dès que votre profil sera activé.",
      /** @relecture Surya — lien de l'espace vers le dossier. */
      modifierDossier: "Modifier mon dossier",
      /** @relecture Surya — dossier validé (le message de validation lui-même vient du stub 5). */
      valide: "Votre profil est validé.",
      /** @relecture Surya — dossier refusé, en lecture seule. */
      refuse: "Votre dossier ne peut plus être modifié. Pour toute question, contactez l'équipe Berceo.",
    },

    reouverture: {
      /** @relecture Surya — bouton qui déverrouille profession et justificatifs d'un profil validé. */
      bouton: "Modifier ma profession ou mes justificatifs",
      /** @relecture Surya — la confirmation que demande le spec. */
      titre: "Votre profil sera vérifié à nouveau",
      description:
        "Changer de profession ou de justificatifs demande une nouvelle vérification par l'équipe Berceo. Votre profil restera masqué jusqu'à ce qu'elle soit faite, et vous confirmerez à nouveau vos déclarations.",
      confirmer: "Oui, modifier mon dossier",
      annuler: "Non, garder mon profil tel quel",
    },

    erreurs: {
      /** @relecture Surya — messages d'erreur des champs. */
      requis: "Ce champ est obligatoire.",
      profession: "Choisissez une profession dans la liste.",
      etudiantesFermees:
        "Berceo n'accueille pas encore les étudiantes sages-femmes. Choisissez une autre profession.",
      communesMin: "Choisissez au moins une commune.",
      communesMax: "Choisissez cinquante communes au plus.",
      commune: "Choisissez les communes dans la liste proposée.",
      tarif: "Indiquez un montant entier entre 100 et 300 €.",
      experience: "Choisissez une tranche d'expérience.",
      bioLongue: "Votre présentation dépasse 500 caractères.",
      specialisation: "Choisissez vos spécialisations dans la liste.",
      photo: "Ajoutez une photo de vous.",
      inami: "Indiquez votre numéro INAMI, en onze chiffres.",
      document: "Ajoutez ce justificatif.",
      declarations: "Cochez les cinq déclarations pour envoyer votre dossier.",
      /** @relecture Surya — erreurs d'envoi de fichier. */
      type: "Ce format n'est pas accepté.",
      taille: "Ce fichier est trop lourd.",
      nombre: "Vous avez déjà déposé trois fichiers pour ce justificatif.",
      genre: "Ce justificatif ne correspond pas à votre profession.",
      contenu: "Ce fichier ne correspond pas à son format. Vérifiez-le et déposez-le à nouveau.",
      echec: "L'envoi n'a pas abouti. Réessayez dans un instant.",
      dernier: "Déposez d'abord le nouveau fichier, puis retirez l'ancien.",
      verrouille: "Pour changer de profession ou de justificatifs, utilisez le bouton prévu à cet effet.",
      ferme: "Votre dossier ne peut plus être modifié.",
      generique: "Une erreur est survenue. Réessayez dans un instant.",
    },
  },
});
