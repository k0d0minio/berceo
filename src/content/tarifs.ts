import { catalogue } from "./locale";

/**
 * `/tarifs`. The founders' feedback round 1 brings back the four family
 * subscriptions of the devis (their names and prices in `abonnements.ts`) and
 * sets the professional's night rate from 130 €, with no ceiling (the answers
 * [4.1]). The rate is paid to her directly (D-1), and the 3 % service fee
 * keeps its refund rule (D-2). No other amount appears.
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
        "Quatre abonnements de 1 à 12 mois, un tarif de nuit fixé par chaque professionnelle à partir de 130 € et 3 % de frais de service à chaque réservation.",
    },

    /** @relecture Surya — H1. */
    title: "Tarifs d'une garde de nuit à domicile",
    /** @relecture Surya — introduction réécrite d'après le retour des fondatrices. */
    intro:
      "Le prix d'une garde de nuit tient en trois éléments : votre abonnement, le tarif de la professionnelle et des frais de service de 3 %.",

    abonnements: {
      /** @relecture Surya — titre de section. */
      title: "Les abonnements",
      /** @relecture Surya — section rédigée d'après le devis [9.4]. */
      paragraphs: [
        "Un abonnement vous donne accès aux profils complets des professionnelles et à leur contact. Vous publiez autant de demandes que nécessaire.",
        "L'abonnement se renouvelle automatiquement à la fin de sa durée.",
      ],
    },

    tarif: {
      /** @relecture Surya — section rédigée d'après D-1 et le retour des fondatrices. */
      title: "Le tarif de la professionnelle",
      /** @relecture Surya — idem. */
      paragraphs: [
        "Chaque professionnelle fixe elle-même son tarif de nuit, à partir de 130 €, et son tarif par heure supplémentaire. Vous les voyez sur son profil avant de la choisir.",
        "Vous la rémunérez directement, après la garde. Berceo est un intermédiaire : la plateforme ne perçoit pas ce montant.",
      ],
    },

    frais: {
      /** @relecture Surya — titre de section. */
      title: "Les frais de service",
      paragraphs: [
        /** @relecture Surya — phrase du guide, sans « Ils couvrent l'assurance » (D-8). */
        "Des frais de service de 3 % sont prélevés à la confirmation de chaque réservation. Ils couvrent le bon fonctionnement de la plateforme.",
        /** @relecture Surya — règle de remboursement (D-2). */
        "Si la professionnelle annule la garde, ces frais vous sont intégralement remboursés. Si vous annulez, ils ne sont pas remboursés.",
      ],
    },

    /** @relecture Surya — lien vers la FAQ. */
    faq: "Lire les questions fréquentes",
  },
});
