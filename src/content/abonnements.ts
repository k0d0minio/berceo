import { catalogue } from "./locale";

/**
 * The four family subscriptions, in the order and at the prices of the devis
 * of 27 August 2026 (the answers [4.3]), which the founders' feedback round 1
 * asks the site to carry. `/tarifs` reads them, and the sign-up of the epic
 * `abonnements-familles` reads the same words. The prices are what a visitor
 * reads: Stripe holds the amounts charged.
 *
 * @relecture Surya — noms, durées et prix repris du devis.
 */
export const abonnements = catalogue({
  fr: {
    plans: [
      { name: "Découverte", duree: "1 mois", prix: "24,90 €" },
      { name: "Parenthèse", duree: "3 mois", prix: "59,90 €" },
      { name: "Sérénité", duree: "6 mois", prix: "94,90 €" },
      { name: "Premium", duree: "12 mois", prix: "159,90 €" },
    ],
  },
});
