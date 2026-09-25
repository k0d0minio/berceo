import { catalogue } from "./locale";

/**
 * The conversation between a family and a professional (messagerie): the two
 * lists, the conversation page, Berceo's two messages (D-87), the reminder
 * line (D-88) and the closed line (D-89). Entries marked « guide » are Surya's
 * guide verbatim (« La messagerie »), « cahier des charges » the founders'
 * text (E, « Messagerie interne »); every `@relecture` entry is ours, written
 * in the guide's rules (vouvoiement, no exclamation mark, no em dash, no
 * ellipsis) and waiting for Surya. Never a word about insurance (D-8).
 * `{name}` slots are filled with `fill()` from ./locale.
 */
export const messagerie = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — onglet de la liste des conversations. */
      liste: "Messages",
      /** @relecture Surya — onglet d'une conversation. */
      conversation: "Conversation",
    },

    nav: {
      /** @relecture Surya — l'entrée de la navigation de l'espace. */
      libelle: "Messages",
      /** @relecture Surya — le compteur, lu par les lecteurs d'écran (une conversation). */
      nonLue: "1 conversation non lue",
      /** @relecture Surya — le compteur, lu par les lecteurs d'écran (plusieurs). */
      nonLues: "{n} conversations non lues",
    },

    liste: {
      /** @relecture Surya — titre de la liste. */
      titre: "Messages",
      /** Guide — le message à l'ouverture, côté famille. */
      introFamille:
        "La messagerie s'ouvre dès qu'une professionnelle postule à votre demande. Vous pouvez échanger pour préciser les modalités de la garde.",
      /** @relecture Surya — le même message, côté professionnelle. */
      introProfessionnelle:
        "La messagerie s'ouvre dès que vous répondez à une demande. Vous pouvez échanger avec la famille pour préciser les modalités de la garde.",
      /** @relecture Surya — aucune conversation. */
      vide: "Aucune conversation pour le moment.",
      /** @relecture Surya — la nuit d'une conversation dans la liste. */
      garde: "Garde du {date}",
      /** @relecture Surya — marque d'une conversation non lue. */
      nonLu: "Non lu",
      /** @relecture Surya — marque d'une conversation fermée. */
      fermee: "Fermée",
      /** @relecture Surya — aperçu d'un message de Berceo. */
      apercuBerceo: "Un message de l'équipe Berceo",
    },

    conversation: {
      /** @relecture Surya — titre de la page, avec le prénom de l'autre personne. */
      titre: "Conversation avec {prenom}",
      /** @relecture Surya — la nuit de la conversation. */
      garde: "Garde du {date}, {heures}",
      /** @relecture Surya — retour vers la demande (famille). */
      voirDemande: "Voir la demande",
      /** @relecture Surya — retour vers la réservation (famille). */
      voirReservation: "Voir la réservation",
      /** @relecture Surya — retour vers la garde (professionnelle). */
      voirGarde: "Voir la garde",
      /** @relecture Surya — retour vers la liste des demandes (professionnelle). */
      voirDemandes: "Voir les demandes",
      /** @relecture Surya — retour vers la liste des conversations. */
      toutes: "Toutes mes conversations",
      /** @relecture Surya — l'auteur des messages de Berceo. */
      berceo: "L'équipe Berceo",
      /** @relecture Surya — l'auteur de ses propres messages, lu par les lecteurs d'écran. */
      vous: "Vous",
      /** @relecture Surya — l'autre personne a ouvert la conversation après votre dernier message. */
      lu: "Lu",
      /** @relecture Surya — l'étiquette du champ. */
      champ: "Votre message",
      /** @relecture Surya — le bouton d'envoi. */
      envoyer: "Envoyer",
      /** @relecture Surya — la conversation n'accepte plus de message (D-89). */
      fermee: "Cette conversation est fermée. Vous pouvez toujours la relire.",
      /** @relecture Surya — le rappel, sans la mention d'assurance du guide (D-8, D-88). */
      rappel: "Une garde est réservée une fois confirmée sur Berceo.",
    },

    /** Les deux messages de Berceo (D-87), chacun d'une source, le « ! » remplacé par « . » (D-19). */
    berceo: {
      /**
       * Guide — le message d'amorce automatique, quand elle répond.
       * @relecture Surya — « Bonjour. » au lieu de « Bonjour ! » (D-87).
       */
      amorce:
        "Bonjour. Pour préparer au mieux cette garde, nous vous suggérons d'échanger sur : le rythme de votre bébé, ses habitudes d'endormissement, et tout ce que vous souhaitez partager sur son quotidien. La professionnelle répondra dès que possible.",
      /**
       * Cahier des charges — le message automatique, quand la famille confirme la réservation.
       * @relecture Surya — deux « ! » remplacés par « . » (D-87).
       */
      bonneGarde:
        "L'équipe Berceo vous souhaite une excellente garde. 🤍 N'hésitez pas également à confirmer ensemble les derniers détails pratiques (heure d'arrivée, adresse, accès au domicile, besoins particuliers du bébé, etc.). Nous vous souhaitons une belle expérience et une garde en toute sérénité.",
    },

    /** Les liens vers la conversation, depuis les demandes, les réservations et les gardes. */
    liens: {
      /** @relecture Surya — sur une réponse ou une réservation (famille). */
      ecrire: "Écrire à {prenom}",
      /** @relecture Surya — sur une demande à laquelle elle a répondu, ou une garde (professionnelle). */
      voir: "Voir la conversation",
    },

    erreurs: {
      /** @relecture Surya — message vide. */
      vide: "Écrivez votre message avant de l'envoyer.",
      /** @relecture Surya — message trop long. */
      tropLong: "Votre message dépasse 2 000 caractères. Raccourcissez-le avant de l'envoyer.",
      /** @relecture Surya — la conversation s'est fermée entre-temps. */
      fermee: "Cette conversation est fermée. Votre message n'a pas été envoyé.",
      /** @relecture Surya — tout autre échec. */
      generique: "Votre message n'a pas pu être envoyé. Réessayez dans un instant.",
    },
  },
});
