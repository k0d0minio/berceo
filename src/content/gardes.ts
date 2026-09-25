import { catalogue } from "./locale";

/**
 * The life of a garde (cycle-de-garde-et-annulation): its state on both
 * sides' lists and pages (D-17, D-109), cancelling it (D-105), reporting an
 * absence (D-106), the lines of a cancelled garde, the fee line (D-2),
 * republishing (D-107), and the founders' list of absences. Surya's guide has
 * no words for any of it: every entry is ours, written in the guide's rules
 * (vouvoiement, no exclamation mark, no em dash, no ellipsis, no insurance
 * wording, D-8) and waiting for Surya. The only price named is the 3 % (D-2).
 * `{name}` slots are filled with `fill()` from ./locale.
 */
export const gardes = catalogue({
  fr: {
    etats: {
      /** @relecture Surya — la garde confirmée, avant son heure de début. */
      a_venir: "À venir",
      /** @relecture Surya — de l'heure de début à la fin de la nuit. */
      en_cours: "En cours",
      /** @relecture Surya — la nuit est terminée. */
      terminee: "Terminée",
      /** @relecture Surya — annulée, ou une absence signalée. */
      annulee: "Annulée",
    },

    annulation: {
      /** @relecture Surya — bouton, jusqu'à l'heure de début (D-105). */
      bouton: "Annuler la garde",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Annuler cette garde",
      /** @relecture Surya — conséquence pour la famille : les frais restent acquis (D-2). */
      descriptionFamille:
        "{prenom} sera prévenue par e-mail. Les frais de service de 3 % restent acquis à Berceo lorsque la famille annule.",
      /** @relecture Surya — conséquence pour la professionnelle : la famille est remboursée (D-2). */
      descriptionProfessionnelle:
        "La famille sera prévenue par e-mail et ses frais de service lui seront intégralement remboursés.",
      /** @relecture Surya — réponse qui annule (rouge, D-24). */
      oui: "Oui, annuler la garde",
      /** @relecture Surya — réponse qui garde la garde (vert, D-24). */
      non: "Non, maintenir la garde",
      /** @relecture Surya — après l'annulation. */
      faite: "La garde est annulée. L'autre partie a été prévenue par e-mail.",
    },

    absence: {
      /** @relecture Surya — bouton, de l'heure de début à 24 heures après la fin de la nuit (D-106). */
      bouton: "Signaler une absence",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Signaler une absence",
      /** @relecture Surya — côté famille : la professionnelle n'est pas venue. */
      descriptionFamille:
        "Vous signalez que {prenom} n'est pas venue pour cette garde. La garde sera enregistrée comme annulée et l'équipe Berceo examinera la situation.",
      /** @relecture Surya — côté professionnelle : la famille était absente. */
      descriptionProfessionnelle:
        "Vous signalez que la famille était absente pour cette garde. La garde sera enregistrée comme annulée et l'équipe Berceo examinera la situation.",
      /** @relecture Surya — réponse qui signale (rouge, D-24). */
      oui: "Oui, signaler l'absence",
      /** @relecture Surya — réponse qui renonce (vert, D-24). */
      non: "Non, revenir à la garde",
      /** @relecture Surya — après le signalement. */
      faite: "L'absence est signalée. L'équipe Berceo examinera la situation.",
    },

    /** Les lignes d'une garde annulée : qui, comment, quand. Jamais de nom de famille. */
    annulee: {
      /** @relecture Surya — annulée par la personne qui lit. */
      parVous: "Annulée par vous le {date}.",
      /** @relecture Surya — annulée par l'autre partie. */
      parAutre: "Annulée par {prenom} le {date}.",
      /** @relecture Surya — absence de l'autre partie, signalée par la personne qui lit. */
      absenceAutre: "Absence de {prenom} signalée le {date}.",
      /** @relecture Surya — absence de la personne qui lit, signalée par l'autre partie. */
      absenceVous: "Votre absence a été signalée le {date}.",
    },

    /** La ligne des frais de service sur la page de la famille (D-2). */
    frais: {
      /** @relecture Surya — remboursés. */
      rembourses: "Frais de service remboursés.",
      /** @relecture Surya — le remboursement n'est pas encore confirmé. */
      remboursementEnCours: "Remboursement des frais de service en cours.",
      /** @relecture Surya — la famille a annulé, les frais restent acquis. */
      conserves: "Les frais de service de 3 % restent acquis à Berceo.",
    },

    /** @relecture Surya — l'adresse côté professionnelle, une fois la garde annulée ou terminée (D-110). */
    adresseMasquee: "L'adresse n'est affichée que jusqu'à la fin d'une garde confirmée.",

    republication: {
      /** @relecture Surya — bouton (D-107), le même que celui d'une demande. */
      bouton: "Republier ma demande",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Republier cette demande",
      /** @relecture Surya — conséquence : une nouvelle demande pour la même nuit. */
      description:
        "Une nouvelle demande sera publiée pour la même nuit, aux mêmes horaires, et proposée aux professionnelles de votre zone.",
      /**
       * La case obligatoire de la demande, reprise telle quelle (D-20) : la famille la confirme à nouveau.
       * Texte de `demandes.formulaire` ; @relecture Surya pour la mise en contexte.
       */
      confirmation: "En republiant, vous confirmez que votre enfant n'a pas de condition médicale particulière nécessitant des soins spécialisés.",
      /** @relecture Surya — réponse qui republie (vert, D-24). */
      oui: "Oui, republier",
      /** @relecture Surya — réponse qui renonce (rouge, D-24). */
      non: "Non, pas maintenant",
      /** @relecture Surya — une demande est déjà ouverte pour cette nuit (D-65). */
      dejaOuverte: "Voir ma demande ouverte pour cette nuit",
    },

    erreurs: {
      /** @relecture Surya — annulation refusée : l'heure de début est passée, ou la garde a changé. */
      annulation: "Cette garde ne peut plus être annulée.",
      /** @relecture Surya — signalement refusé. */
      absence: "Une absence ne peut plus être signalée pour cette garde.",
      /** @relecture Surya — republication refusée. */
      republication: "Cette demande ne peut plus être republiée.",
      /** @relecture Surya — erreur générique. */
      generique: "Une erreur est survenue. Réessayez dans un instant.",
    },
  },
});
