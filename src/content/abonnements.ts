import { catalogue } from "./locale";

/**
 * The four family subscriptions, in the order and at the prices of the devis
 * of 27 August 2026 (the answers [4.3]), which the founders' feedback round 1
 * asks the site to carry. `/tarifs` reads them, and the sign-up of the epic
 * `abonnements-familles` reads the same words. The prices are what a visitor
 * reads: Stripe holds the amounts charged. The plans' order is
 * `PLANS` in `src/lib/abonnements/rules.ts`.
 *
 * `espace`, `retour` and `accueil` are the family's page « Votre abonnement »,
 * the notices after Stripe's page and the block on her home
 * (abonnements-catalogue-stripe). `inscription` is the plans' block of the
 * family sign-up, and `accueil.finaliser*` the call on her home when she left
 * the Checkout unpaid (abonnements-inscription-famille). `requis` is the line
 * that takes the place of an action a family without a subscription cannot
 * do (abonnements-acces). `espace.statut`, `espace.alerte`, `espace.gerer*`,
 * `retour.portail` and `accueil.alerte` are the plan's status, the warning
 * after a failed renewal and Stripe's portal
 * (abonnements-espace-echec-paiement). Every `@relecture` entry is ours, written
 * in the guide's rules, and waits for Surya. `{name}` slots are filled with
 * `fill()` from ./locale.
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

    espace: {
      /** @relecture Surya — le titre de la page et de l'onglet. */
      titre: "Votre abonnement",
      /** @relecture Surya — l'introduction, avant le choix. */
      intro: "Choisissez la formule qui vous convient. Votre abonnement se renouvelle automatiquement à la fin de chaque période.",
      /** @relecture Surya — la durée d'une formule (« Pour 3 mois »). */
      duree: "Pour {duree}",
      /** @relecture Surya — le bouton qui ouvre la page de paiement. */
      choisir: "Choisir {plan}",
      /** @relecture Surya — les moyens de paiement, et la domiciliation après Bancontact. */
      paiement:
        "Vous réglez votre abonnement sur la page sécurisée de Stripe, par Bancontact, par carte, Apple Pay ou Google Pay. Si vous payez par Bancontact, les renouvellements sont prélevés par domiciliation SEPA.",
      /** @relecture Surya — les factures. */
      factures: "Stripe vous envoie chaque facture par e-mail.",
      /** @relecture Surya — la formule en cours. */
      formule: "Votre formule : {plan}",
      /** @relecture Surya — la date du prochain renouvellement. */
      renouvellement: "Prochain renouvellement le {date}",
      /** @relecture Surya — le premier paiement est en cours. */
      enAttente: "Votre premier paiement est en cours de traitement.",
      /** @relecture Surya — le prix de la formule en cours (« 59,90 € pour 3 mois »). */
      prix: "{prix} pour {duree}",
      /** @relecture Surya — la fin d'un abonnement résilié. */
      finLe: "Votre abonnement prend fin le {date}",
      /** Le statut de la formule en cours (abonnements-espace-echec-paiement). */
      statut: {
        /** @relecture Surya — l'abonnement se renouvelle. */
        active: "Statut : actif",
        /** @relecture Surya — résilié, il court jusqu'à la fin de la période. */
        resiliee: "Statut : résiliation programmée",
        /** @relecture Surya — le renouvellement a échoué, pendant les 7 jours de grâce. */
        grace: "Statut : paiement en attente",
        /** @relecture Surya — après les 7 jours de grâce. */
        suspendue: "Statut : suspendu",
      },
      /** @relecture Surya — le bouton vers le portail de Stripe. */
      gerer: "Gérer mon abonnement",
      /** @relecture Surya — ce que permet le portail de Stripe. */
      gererAide:
        "Sur la page sécurisée de Stripe, vous changez de moyen de paiement ou de formule, vous résiliez votre abonnement et vous téléchargez vos factures.",
      /** L'avertissement après un renouvellement qui a échoué (abonnements-espace-echec-paiement). */
      alerte: {
        /** @relecture Surya — pendant les 7 jours de grâce. */
        grace:
          "Le renouvellement de votre abonnement n'a pas abouti. Votre abonnement reste actif jusqu'au {date}. Réglez-le d'ici là pour garder l'accès aux profils complets et à la publication de demandes.",
        /** @relecture Surya — après les 7 jours de grâce. */
        suspendue:
          "Le renouvellement de votre abonnement n'a pas abouti. La publication de demandes et l'accès aux profils complets sont suspendus jusqu'au paiement. Vos gardes confirmées sont maintenues.",
        /** @relecture Surya — le bouton vers la page de Stripe de la facture impayée. */
        regler: "Régler maintenant",
      },
    },

    /** Au retour de la page de Stripe, ou après un refus. */
    retour: {
      /** @relecture Surya — payé, l'abonnement est actif. */
      active: "Merci. Votre abonnement est actif.",
      /** @relecture Surya — payé, la confirmation de Stripe n'est pas encore arrivée. */
      enCours: "Votre paiement est reçu, la confirmation de votre abonnement est en cours.",
      /** @relecture Surya — lien pour recharger la page. */
      actualiser: "Actualiser la page",
      /** @relecture Surya — paiement abandonné ou refusé. */
      abandonne: "Le paiement n'a pas abouti. Vous pouvez choisir une formule à nouveau.",
      /** @relecture Surya — un abonnement court déjà. */
      dejaAbonnee: "Vous avez déjà un abonnement en cours.",
      /** @relecture Surya — la page de paiement n'a pas pu s'ouvrir. */
      erreur: "La page de paiement n'a pas pu s'ouvrir. Réessayez dans un instant.",
      /** @relecture Surya — le portail de Stripe n'a pas pu s'ouvrir. */
      portail: "La page de gestion de votre abonnement n'a pas pu s'ouvrir. Réessayez dans un instant.",
    },

    /** Le choix de la formule, en tête de l'inscription famille. */
    inscription: {
      /** @relecture Surya — le titre du choix. */
      legende: "Choisissez votre formule",
      /** @relecture Surya — ce que donne une formule, repris de la page Tarifs. */
      donne:
        "Chaque formule vous donne accès aux profils complets des professionnelles et à leur contact. Vous publiez autant de demandes que nécessaire.",
      /** @relecture Surya — quand le paiement arrive. */
      suite:
        "Vous réglez votre abonnement sur la page sécurisée de Stripe, après la confirmation de votre adresse e-mail. Il se renouvelle automatiquement à la fin de chaque période.",
    },

    /** Le bloc de l'accueil de l'espace famille. */
    accueil: {
      /** @relecture Surya — le titre du bloc. */
      titre: "Votre abonnement",
      /** @relecture Surya — l'invitation à choisir une formule. */
      choisir: "Choisissez la formule d'abonnement qui vous convient.",
      /** @relecture Surya — le bouton vers les formules. */
      voir: "Voir les formules",
      /** @relecture Surya — le lien vers la page de l'abonnement. */
      gerer: "Voir mon abonnement",
      /** @relecture Surya — la formule choisie à l'inscription, pas encore réglée. */
      finaliserTexte: "Vous avez choisi la formule {plan}. Il reste à régler votre abonnement.",
      /** @relecture Surya — le bouton qui rouvre la page de paiement. */
      finaliser: "Finaliser mon abonnement",
      /** @relecture Surya — le lien vers les quatre formules. */
      autreFormule: "Choisir une autre formule",
      /** @relecture Surya — un renouvellement a échoué (abonnements-espace-echec-paiement). */
      alerte: "Le renouvellement de votre abonnement n'a pas abouti.",
    },

    /** La ligne à la place d'une action réservée aux familles abonnées. */
    requis: {
      /** @relecture Surya — l'action est réservée aux familles abonnées. */
      texte: "Cette action est réservée aux familles abonnées.",
      /** @relecture Surya — le lien vers les formules. */
      lien: "Choisir mon abonnement",
    },
  },
});
