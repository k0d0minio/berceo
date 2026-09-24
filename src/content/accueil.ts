import { catalogue } from "./locale";

/**
 * The home page (`/`), written to Surya's guide, "Le site public".
 *
 * Verbatim from the guide: the meta description, the H2 titles "Comment ça
 * marche", "Qui sont les Gardiennes de la nuit ?" and "Pourquoi Berceo ?",
 * the step titles, the reassurance line. Everything else is ours and tagged.
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

    hero: {
      /**
       * @relecture Surya — H1 du guide sans « diplômées », pour rester vrai si les étudiantes sages-femmes sont admises (D-7).
       */
      title:
        "La première plateforme belge de garde de nuit par des professionnelles de santé vérifiées.",
      /**
       * @relecture Surya — message principal du guide sans « diplômées » (D-7).
       */
      message:
        "Des professionnelles de santé veillent sur votre bébé cette nuit pour que vous puissiez enfin dormir.",
      /** The guide's first reassurance argument, word for word. */
      reassurance:
        "Aucun profil n'est visible avant vérification manuelle par l'équipe Berceo.",
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

    gardiennes: {
      title: "Qui sont les Gardiennes de la nuit ?",
      /**
       * @relecture Surya — texte rédigé d'après la valeur « Savoir » ; les étudiantes ne sont pas citées tant que les fondatrices ne les admettent pas (D-7).
       */
      paragraphs: [
        "Des sages-femmes, des infirmières en néonatologie, des puéricultrices. Elles connaissent les nourrissons, leurs besoins, leurs signaux, et les situations qui appellent une attention médicale.",
        "Elles savent soutenir un allaitement difficile, apaiser un bébé qui pleure et réagir si quelque chose ne va pas. Ce ne sont pas des baby-sitters : ce sont des professionnelles de santé, qui ont choisi de veiller sur les premières nuits des familles.",
      ],
    },

    pourquoi: {
      title: "Pourquoi Berceo ?",
      /**
       * @relecture Surya — arguments de la hiérarchie de réassurance du guide, sans l'assurance (D-8), avec l'adresse (D-15) et les avis (D-18).
       */
      reasons: [
        {
          title: "Des profils vérifiés un par un",
          text: "L'équipe Berceo vérifie chaque diplôme à la main. Un profil n'est visible qu'après cette vérification.",
        },
        {
          title: "Des professionnelles de santé",
          text: "Formées à reconnaître ce qui ne va pas, à soutenir un allaitement et à réagir en situation d'urgence.",
        },
        {
          title: "Vous savez qui vient",
          text: "Photo, prénom, profession, zone, expérience et note : chaque profil est transparent.",
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
