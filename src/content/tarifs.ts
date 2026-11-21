import { catalogue } from "./locale";

/**
 * `/tarifs`. The founders' feedback round 1 brings back the four family
 * subscriptions of the devis (their names and prices in `abonnements.ts`) and
 * sets the professional's night rate from 130 €, with no ceiling (the answers
 * [4.1]). The rate is paid to her directly (D-1), and the 3 % service fee
 * keeps its refund rule (D-2). The founders' feedback round 2 adds the
 * one-night plan at 14,75 € (JAM-304, `uneNuit` in `abonnements.ts`). No
 * other amount appears.
 *
 * Verbatim from the guide: the first sentence of the fee paragraph. The rest
 * is ours and tagged.
 */
export const tarifs = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre réécrit d'après le retour des fondatrices. */
      title: "Tarifs et abonnements d'une garde de nuit bébé | Berceo",
      /** @relecture Surya — meta réécrite d'après le retour des fondatrices. */
      description:
        "Quatre abonnements de 1 à 12 mois, un tarif de nuit fixé par chaque professionnelle à partir de 130 € et 3 % de frais de service à chaque réservation.",
    },

    /** @relecture Surya — H1. */
    title: "Tarifs d'une garde de nuit à domicile",
    /** @relecture Surya — introduction réécrite d'après le retour des fondatrices. */
    intro:
      "Le prix d'une garde de nuit tient en trois éléments : votre abonnement, le tarif de la professionnelle et des frais de service de 3 %.",

    abonnements: {
      /** @relecture Surya — titre de section. */
      title: "Les abonnements",
      /** @relecture Surya — section rédigée d'après le devis [9.4]. */
      paragraphs: [
        "Un abonnement vous donne accès aux profils complets des professionnelles et à leur contact. Vous publiez autant de demandes que nécessaire.",
        "L'abonnement se renouvelle automatiquement à la fin de sa durée.",
        /** @relecture Surya — la formule une nuit (retour des fondatrices, tour 2). */
        "La formule Une nuit est un paiement unique de 14,75 €, sans renouvellement. Elle vous donne le même accès qu'un abonnement, pour une réservation.",
      ],
    },

    tarif: {
      /** @relecture Surya — section rédigée d'après D-1 et le retour des fondatrices. */
      title: "Le tarif de la professionnelle",
      /** @relecture Surya — idem. */
      paragraphs: [
        "Chaque professionnelle fixe elle-même son tarif de nuit, à partir de 130 €, et son tarif par heure supplémentaire. Vous les voyez sur son profil avant de la choisir.",
        "Vous la rémunérez directement, après la garde. Berceo est un intermédiaire : la plateforme ne perçoit pas ce montant.",
      ],
    },

    frais: {
      /** @relecture Surya — titre de section. */
      title: "Les frais de service",
      paragraphs: [
        /**
         * @relecture Surya — texte des fondatrices. Seule phrase du site qui nomme
         * l'assurance : Jamie lève D-8 pour elle le 2026-10-29.
         */
        "Des frais de service de 3 % sont prélevés à la confirmation de chaque réservation. Ils couvrent le bon fonctionnement de la plateforme et l'assurance.",
        /** @relecture Surya — le tableau des fondatrices (annulations-table) : le crédit Berceo et ses 24 mois. Le délai de 24 heures est le réglage des fondatrices en V1. */
        "Si vous annulez plus de 24 heures avant le début de la garde, ou si la professionnelle annule ou ne se présente pas, ces frais deviennent un crédit Berceo, valable 24 mois pour une prochaine réservation. Si vous annulez moins de 24 heures avant le début, ils restent acquis à Berceo.",
      ],
    },

    /** @relecture Surya — lien vers la FAQ. */
    faq: "Lire les questions fréquentes",
  },
});
