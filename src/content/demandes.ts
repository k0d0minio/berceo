import { catalogue } from "./locale";

/**
 * The care request: the family's form, her list and one request, the
 * professional's list and the request card. Entries without a tag are Surya's
 * guide verbatim ("Les annonces", "Les e-mails"); every `@relecture` entry is
 * ours, written in the guide's rules (vouvoiement, no exclamation mark, no em
 * dash, no ellipsis) and waiting for Surya. No price (D-3, D-4), no insurance
 * wording (D-8), nothing that asks about health beyond the checkbox (D-20). The
 * one free text, the optional reason, is the founders' and carries their notice
 * against medical data (demande-motif-facultatif).
 * `{name}` slots are filled with `fill()` from ./locale.
 */
export const demandes = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — onglet de la liste de la famille. */
      liste: "Mes demandes",
      /** @relecture Surya — onglet du formulaire. */
      nouvelle: "Publier une demande",
      /** @relecture Surya — onglet d'une demande. */
      detail: "Votre demande",
      /** @relecture Surya — onglet de la liste de la professionnelle. */
      professionnelle: "Demandes dans votre zone",
      /** @relecture Surya — onglet d'une demande, côté professionnelle. */
      demandeProfessionnelle: "Une demande dans votre zone",
    },

    boutons: {
      /** @relecture Surya — bouton vers le formulaire d'une demande normale. */
      publier: "Publier une demande de garde",
      publierUrgente: "Publier une demande urgente",
      /** @relecture Surya — envoi du formulaire d'une demande normale. */
      envoyer: "Publier ma demande",
      /** @relecture Surya — envoi du formulaire modifié. */
      enregistrer: "Enregistrer les modifications",
      /** @relecture Surya — bouton pendant l'envoi. */
      enCours: "Envoi en cours",
      /** @relecture Surya — ouvrir le formulaire de modification. */
      modifier: "Modifier ma demande",
      /** @relecture Surya — lien d'une demande de la liste. */
      voir: "Voir la demande",
      /** @relecture Surya — retour à la liste. */
      retour: "Retour à mes demandes",
    },

    formulaire: {
      titre: "Publier une demande de garde de nuit",
      /** Le libellé du bouton du guide, repris comme titre du formulaire urgent. */
      titreUrgent: "Publier une demande urgente",
      sousTitre:
        "Plus votre demande est précise, plus vite vous trouverez la professionnelle qui vous correspond.",
      /** @relecture Surya — ce que couvre une demande urgente (D-60). */
      introUrgente:
        "Une demande urgente concerne une garde ce soir ou demain soir. Les professionnelles de votre zone sont prévenues tout de suite.",
      /** @relecture Surya — première option de la liste des heures. */
      choisirHeure: "Choisissez une heure",
      /** @relecture Surya — titre du formulaire de modification. */
      titreModification: "Modifier votre demande",

      champs: {
        /** @relecture Surya — le choix des fondatrices, retour 1 (demande-nuits-regulieres). */
        nature: "Type de demande",
        date: "Date de la garde",
        /** @relecture Surya — le calendrier des nuits régulières (demande-nuits-regulieres). */
        nuits: "Dates des gardes",
        heure: "Heure de début",
        /** Le libellé des fondatrices (retour 1, demande-heures-supplementaires). */
        heuresSupplementaires: "Heures supplémentaires",
        enfants: "Nombre d'enfants",
        /** @relecture Surya — le libellé des fondatrices, retour 1 (2026-10-23). */
        age: "Âge du/des enfants",
        /** @relecture Surya — le libellé des fondatrices, retour 1 (2026-10-23). */
        alimentation: "Alimentation du/des enfants",
        commune: "Votre commune",
        /** @relecture Surya — titre du bloc de l'adresse de la nuit (demande-adresse-de-la-nuit). */
        adresse: "Adresse de la garde",
        /** @relecture Surya — nom du champ nombre, pour les lecteurs d'écran. */
        ageValeur: "Âge",
        /** @relecture Surya — nom du choix semaines ou mois, pour les lecteurs d'écran. */
        ageUnite: "En semaines ou en mois",
        /** @relecture Surya — texte des fondatrices (demande-motif-facultatif). */
        motif: "Pourquoi souhaitez-vous être accompagné(e) la nuit ?",
      },

      aides: {
        heuresSupplementaires: "La garde de nuit standard est de 11 heures.",
        commune:
          "L'adresse exacte sera communiquée uniquement après confirmation de la réservation.",
        /** @relecture Surya — la fenêtre d'une demande normale (D-60). */
        date: "Une date entre le {min} et le {max}. Pour ce soir ou demain soir, publiez une demande urgente.",
        /** @relecture Surya — la fenêtre d'une demande urgente (D-60). */
        dateUrgente: "Ce soir ou demain soir.",
        /** @relecture Surya — les nuits régulières : la fenêtre, le maximum, une seule demande (JAM-302). */
        nuits:
          "Cochez chaque nuit souhaitée, entre le {min} et le {max}, {n} nuits au maximum. Votre demande est publiée une seule fois avec toutes ses nuits, et une seule professionnelle répond pour toutes les nuits.",
        /** @relecture Surya — l'âge en semaines puis en mois (D-64). */
        age: "En semaines jusqu'à 12 semaines, puis en mois jusqu'à 24 mois.",
        /** @relecture Surya — l'adresse reprise du profil, modifiable pour cette demande (demande-adresse-de-la-nuit). */
        adresse:
          "Nous reprenons l'adresse de votre profil. Si la garde a lieu ailleurs, indiquez ici l'adresse de cette nuit. Votre profil ne change pas.",
        /** @relecture Surya — l'adresse d'une demande publiée, modifiable tant qu'elle est ouverte. */
        adresseModification:
          "Vous pouvez changer la rue, le numéro et la boîte tant que votre demande est ouverte.",
        /** @relecture Surya — ce qui ne se modifie pas après la publication. */
        nonModifiable:
          "La commune et l'urgence d'une demande ne se modifient pas. Pour les changer, annulez la demande et publiez-en une nouvelle.",
        /** @relecture Surya — texte des fondatrices (demande-motif-facultatif). */
        motif:
          "Vous pouvez nous expliquer en quelques mots ce qui vous amène à faire appel à une garde de nuit : besoin de repos, besoin de relais, nuits particulièrement difficiles, reprise du travail, arrivée de plusieurs bébés, etc.",
        /** @relecture Surya — texte des fondatrices (demande-motif-facultatif). */
        motifAvertissement:
          "Cette question est facultative. Merci de ne pas communiquer d'informations médicales ou de données sensibles.",
        /** @relecture Surya — compteur de caractères, comme celui du profil. */
        compteur: "{n} caractères sur 300",
      },

      /** Les deux choix des fondatrices, retour 1 (demande-nuits-regulieres). */
      natures: {
        /** @relecture Surya — la majuscule et le singulier d'un choix du formulaire. */
        ponctuelle: "Nuit ponctuelle",
        /** @relecture Surya — la majuscule d'un choix du formulaire. */
        reguliere: "Nuits régulières",
      },

      enfants: {
        un_bebe: "Un bébé",
        jumeaux: "Jumeaux",
        /** @relecture Surya — le choix des fondatrices, retour 1 (2026-10-23). */
        triples: "Triplés",
      },

      /** Les trois réponses des fondatrices, retour 1 (2026-10-23), dans leur ordre. */
      alimentation: {
        /** @relecture Surya — la majuscule d'un choix du formulaire. */
        allaitement_maternel: "Allaitement maternel",
        /** @relecture Surya — la majuscule d'un choix du formulaire. */
        lait_infantile: "Lait infantile",
        /** @relecture Surya — la majuscule d'un choix du formulaire. */
        allaitement_mixte: "Allaitement mixte",
      },

      unites: {
        /** @relecture Surya — unité de l'âge. */
        semaines: "semaines",
        /** @relecture Surya — unité de l'âge. */
        mois: "mois",
      },

      calendrier: {
        /** @relecture Surya — bouton du calendrier de la date, pour les lecteurs d'écran. */
        precedent: "Mois précédent",
        /** @relecture Surya — bouton du calendrier de la date, pour les lecteurs d'écran. */
        suivant: "Mois suivant",
        /** @relecture Surya — compte des nuits régulières cochées, une seule. */
        uneNuitChoisie: "1 nuit choisie",
        /** @relecture Surya — compte des nuits régulières cochées. */
        nuitsChoisies: "{n} nuits choisies",
      },

      /** La case à cocher obligatoire du guide (D-20). */
      confirmation:
        "Mon enfant n'a pas de condition médicale particulière nécessitant des soins spécialisés.",
    },

    erreurs: {
      /** @relecture Surya — date hors de la fenêtre (D-60). */
      date: "Choisissez une date entre le {min} et le {max}.",
      /** @relecture Surya — une nuit régulière hors de la fenêtre. */
      nuits: "Choisissez des nuits entre le {min} et le {max}.",
      /** @relecture Surya — trop de nuits régulières. */
      nuitsTrop: "Choisissez 31 nuits au maximum.",
      /** @relecture Surya — des nuits régulières déjà demandées (D-65, D-156). */
      doublonNuits: "Vous avez déjà une demande pour ces nuits : {dates}. Retirez-les de votre choix.",
      /** @relecture Surya — heure déjà passée pour une garde ce soir. */
      heurePassee: "Cette heure est déjà passée. Choisissez une heure plus tardive ou demain soir.",
      /** @relecture Surya — heure hors de la liste. */
      heure: "Choisissez une heure dans la liste.",
      /** @relecture Surya — heures supplémentaires hors des bornes ou non entières. */
      heuresSupplementaires: "Indiquez un nombre d'heures entier entre 0 et 6.",
      /** @relecture Surya — ni bébé, ni jumeaux, ni triplés. */
      enfants: "Indiquez s'il s'agit d'un bébé, de jumeaux ou de triplés.",
      /** @relecture Surya — âge hors des bornes (D-64). */
      age: "Indiquez un âge entre 0 et 12 semaines, ou entre 1 et 24 mois.",
      /** @relecture Surya — alimentation absente, nomme les trois réponses. */
      alimentation:
        "Indiquez s'il s'agit d'allaitement maternel, de lait infantile ou d'allaitement mixte.",
      /** @relecture Surya — motif trop long, comme le texte du profil. */
      motifLong: "Ce texte ne peut pas dépasser 300 caractères.",
      /** @relecture Surya — case non cochée (D-20). */
      confirmation: "Cochez cette case pour publier votre demande.",
      /** @relecture Surya — une seule demande ouverte ou réservée par nuit (D-65, D-156, D-157). */
      doublon: "Vous avez déjà une demande pour cette nuit.",
      /** @relecture Surya — demande annulée ou nuit commencée entre-temps. */
      nonModifiable: "Cette demande ne peut plus être modifiée.",
    },

    confirmations: {
      /** @relecture Surya — après la publication d'une demande normale. */
      publiee:
        "Votre demande est publiée. Les professionnelles de votre zone peuvent la consulter dès maintenant.",
      publieeUrgente:
        "Votre demande urgente a bien été publiée. Les professionnelles disponibles dans votre zone seront notifiées immédiatement. Nous ne pouvons garantir qu'une professionnelle sera disponible dans ce délai, mais nous faisons tout pour vous aider.",
      /** @relecture Surya — après une modification. */
      modifiee: "Vos modifications sont enregistrées.",
      /** @relecture Surya — après une annulation. */
      annulee: "Votre demande est annulée.",
      /** @relecture Surya — après la publication de nuits régulières, une seule demande (JAM-302). */
      publiees:
        "Votre demande de {n} nuits est publiée. Les professionnelles de votre zone peuvent la consulter dès maintenant.",
      /** @relecture Surya — après l'annulation des nuits ouvertes d'une série. */
      annulees: "Les nuits encore ouvertes de votre demande sont annulées.",
    },

    statuts: {
      /** @relecture Surya — statut. */
      ouverte: "Ouverte",
      /** @relecture Surya — statut. */
      annulee: "Annulée",
      /** @relecture Surya — la nuit a commencé. */
      passee: "Passée",
      /** @relecture Surya — une réponse a été acceptée (candidature-et-reservation). */
      attribuee: "Attribuée",
    },

    carte: {
      /** @relecture Surya — titre de la carte, d'après l'exemple de la DA. */
      titre: "Garde de nuit à {commune}",
      /** @relecture Surya — la nuit, d'après l'exemple de la DA « 30/09/2026 de 20h00 à 7h00 ». */
      nuit: "{date} de {debut} à {fin}",
      /** @relecture Surya — les heures de nuits régulières, dites une fois pour toutes. */
      horaire: "de {debut} à {fin}",
      /** @relecture Surya — marque d'une demande urgente. */
      urgente: "Urgente",
      /** @relecture Surya — date de publication. */
      publiee: "Publiée le {date}",
      enfants: {
        /** @relecture Surya — d'après l'exemple de la DA « Un bébé de trois mois ». */
        un_bebe: "Un bébé",
        /** @relecture Surya — jumeaux du même âge. */
        jumeaux: "Jumeaux",
        /** @relecture Surya — triplés du même âge. */
        triples: "Triplés",
      },
      /** La ligne de l'alimentation sur la carte. */
      alimentation: {
        /** @relecture Surya — une des trois réponses des fondatrices. */
        allaitement_maternel: "Allaitement maternel",
        /** @relecture Surya — une des trois réponses des fondatrices. */
        lait_infantile: "Lait infantile",
        /** @relecture Surya — une des trois réponses des fondatrices. */
        allaitement_mixte: "Allaitement mixte",
      },
      /** @relecture Surya — « Un bébé de trois mois ». */
      enfantsAge: "{enfants} de {age}",
      /** @relecture Surya — l'élision devant un et une : « Un bébé d'un mois ». */
      enfantsAgeElide: "{enfants} d'{age}",
      age: {
        /** @relecture Surya — âge de 0 semaine. */
        nouveauNe: "moins d'une semaine",
        /** @relecture Surya — une semaine. */
        uneSemaine: "une semaine",
        /** @relecture Surya — {n} en lettres. */
        semaines: "{n} semaines",
        /** @relecture Surya — un mois. */
        unMois: "un mois",
        /** @relecture Surya — {n} en lettres. */
        mois: "{n} mois",
      },
      /** Les nombres de 0 à 24 en lettres, pour l'âge écrit comme dans l'exemple de la DA. */
      nombres: [
        "zéro",
        "un",
        "deux",
        "trois",
        "quatre",
        "cinq",
        "six",
        "sept",
        "huit",
        "neuf",
        "dix",
        "onze",
        "douze",
        "treize",
        "quatorze",
        "quinze",
        "seize",
        "dix-sept",
        "dix-huit",
        "dix-neuf",
        "vingt",
        "vingt et un",
        "vingt-deux",
        "vingt-trois",
        "vingt-quatre",
      ],
    },

    famille: {
      /** @relecture Surya — titre de la liste. */
      titre: "Mes demandes",
      /** @relecture Surya — introduction de la liste (D-76 : plus de modification après une réponse). */
      intro:
        "Vos demandes de garde de nuit. Tant qu'une demande est ouverte, vous pouvez l'annuler, et la modifier tant qu'aucune professionnelle n'y a répondu.",
      /** @relecture Surya — aucune demande encore. */
      vide: "Vous n'avez pas encore publié de demande.",
      /** @relecture Surya — accueil de l'espace famille, au-dessus des deux boutons. */
      accueil: "Publiez une demande pour une nuit à venir, ou une demande urgente pour ce soir ou demain soir.",
    },

    /** Les nuits régulières dans « Mes demandes » (demande-nuits-regulieres). */
    serie: {
      /** @relecture Surya — marque de la carte. */
      marque: "Nuits régulières",
      /** @relecture Surya — nombre de nuits de la série. */
      nombre: "{n} nuits",
      /** @relecture Surya — une seule nuit dans la série. */
      uneNuit: "1 nuit",
      /** @relecture Surya — titre de la liste des nuits, pour les lecteurs d'écran. */
      nuits: "Les nuits de cette demande",
      /** @relecture Surya — lien vers une nuit. */
      voir: "Voir la nuit",
    },

    annulationSerie: {
      /** @relecture Surya — bouton qui ouvre la confirmation. */
      bouton: "Annuler toutes les nuits",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Annuler toutes les nuits de cette demande",
      /** @relecture Surya — conséquence : les nuits ouvertes seulement, une garde confirmée reste. */
      description:
        "Les nuits encore ouvertes sont annulées et les professionnelles ne les verront plus. Une garde déjà confirmée ne change pas : vous pouvez l'annuler depuis sa réservation.",
      /** @relecture Surya — réponse qui annule (rouge, D-24). */
      oui: "Oui, annuler toutes les nuits",
      /** @relecture Surya — réponse qui garde la demande (vert, D-24). */
      non: "Non, les garder",
    },

    annulation: {
      /** @relecture Surya — bouton qui ouvre la confirmation. */
      bouton: "Annuler ma demande",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Annuler cette demande",
      /** @relecture Surya — conséquence de l'annulation. */
      description:
        "Les professionnelles ne la verront plus. Vous pourrez publier une nouvelle demande à tout moment.",
      /** @relecture Surya — réponse qui annule (rouge, D-24). */
      oui: "Oui, annuler ma demande",
      /** @relecture Surya — réponse qui garde la demande (vert, D-24). */
      non: "Non, la garder",
    },

    professionnelle: {
      /** @relecture Surya — titre de la liste de la professionnelle. */
      titre: "Demandes dans votre zone",
      /** @relecture Surya — introduction de la liste (D-71 : les demandes prioritaires d'abord). */
      intro:
        "Les demandes ouvertes dans les communes où vous intervenez. Celles qui vous sont envoyées en priorité, puis les demandes urgentes, apparaissent en premier.",
      /** @relecture Surya — aucune demande dans sa zone. */
      vide: "Aucune demande ouverte dans votre zone pour le moment.",
      /** @relecture Surya — profil pas encore validé. */
      nonValide: "Les demandes de votre zone seront visibles dès que votre profil sera validé.",
      lien: "Voir les demandes disponibles",
      /** @relecture Surya — retour de la page d'une demande à la liste. */
      retour: "Retour aux demandes",
      /** @relecture Surya — titre de la réponse facultative de la famille sur la page de la demande. */
      motif: "Le mot de la famille",
    },
  },
});
