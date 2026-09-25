import { catalogue } from "./locale";

/**
 * The service fee (frais-de-service): its line in « Récapitulatif de votre
 * garde », the Checkout's one line on Stripe's page, and the messages the
 * family reads when she comes back from it. The two fee sentences are the
 * guide's, as the Tarifs page already carries them (D-2); every `@relecture`
 * entry is ours, written in the guide's rules (vouvoiement, no exclamation
 * mark, no em dash, no ellipsis) and waiting for Surya. The only amount is
 * the fee, 3 % of the professional's rate, the € after the number (D-87).
 * `{name}` slots are filled with `fill()` from ./locale.
 */
export const paiement = catalogue({
  fr: {
    recapitulatif: {
      /** @relecture Surya — la ligne des frais dans le récapitulatif. */
      frais: "Frais de service (3 %)",
      /** Le montant des frais, l'euro après le nombre (« 4,11 € »). */
      montant: "{montant} €",
      /** Guide (page Tarifs) — la première phrase du paragraphe des frais. */
      prelevement: "Des frais de service de 3 % sont prélevés à la confirmation de chaque réservation.",
      /** Page Tarifs — la règle de remboursement (D-2). */
      remboursement:
        "Si la professionnelle annule la garde, ces frais vous sont intégralement remboursés. Si vous annulez, ils ne sont pas remboursés.",
      /** @relecture Surya — où et comment la famille règle les frais. */
      stripe: "Vous réglez les frais de service sur la page sécurisée de Stripe, par Bancontact ou par carte.",
      /** @relecture Surya — réponse qui confirme (vert, D-24) et mène au paiement. */
      confirmer: "Confirmer et régler les frais de service",
    },

    /** La ligne que Stripe affiche sur sa page de paiement. */
    checkout: {
      /** @relecture Surya — l'intitulé de la ligne. */
      produit: "Frais de service Berceo",
      /** @relecture Surya — la nuit concernée. */
      description: "Garde de nuit du {date}",
    },

    /** Au retour de la page de Stripe, sur la page de la demande. */
    retour: {
      /** @relecture Surya — payé, la réservation se termine. */
      enCours: "Votre paiement est reçu, la confirmation de votre garde est en cours.",
      /** @relecture Surya — lien pour recharger la page. */
      actualiser: "Actualiser la page",
      /** @relecture Surya — payé, mais la garde ne peut plus être réservée (D-91). */
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
