import { catalogue } from "./locale";

/**
 * `/consultation-sommeil` — the sleep consultation with the two founders
 * (feedback round 2, JAM-305): « une page sur le site pour trouver une
 * conseillère sommeil, Alix et Jordane avec notre calendly ». The client gave
 * the request, not the words: every entry is ours, written in the guide's
 * rules (vouvoiement, no exclamation mark, no em dash, no ellipsis) and
 * tagged `@relecture`. The page names no price, no duration and no place:
 * the calendar has them. The button opens the calendar in the same tab, and
 * the calendar sends the visitor back to the confirmation page (JAM-352).
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
        "Le rendez-vous se prend en ligne, dans leur agenda Calendly. Vous y trouverez les créneaux disponibles et toutes les informations pratiques. Une fois votre créneau choisi, vous revenez sur le site de Berceo.",
      ],
      /** @relecture Surya — bouton vers l'agenda en ligne (il s'ouvre dans le même onglet, JAM-352). */
      bouton: "Choisir un créneau",
    },

    etapes: {
      /** @relecture Surya — titre des trois étapes. */
      title: "Comment ça se passe",
      /** @relecture Surya — les trois étapes de la prise de rendez-vous (JAM-352). */
      items: [
        {
          title: "Choisissez votre créneau",
          text: "Le bouton ouvre Calendly, l'agenda en ligne d'Alix et Jordane. Retenez le moment qui vous convient.",
        },
        {
          title: "Revenez sur Berceo",
          text: "Dès que votre créneau est choisi, Calendly vous ramène sur le site de Berceo, qui vous indique la suite.",
        },
        {
          title: "Recevez votre e-mail",
          text: "Calendly vous envoie un e-mail de confirmation avec la date, l'heure et le lien du rendez-vous avec une sage-femme.",
        },
      ],
    },

    /**
     * `/consultation-sommeil/confirmation` (JAM-352): the page that Calendly
     * sends the visitor back to after a booking. The page cannot know whether
     * its visitor made a booking: it reads nothing of its address and has no
     * data. Each sentence is thus true for a visitor who comes straight to
     * it. It names no person, no date and no price.
     */
    confirmation: {
      meta: {
        /** @relecture Surya — titre de la page de confirmation (50 à 60 caractères). */
        title: "Consultation sommeil | La suite de votre rendez-vous Berceo",
        /** @relecture Surya — description de la page de confirmation (140 à 160 caractères). */
        description:
          "Après le choix de votre créneau dans l'agenda d'Alix et Jordane, voici la suite de votre consultation sommeil : un e-mail de confirmation, puis le rendez-vous.",
      },

      /** @relecture Surya — titre de la page de confirmation. */
      title: "Merci pour votre confiance",
      /** @relecture Surya — introduction sous le titre de la page de confirmation. */
      intro:
        "Une fois votre créneau choisi dans l'agenda d'Alix et Jordane, votre rendez-vous pour la consultation sommeil est enregistré.",

      suite: {
        /** @relecture Surya — titre du bloc de confirmation. */
        title: "Votre rendez-vous",
        /** @relecture Surya — texte du bloc de confirmation. */
        paragraphs: [
          "Vous n'avez rien d'autre à faire sur Berceo. La confirmation de votre rendez-vous vous arrive par e-mail, à l'adresse que vous avez donnée dans l'agenda.",
          "Si cet e-mail n'arrive pas, regardez dans vos courriers indésirables. Si vous n'avez pas encore choisi de créneau, vous pouvez le faire depuis la page de la consultation.",
        ],
        /** @relecture Surya — bouton vers l'accueil du site. */
        accueil: "Retour à l'accueil",
        /** @relecture Surya — bouton vers la connexion, qui mène une personne connectée à son espace. */
        espace: "Accéder à mon espace",
        /** @relecture Surya — lien vers la page de la consultation, pour qui n'a pas encore de créneau. */
        consultation: "Choisir un créneau",
      },

      etapes: {
        /** @relecture Surya — titre des trois étapes après la réservation. */
        title: "La suite",
        /** @relecture Surya — les trois étapes après la réservation. */
        items: [
          {
            title: "Consultez vos e-mails",
            text: "Calendly, l'agenda en ligne d'Alix et Jordane, vous envoie un e-mail de confirmation avec la date, l'heure et le lien du rendez-vous.",
          },
          {
            title: "Gardez le lien",
            text: "Conservez cet e-mail. Il contient ce qu'il vous faut pour rejoindre la consultation le moment venu.",
          },
          {
            title: "Échangez avec une sage-femme",
            text: "Vous parlez du sommeil de votre bébé et de vos nuits, à votre rythme et sans jugement.",
          },
        ],
      },
    },

    /** The line on the family's home, in her space. */
    espace: {
      /** @relecture Surya — lien sur l'accueil de l'espace famille. */
      lien: "Consultation sommeil avec Alix et Jordane",
    },
  },
});
