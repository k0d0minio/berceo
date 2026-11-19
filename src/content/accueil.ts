import { catalogue } from "./locale";

/**
 * The home page (`/`), written to Surya's guide, "Le site public".
 *
 * Since JAM-327 the top of the page is the DA's deck (`Direction artistique
 * web.pdf`): the hero of slide 19, its first block, the block of slide 15
 * and the card of slide 20, each with the deck's own words. A text quoted
 * from the deck is Surya's and carries no `@relecture`. The sections the
 * deck does not show keep the guide's words: the meta description, the H2
 * titles "Comment ça marche" and "Pourquoi Berceo ?", the step titles.
 * Everything else is ours and tagged.
 */
export const accueil = catalogue({
  fr: {
    meta: {
      /**
       * @relecture Surya — le titre du guide (45 caractères) est allongé pour atteindre 50 à 60 caractères.
       */
      title: "Garde de nuit nourrisson en Belgique, à domicile | Berceo",
      description:
        "Berceo met en relation les familles avec des sages-femmes et puéricultrices diplômées pour des gardes de nuit à domicile. Profils vérifiés. Réservation simple.",
    },

    /**
     * The hero is the photograph and the white logotype alone (the DA's
     * slide 19; JAM-327). `logo` names the logotype for a screen reader.
     */
    hero: {
      /** @relecture Surya — nom du logotype, lu par les lecteurs d'écran. */
      logo: "Berceo",
    },

    /**
     * The first block, on the stripes: the deck's slide 19, word for word
     * (JAM-327, Jamie's decision 2 and his answer to question 6: the deck's
     * « diplômées » stays, D-7 is set aside for the deck's texts). Its title
     * is the page's H1.
     */
    premier: {
      title: "Dormez. Votre bébé est entre de bonnes mains.",
      text: "Publiez votre demande de garde de nuit. Les professionnelles de santé diplômées disponibles dans votre zone vous répondent. Vous choisissez celle qui veillera sur votre bébé.",
      bouton: "Je cherche une garde de nuit",
      /** @relecture Surya — lien vers la connexion, sous le premier bloc (retour 2, JAM-301 ; JAM-327, question 7). */
      connexion: {
        question: "Famille ou professionnelle, vous avez déjà un compte ?",
        lien: "Se connecter",
      },
    },

    /**
     * « Les Gardiennes de la nuit »: the deck's slide 15, word for word, bar
     * its ellipsis after « puéricultrices », which the guide forbids (D-19).
     */
    gardiennesDeLaNuit: {
      title: "Les Gardiennes de la nuit",
      text: "Elles sont sages-femmes, infirmières en néonatologie, puéricultrices. Toutes les Gardiennes de la nuit sont diplômées et vérifiées avant leur première garde. Elles connaissent les besoins du nourrisson et accompagnent les familles en post-partum avec expertise et bienveillance.",
      bouton: "Découvrir leur profil",
    },

    /** The translucent card on a photograph: the deck's slide 20, word for word. */
    dormir: {
      title: "Dormir pour prendre soin de son bébé",
      text: "Les premières nuits avec un nourrisson sont intenses. Berceo est là pour veiller sur votre bébé pendant que vous vous reposez, grâce à des professionnelles de santé diplômées.",
    },

    etapes: {
      title: "Comment ça marche",
      /** @relecture Surya — descriptions des étapes rédigées d'après le guide. */
      steps: [
        {
          title: "Publiez votre demande",
          text: "Indiquez la date, l'heure de début et votre commune. Votre adresse reste privée.",
        },
        {
          title: "Choisissez votre professionnelle",
          text: "Les professionnelles disponibles dans votre zone vous répondent. Vous consultez leur profil et vous choisissez.",
        },
        {
          title: "Dormez enfin",
          text: "Votre professionnelle veille sur votre bébé pendant onze heures. Vous vous reposez.",
        },
      ],
      /** @relecture Surya — liens internes vers les pages principales. */
      liens: {
        commentCaMarche: "Découvrir comment fonctionne Berceo",
        tarifs: "Consulter les tarifs",
      },
    },

    pourquoi: {
      title: "Pourquoi Berceo ?",
      /**
       * @relecture Surya — arguments de la hiérarchie de réassurance du guide, sans l'assurance (D-8), avec l'adresse (D-15) et les avis (D-18).
       */
      reasons: [
        {
          title: "Des profils vérifiés un par un",
          text: "L'équipe Berceo vérifie chaque dossier à la main. Un profil n'est visible qu'après cette vérification.",
        },
        {
          title: "Des professionnelles de santé",
          text: "Formées à reconnaître ce qui ne va pas, à soutenir un allaitement et à réagir en situation d'urgence.",
        },
        {
          title: "Vous savez qui vient",
          text: "Photo, prénom, profession, zone et note : chaque profil est transparent.",
        },
        {
          title: "Votre adresse reste privée",
          text: "Votre commune suffit pour publier une demande. Votre adresse n'est partagée qu'une fois la réservation confirmée.",
        },
        {
          title: "Des avis dans les deux sens",
          text: "Après chaque garde, la famille et la professionnelle se notent mutuellement avec des étoiles.",
        },
      ],
    },

    professionnelles: {
      /** @relecture Surya — bloc d'appel aux professionnelles, rédigé d'après les messages prioritaires du guide. */
      title: "Vous êtes professionnelle de santé ?",
      /** @relecture Surya — idem. */
      text: "Sage-femme, infirmière en néonatologie ou puéricultrice, proposez des gardes de nuit à domicile, à votre rythme. Vous choisissez vos disponibilités, vos zones et les gardes que vous acceptez. Berceo ne vous emploie pas : la plateforme vous met en relation avec des familles.",
    },
  },
});
