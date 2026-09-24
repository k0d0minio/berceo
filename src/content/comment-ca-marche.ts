import { catalogue } from "./locale";

/**
 * `/comment-ca-marche`, written to Surya's guide, "Page Comment ça marche":
 * three steps per journey, one title and one or two sentences each, then the
 * "Ce que garantit Berceo" block.
 *
 * Verbatim from the guide: the family's three step titles, the professional's
 * first and third, and the block's title. Everything else is ours and tagged.
 */
export const commentCaMarche = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — le titre du guide dépasse 60 caractères ; réécrit autour du mot-clé principal de la page. */
      title: "Comment trouver une garde de nuit bébé en Belgique | Berceo",
      /** @relecture Surya — meta du guide réécrite sans « assurées » (D-8). */
      description:
        "Publiez votre demande, choisissez une professionnelle de santé vérifiée, réservez en ligne. Berceo vous met en relation pour une garde de nuit à domicile.",
    },

    /** @relecture Surya — H1 et introduction. */
    title: "Comment trouver une garde de nuit pour votre bébé",
    /** @relecture Surya — idem. */
    intro:
      "Berceo met en relation les familles et les professionnelles de santé pour des gardes de nuit à domicile. Trois étapes de chaque côté, et rien de plus.",

    familles: {
      /** @relecture Surya — titre de section. */
      title: "Pour les familles",
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
      /** @relecture Surya — titre de section. */
      title: "Pour les professionnelles",
      /**
       * @relecture Surya — descriptions des étapes ; « Faites vérifier votre dossier » remplace « Validez votre diplôme » pour rester vrai si les étudiantes sont admises (D-7).
       */
      steps: [
        {
          title: "Créez votre profil",
          text: "Présentez votre profession, votre expérience, votre zone et votre tarif de nuit.",
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
          text: "Photo, prénom, profession, zone, expérience et note : vous savez qui vient chez vous.",
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
