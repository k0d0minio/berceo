import { catalogue } from "./locale";

/**
 * The life of a garde (cycle-de-garde-et-annulation): its state on both
 * sides' lists and pages (D-17, D-109), cancelling it (D-105), reporting an
 * absence (D-106), contesting one (annulations-table), the lines of a
 * cancelled garde, the fee line of each side (D-2, the founders' table),
 * republishing (D-107), and the founders' list of absences. Surya's guide has
 * no words for any of it: every entry is ours, written in the guide's rules
 * (vouvoiement, no exclamation mark, no em dash, no ellipsis, no insurance
 * wording, D-8) and waiting for Surya. The only price named is the 3 % (D-2);
 * `{montant}` is the garde's own fee with its €, and `{heures}` the founders'
 * delay. `{name}` slots are filled with `fill()` from ./locale.
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
      /** @relecture Surya — conséquence pour la famille, plus que le délai avant le début : un crédit Berceo (annulations-table). */
      descriptionFamille:
        "{prenom} sera prévenue par e-mail. Vos frais de service de 3 % deviendront un crédit Berceo, valable 24 mois pour une prochaine réservation.",
      /** @relecture Surya — conséquence pour la famille, dans le délai : les frais restent acquis (annulations-table). */
      descriptionFamilleTardive:
        "{prenom} sera prévenue par e-mail. À moins de {heures} heures du début de la garde, les frais de service de 3 % restent acquis à Berceo.",
      /** @relecture Surya — conséquence pour la professionnelle : la famille reçoit un crédit (annulations-table). */
      descriptionProfessionnelle:
        "La famille sera prévenue par e-mail et ses frais de service deviendront un crédit Berceo pour une prochaine réservation.",
      /** @relecture Surya — réponse qui annule (rouge, D-24). */
      oui: "Oui, annuler la garde",
      /** @relecture Surya — réponse qui garde la garde (vert, D-24). */
      non: "Non, maintenir la garde",
      /** @relecture Surya — après l'annulation. */
      faite: "La garde est annulée. L'autre partie a été prévenue par e-mail.",
      /** @relecture Surya — titre de la liste des motifs dans la confirmation (annulations-delai-et-motif). */
      motif: "Motif de l'annulation",
      /** @relecture Surya — aucun motif choisi : la confirmation reste ouverte. */
      motifRequis: "Choisissez un motif pour annuler la garde.",
    },

    /**
     * Les motifs d'une annulation (annulations-delai-et-motif, D-20) : une liste
     * courte par côté, sans texte libre. `CANCELLATION_REASONS` dans
     * `src/lib/gardes/rules.ts` dit quel côté propose lesquels.
     */
    motifs: {
      /** @relecture Surya — famille. */
      plus_besoin: "Nous n'avons plus besoin de la garde",
      /** @relecture Surya — famille. */
      imprevu: "Un imprévu",
      /** @relecture Surya — famille. */
      autre_solution: "Nous avons trouvé une autre solution",
      /** @relecture Surya — professionnelle. */
      malade: "Je suis malade",
      /** @relecture Surya — professionnelle. */
      empechement: "Un empêchement",
      /** @relecture Surya — professionnelle. */
      indisponible: "Je ne peux plus assurer cette garde",
      /** @relecture Surya — les deux côtés. */
      autre: "Autre",
    },

    absence: {
      /** @relecture Surya — bouton, de l'heure de début à 24 heures après la fin de la nuit (D-106). */
      bouton: "Signaler une absence",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Signaler une absence",
      /** @relecture Surya — côté famille : la professionnelle n'est pas venue. */
      descriptionFamille:
        "Vous signalez que {prenom} n'est pas venue pour cette garde. La garde sera enregistrée comme annulée et vos frais de service deviendront un crédit Berceo.",
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

    /** Contester un signalement d'absence (annulations-table, les réponses [9.3]) : la garde passe en litige. */
    contestation: {
      /** @relecture Surya — bouton, pendant 24 heures après le signalement, pour la partie déclarée absente. */
      bouton: "Contester ce signalement",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Contester ce signalement",
      /** @relecture Surya — conséquence : un litige, l'équipe Berceo décide des frais. */
      description:
        "Vous indiquez que ce signalement d'absence est inexact. La garde passera en litige et l'équipe Berceo examinera la situation avant de décider des frais de service.",
      /** @relecture Surya — réponse qui conteste (rouge, D-24). */
      oui: "Oui, contester",
      /** @relecture Surya — réponse qui renonce (vert, D-24). */
      non: "Non, revenir à la garde",
      /** @relecture Surya — après la contestation. */
      faite: "Le signalement est contesté. L'équipe Berceo examinera la situation.",
    },

    /** Les lignes d'une garde annulée : qui, comment, quand. Jamais de nom de famille. */
    annulee: {
      /** @relecture Surya — annulée par la personne qui lit. */
      parVous: "Annulée par vous le {date}.",
      /** @relecture Surya — annulée par l'autre partie. */
      parAutre: "Annulée par {prenom} le {date}.",
      /** @relecture Surya — annulée par l'équipe Berceo (annulations-back-office), sans le motif, qui reste interne. */
      parBerceo: "Annulée par Berceo le {date}.",
      /** @relecture Surya — absence de l'autre partie, signalée par la personne qui lit. */
      absenceAutre: "Absence de {prenom} signalée le {date}.",
      /** @relecture Surya — absence de la personne qui lit, signalée par l'autre partie. */
      absenceVous: "Votre absence a été signalée le {date}.",
      /** @relecture Surya — le motif choisi par la partie qui a annulé. */
      motif: "Motif : « {motif} ».",
      /** @relecture Surya — le signalement a été contesté : la garde est en litige (annulations-table). */
      litige: "Signalement contesté le {date}. La garde est en litige.",
    },

    /** La ligne des frais de service sur la page de la famille (D-2, le tableau des fondatrices). */
    frais: {
      /** @relecture Surya — un crédit Berceo, son montant (« 4,50 € », `paiement.recapitulatif.montant`) et sa date d'expiration. */
      credit: "Vos frais de service de {montant} sont devenus un crédit Berceo, valable jusqu'au {date}.",
      /** @relecture Surya — la famille a annulé dans le délai, ou était absente : les frais restent acquis. */
      conserves: "Les frais de service de 3 % restent acquis à Berceo.",
      /** @relecture Surya — un litige : l'équipe Berceo décide. */
      litige: "L'équipe Berceo examine la situation et décidera des frais de service.",
      /** @relecture Surya — remboursés par l'équipe Berceo. */
      rembourses: "Frais de service remboursés.",
    },

    /** La même ligne sur la page de la professionnelle (annulations-table) : ce que deviennent les frais de la famille. */
    fraisProfessionnelle: {
      /** @relecture Surya — la famille reçoit un crédit Berceo. */
      credit: "Les frais de service de la famille sont devenus un crédit Berceo.",
      /** @relecture Surya — les frais restent acquis à Berceo. */
      conserves: "Les frais de service de la famille restent acquis à Berceo.",
      /** @relecture Surya — un litige : l'équipe Berceo décide. */
      litige: "L'équipe Berceo examine la situation et décidera des frais de service.",
      /** @relecture Surya — remboursés par l'équipe Berceo. */
      rembourses: "Les frais de service de la famille lui ont été remboursés.",
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
      /** @relecture Surya — une demande est déjà ouverte, ou de nouveau réservée, pour cette nuit. */
      dejaOuverte: "Voir ma demande pour cette nuit",
    },

    erreurs: {
      /** @relecture Surya — annulation refusée : l'heure de début est passée, ou la garde a changé. */
      annulation: "Cette garde ne peut plus être annulée.",
      /** @relecture Surya — signalement refusé. */
      absence: "Une absence ne peut plus être signalée pour cette garde.",
      /** @relecture Surya — contestation refusée : plus de 24 heures après le signalement, ou déjà contesté. */
      contestation: "Ce signalement ne peut plus être contesté.",
      /** @relecture Surya — republication refusée. */
      republication: "Cette demande ne peut plus être republiée.",
      /** @relecture Surya — erreur générique. */
      generique: "Une erreur est survenue. Réessayez dans un instant.",
    },
  },
});
