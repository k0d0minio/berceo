import { catalogue } from "./locale";

/**
 * The service fee (frais-de-service): its line in « Récapitulatif de votre
 * garde », the Checkout's one line on Stripe's page, and the messages the
 * family reads when she comes back from it. The two fee sentences are the
 * guide's, as the Tarifs page already carries them (D-2); every `@relecture`
 * entry is ours, written in the guide's rules (vouvoiement, no exclamation
 * mark, no em dash, no ellipsis) and waiting for Surya. The only amount is
 * the fee, 3 % of the professional's rate, the € after the number (D-99).
 * `{name}` slots are filled with `fill()` from ./locale.
 */
export const paiement = catalogue({
  fr: {
    recapitulatif: {
      /** @relecture Surya — la ligne des frais dans le récapitulatif. */
      frais: "Frais de service (3 %)",
      /** Le montant des frais, l'euro après le nombre (« 4,11 € »). */
      montant: "{montant} €",
      /** Guide (page Tarifs) — la première phrase du paragraphe des frais. */
      prelevement: "Des frais de service de 3 % sont prélevés à la confirmation de chaque réservation.",
      /** Page Tarifs — le tableau des fondatrices (annulations-table), mot pour mot. */
      remboursement:
        "Si vous annulez plus de 24 heures avant le début de la garde, ou si la professionnelle annule ou ne se présente pas, ces frais deviennent un crédit Berceo, valable 24 mois pour une prochaine réservation. Si vous annulez moins de 24 heures avant le début, ils restent acquis à Berceo.",
      /** @relecture Surya — où et comment la famille règle les frais. */
      stripe: "Vous réglez les frais de service sur la page sécurisée de Stripe, par Bancontact ou par carte.",
      /** @relecture Surya — réponse qui confirme (vert, D-24) et mène au paiement. */
      confirmer: "Confirmer et régler les frais de service",
      /** @relecture Surya — la part des frais que paie le crédit Berceo (credits-au-paiement). */
      credit: "Réglés avec votre crédit Berceo",
      /** @relecture Surya — ce que Stripe demande après le crédit (credits-au-paiement). */
      reste: "Reste à régler",
      /** @relecture Surya — le crédit paie tout : pas de page Stripe (credits-au-paiement). */
      creditTotal: "Votre crédit Berceo règle la totalité des frais de service. Aucun paiement ne vous est demandé.",
      /** @relecture Surya — le crédit paie une part, Stripe le reste (credits-au-paiement). */
      stripeReste: "Vous réglez le reste sur la page sécurisée de Stripe, par Bancontact ou par carte.",
      /** @relecture Surya — réponse qui confirme (vert, D-24) quand le crédit paie tout. */
      confirmerCredit: "Confirmer et régler avec mon crédit Berceo",
    },

    /** La ligne que Stripe affiche sur sa page de paiement. */
    checkout: {
      /** @relecture Surya — l'intitulé de la ligne. */
      produit: "Frais de service Berceo",
      /** @relecture Surya — la nuit concernée. */
      description: "Garde de nuit du {date}",
      /** @relecture Surya — la nuit concernée et le crédit déjà déduit (credits-au-paiement). */
      descriptionCredit: "Garde de nuit du {date}, crédit Berceo de {montant} déduit",
      /** @relecture Surya — les nuits d'une demande régulière, un seul paiement (JAM-302). */
      descriptionSerie: "Gardes de nuit du {dates}",
      /** @relecture Surya — les nuits d'une demande régulière et le crédit déjà déduit (JAM-302). */
      descriptionSerieCredit: "Gardes de nuit du {dates}, crédit Berceo de {montant} déduit",
    },

    /** Au retour de la page de Stripe, sur la page de la demande. */
    retour: {
      /** @relecture Surya — payé, la réservation se termine. */
      enCours: "Votre paiement est reçu, la confirmation de votre garde est en cours.",
      /** @relecture Surya — lien pour recharger la page. */
      actualiser: "Actualiser la page",
      /** @relecture Surya — payé, mais la garde ne peut plus être réservée (D-103). */
      rembourse:
        "Votre garde n'a pas pu être confirmée : la demande ou la réponse a changé pendant le paiement. Les frais de service vous sont intégralement remboursés.",
      /** @relecture Surya — payé, pas réservable, et Stripe a refusé le remboursement : l'équipe s'en occupe. */
      remboursementEnAttente:
        "Votre garde n'a pas pu être confirmée : la demande ou la réponse a changé pendant le paiement. Le remboursement des frais de service n'a pas encore abouti, l'équipe Berceo s'en occupe.",
      /** @relecture Surya — paiement abandonné ou refusé. */
      abandonne: "Le paiement n'a pas abouti. Votre demande reste ouverte.",
      /** @relecture Surya — la page de paiement n'a pas pu s'ouvrir. */
      erreur: "La page de paiement n'a pas pu s'ouvrir. Réessayez dans un instant.",
    },
  },
});
