import { catalogue } from "./locale";

/**
 * The care request: the family's form, her list and one request, the
 * professional's list and the request card. Entries without a tag are Surya's
 * guide verbatim ("Les annonces", "Les e-mails"); every `@relecture` entry is
 * ours, written in the guide's rules (vouvoiement, no exclamation mark, no em
 * dash, no ellipsis) and waiting for Surya. No price (D-3, D-4), no insurance
 * wording (D-8), nothing that asks about health beyond the checkbox (D-20).
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
      /** @relecture Surya — ce que couvre une demande urgente (D-50). */
      introUrgente:
        "Une demande urgente concerne une garde ce soir ou demain soir. Les professionnelles de votre zone sont prévenues tout de suite.",
      /** @relecture Surya — première option de la liste des heures. */
      choisirHeure: "Choisissez une heure",
      /** @relecture Surya — titre du formulaire de modification. */
      titreModification: "Modifier votre demande",

      champs: {
        date: "Date de la garde",
        heure: "Heure de début",
        enfants: "Nombre d'enfants",
        age: "Âge du bébé",
        commune: "Votre commune",
        /** @relecture Surya — nom du champ nombre, pour les lecteurs d'écran. */
        ageValeur: "Âge",
        /** @relecture Surya — nom du choix semaines ou mois, pour les lecteurs d'écran. */
        ageUnite: "En semaines ou en mois",
      },

      aides: {
        heure: "La garde de nuit standard est de 11 heures.",
        commune:
          "L'adresse exacte sera communiquée uniquement après confirmation de la réservation.",
        /** @relecture Surya — la fenêtre d'une demande normale (D-50). */
        date: "Une date entre le {min} et le {max}. Pour ce soir ou demain soir, publiez une demande urgente.",
        /** @relecture Surya — la fenêtre d'une demande urgente (D-50). */
        dateUrgente: "Ce soir ou demain soir.",
        /** @relecture Surya — l'âge en semaines puis en mois (D-54). */
        age: "En semaines jusqu'à 12 semaines, puis en mois jusqu'à 24 mois.",
        /** @relecture Surya — la commune vient du profil (D-53). */
        lienProfil: "Modifier ma commune dans mon profil",
        /** @relecture Surya — ce qui ne se modifie pas après la publication. */
        nonModifiable:
          "La commune et l'urgence d'une demande ne se modifient pas. Pour les changer, annulez la demande et publiez-en une nouvelle.",
      },

      enfants: {
        un_bebe: "Un bébé",
        jumeaux: "Jumeaux",
      },

      unites: {
        /** @relecture Surya — unité de l'âge. */
        semaines: "semaines",
        /** @relecture Surya — unité de l'âge. */
        mois: "mois",
      },

      /** La case à cocher obligatoire du guide (D-20). */
      confirmation:
        "Mon enfant n'a pas de condition médicale particulière nécessitant des soins spécialisés.",
    },

    erreurs: {
      /** @relecture Surya — date hors de la fenêtre (D-50). */
      date: "Choisissez une date entre le {min} et le {max}.",
      /** @relecture Surya — heure déjà passée pour une garde ce soir. */
      heurePassee: "Cette heure est déjà passée. Choisissez une heure plus tardive ou demain soir.",
      /** @relecture Surya — heure hors de la liste. */
      heure: "Choisissez une heure dans la liste.",
      /** @relecture Surya — ni bébé ni jumeaux. */
      enfants: "Indiquez s'il s'agit d'un bébé ou de jumeaux.",
      /** @relecture Surya — âge hors des bornes (D-54). */
      age: "Indiquez un âge entre 0 et 12 semaines, ou entre 1 et 24 mois.",
      /** @relecture Surya — case non cochée (D-20). */
      confirmation: "Cochez cette case pour publier votre demande.",
      /** @relecture Surya — une seule demande ouverte par nuit (D-55). */
      doublon: "Vous avez déjà une demande ouverte pour cette nuit.",
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
    },

    statuts: {
      /** @relecture Surya — statut. */
      ouverte: "Ouverte",
      /** @relecture Surya — statut. */
      annulee: "Annulée",
      /** @relecture Surya — la nuit a commencé. */
      passee: "Passée",
    },

    carte: {
      /** @relecture Surya — titre de la carte, d'après l'exemple de la DA. */
      titre: "Garde de nuit à {commune}",
      /** @relecture Surya — la nuit, d'après l'exemple de la DA « 30/09/2026 de 20h00 à 7h00 ». */
      nuit: "{date} de {debut} à {fin}",
      /** @relecture Surya — marque d'une demande urgente. */
      urgente: "Urgente",
      /** @relecture Surya — date de publication. */
      publiee: "Publiée le {date}",
      enfants: {
        /** @relecture Surya — d'après l'exemple de la DA « Un bébé de trois mois ». */
        un_bebe: "Un bébé",
        /** @relecture Surya — jumeaux du même âge. */
        jumeaux: "Jumeaux",
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
      /** @relecture Surya — introduction de la liste. */
      intro:
        "Vos demandes de garde de nuit. Tant qu'une demande est ouverte, vous pouvez la modifier ou l'annuler.",
      /** @relecture Surya — aucune demande encore. */
      vide: "Vous n'avez pas encore publié de demande.",
      /** @relecture Surya — accueil de l'espace famille, au-dessus des deux boutons. */
      accueil: "Publiez une demande pour une nuit à venir, ou une demande urgente pour ce soir ou demain soir.",
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
      /** @relecture Surya — introduction de la liste. */
      intro:
        "Les demandes ouvertes dans les communes où vous intervenez, les demandes urgentes en premier.",
      /** @relecture Surya — aucune demande dans sa zone. */
      vide: "Aucune demande ouverte dans votre zone pour le moment.",
      /** @relecture Surya — profil pas encore validé. */
      nonValide: "Les demandes de votre zone seront visibles dès que votre profil sera validé.",
      lien: "Voir les demandes disponibles",
    },
  },
});
