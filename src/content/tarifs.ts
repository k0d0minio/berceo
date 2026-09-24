import { catalogue } from "./locale";

/**
 * `/tarifs`. The guide's page presented four subscriptions; the scope took
 * them out of V1 (D-3), so this page carries only the numbers the sources
 * give: the night rate each professional sets between 100 € and 300 € (D-4),
 * paid to her directly (D-1), and the 3 % service fee with its refund rule
 * (D-2). No other amount appears.
 *
 * Verbatim from the guide: the first sentence of the fee paragraph. The rest
 * is ours and tagged.
 */
export const tarifs = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre du guide sans « Abonnements » (D-3). */
      title: "Prix d'une garde de nuit bébé en Belgique | Tarifs Berceo",
      /** @relecture Surya — meta du guide réécrite sans les formules d'abonnement (D-3). */
      description:
        "Combien coûte une garde de nuit pour un nourrisson ? Chaque professionnelle fixe son tarif entre 100 € et 300 €, avec 3 % de frais de service, sans abonnement.",
    },

    /** @relecture Surya — H1 et introduction. */
    title: "Tarifs d'une garde de nuit à domicile",
    /** @relecture Surya — idem. */
    intro:
      "Le prix d'une garde de nuit est simple : le tarif de la professionnelle, et des frais de service de 3 %. Rien d'autre.",

    tarif: {
      /** @relecture Surya — section rédigée d'après D-1 et D-4. */
      title: "Le tarif de la professionnelle",
      /** @relecture Surya — idem. */
      paragraphs: [
        "Chaque professionnelle fixe elle-même son tarif de nuit, entre 100 € et 300 €. Vous le voyez sur son profil avant de la choisir.",
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

    compte: {
      /** @relecture Surya — section rédigée d'après D-3. */
      title: "Sans abonnement",
      /** @relecture Surya — idem. */
      text: "La création d'un compte famille est gratuite et vous donne accès aux profils complets des professionnelles. Aucun abonnement n'est nécessaire.",
    },

    /** @relecture Surya — lien vers la FAQ. */
    faq: "Lire les questions fréquentes",
  },
});
