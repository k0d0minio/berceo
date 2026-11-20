import { catalogue } from "./locale";

/**
 * `/consultation-sommeil` — the sleep consultation with the two founders
 * (feedback round 2, JAM-305): « une page sur le site pour trouver une
 * conseillère sommeil, Alix et Jordane avec notre calendly ». The client gave
 * the request, not the words: every entry is ours, written in the guide's
 * rules (vouvoiement, no exclamation mark, no em dash, no ellipsis) and
 * tagged `@relecture`. The page names no price, no duration and no place:
 * the calendar has them.
 */
export const consultationSommeil = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de la page (50 à 60 caractères). */
      title: "Consultation sommeil | Alix et Jordane, sages-femmes Berceo",
      /** @relecture Surya — description de la page (140 à 160 caractères). */
      description:
        "Le sommeil de votre bébé vous pose question ? Alix et Jordane, les deux sages-femmes à l'origine de Berceo, proposent une consultation sommeil sur rendez-vous.",
    },

    /** @relecture Surya — titre de la page. */
    title: "Consultation sommeil",
    /** @relecture Surya — introduction sous le titre. */
    intro:
      "Alix et Jordane, les deux sages-femmes à l'origine de Berceo, vous proposent une consultation consacrée au sommeil de votre bébé.",

    rendezVous: {
      /** @relecture Surya — titre du bloc qui porte le bouton. */
      title: "Prendre rendez-vous",
      /** @relecture Surya — texte du bloc qui porte le bouton. */
      paragraphs: [
        "Les nuits avec un bébé soulèvent beaucoup de questions. Alix et Jordane prennent le temps de vous écouter et de regarder avec vous ce qui peut aider votre famille à mieux se reposer.",
        "Le rendez-vous se prend en ligne, dans leur agenda. Vous y trouverez les créneaux disponibles et toutes les informations pratiques.",
      ],
      /** @relecture Surya — bouton vers l'agenda en ligne. */
      bouton: "Choisir un créneau",
      /** @relecture Surya — précision lue par les lecteurs d'écran, après le libellé du bouton. */
      nouvelOnglet: "(s'ouvre dans un nouvel onglet)",
    },

    etapes: {
      /** @relecture Surya — titre des trois étapes. */
      title: "Comment ça se passe",
      /** @relecture Surya — les trois étapes. */
      items: [
        {
          title: "Choisissez votre créneau",
          text: "Ouvrez l'agenda d'Alix et Jordane et retenez le moment qui vous convient.",
        },
        {
          title: "Confirmez votre rendez-vous",
          text: "Vous recevez une confirmation avec les informations pratiques de la consultation.",
        },
        {
          title: "Échangez avec une sage-femme",
          text: "Vous parlez du sommeil de votre bébé et de vos nuits, à votre rythme et sans jugement.",
        },
      ],
    },

    /** The line on the family's home, in her space. */
    espace: {
      /** @relecture Surya — lien sur l'accueil de l'espace famille. */
      lien: "Consultation sommeil avec Alix et Jordane",
    },
  },
});
