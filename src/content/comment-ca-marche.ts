import { catalogue } from "./locale";

/**
 * `/comment-ca-marche`, written to Surya's guide, "Page Comment ça marche":
 * one page per side since feedback round 1, three steps each, one title and
 * one or two sentences per step, then the "Ce que garantit Berceo" block.
 * The family's page sits at `/comment-ca-marche`, the professional's at
 * `/comment-ca-marche/professionnelles`, and a switch links the two.
 *
 * Verbatim from the guide: the family's three step titles, the professional's
 * first and third, and the block's title. From the founders: the family's
 * introduction and the switch's labels. Everything else is ours and tagged.
 */
export const commentCaMarche = catalogue({
  fr: {
    /** The two sides, named as the founders wrote them (feedback round 1). */
    switch: {
      /** @relecture Surya — libellé d'accessibilité du sélecteur. */
      label: "Votre profil",
      parents: "Je suis parent",
      /** @relecture Surya — écriture inclusive du guide. */
      professionnelles: "Je suis professionnel/le",
    },

    familles: {
      meta: {
        /** @relecture Surya — le titre du guide dépasse 60 caractères ; réécrit autour du mot-clé principal de la page. */
        title: "Comment trouver une garde de nuit bébé en Belgique | Berceo",
        /** @relecture Surya — meta du guide réécrite sans « assurées » (D-8). */
        description:
          "Publiez votre demande, choisissez une professionnelle de santé vérifiée, réservez en ligne. Berceo vous met en relation pour une garde de nuit à domicile.",
      },
      /** @relecture Surya — H1. */
      title: "Comment trouver une garde de nuit pour votre bébé",
      /**
       * The founders' sentence (feedback round 1), word for word. The
       * parenthesis keeps « diplômées » true when students are admitted (D-7).
       * @relecture Surya — écriture inclusive du guide.
       */
      intro:
        "La première plateforme belge à mettre en relation des familles avec des professionnel/les de santé diplômées (et en fin de formation), pour des nuits de repos à domicile, avec autant de compétence que de douceur.",
      /** @relecture Surya — titre de section. */
      stepsTitle: "Pour les familles",
      /** @relecture Surya — descriptions des étapes. */
      steps: [
        {
          title: "Publiez votre demande",
          text: "Indiquez la date, l'heure de début, l'âge de votre bébé et votre commune. Votre adresse reste privée.",
        },
        {
          title: "Choisissez votre professionnelle",
          text: "Les professionnelles disponibles dans votre commune vous répondent. Vous comparez leurs profils et vous choisissez.",
        },
        {
          title: "Dormez enfin",
          text: "Votre professionnelle arrive chez vous pour une nuit de onze heures. Votre bébé est entre de bonnes mains, vous vous reposez.",
        },
      ],
    },

    professionnelles: {
      meta: {
        /** @relecture Surya — titre de la page des professionnelles. */
        title: "Proposer des gardes de nuit à domicile en Belgique | Berceo",
        /** @relecture Surya — meta de la page des professionnelles. */
        description:
          "Créez votre profil, faites vérifier votre dossier et choisissez vos gardes. Berceo vous transmet les demandes de garde de nuit des familles de vos communes.",
      },
      /** @relecture Surya — H1. */
      title: "Comment proposer vos gardes de nuit avec Berceo",
      /** @relecture Surya — introduction. */
      intro:
        "Recevez les demandes de garde de nuit des familles de vos communes et choisissez les nuits qui vous conviennent.",
      /** @relecture Surya — titre de section. */
      stepsTitle: "Pour les professionnelles",
      /**
       * @relecture Surya — descriptions des étapes ; « Faites vérifier votre dossier » remplace « Validez votre diplôme » pour rester vrai si les étudiantes sont admises (D-7).
       */
      steps: [
        {
          title: "Créez votre profil",
          text: "Présentez votre profession, votre zone et votre tarif de nuit.",
        },
        {
          title: "Faites vérifier votre dossier",
          text: "Déposez vos justificatifs et validez vos déclarations sur l'honneur. L'équipe Berceo vérifie votre dossier dans les 24 heures ouvrables.",
        },
        {
          title: "Choisissez vos gardes",
          text: "Vous recevez les demandes des familles de vos communes et vous répondez à celles qui vous conviennent.",
        },
      ],
    },

    garanties: {
      title: "Ce que garantit Berceo",
      /**
       * @relecture Surya — éléments de réassurance du guide, sans l'assurance (D-8), avec l'adresse (D-15) et le paiement direct (D-1).
       */
      items: [
        {
          title: "Une vérification manuelle",
          text: "Aucun profil n'est visible avant vérification manuelle par l'équipe Berceo.",
        },
        {
          title: "Des professionnelles de santé",
          text: "Des sages-femmes, des infirmières en néonatologie et des puéricultrices, pas des baby-sitters.",
        },
        {
          title: "Des profils transparents",
          text: "Photo, prénom, profession, zone et note : vous savez qui vient chez vous.",
        },
        {
          title: "Une adresse protégée",
          text: "Votre adresse n'est partagée avec la professionnelle qu'une fois la réservation confirmée.",
        },
        {
          title: "Une professionnelle indépendante",
          text: "Elle fixe son tarif de nuit et vous la rémunérez directement. Berceo vous met en relation.",
        },
      ],
    },
  },
});
