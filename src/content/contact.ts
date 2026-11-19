import { catalogue } from "./locale";

/**
 * `/contact` (JAM-327, Jamie's answer to question 2): a simple form whose
 * message goes to the address of the environment variable `CONTACT_EMAIL`.
 * No address is ever shown. Neither the deck nor the guide has these words:
 * each is ours, written in the guide's rules, and waits for Surya.
 */
export const contact = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de la page de contact. */
      title: "Contact | Écrire à l'équipe Berceo, garde de nuit bébé",
      /** @relecture Surya — description de la page de contact. */
      description:
        "Une question sur les gardes de nuit à domicile, sur votre compte ou sur le réseau des professionnelles ? Écrivez à l'équipe Berceo avec ce formulaire.",
    },
    /** The deck's navigation label (slide 19). */
    title: "Contact",
    /** @relecture Surya — introduction de la page de contact. */
    intro: "Une question ? Écrivez-nous. L'équipe Berceo vous répond par e-mail.",
    champs: {
      /** @relecture Surya — champ du formulaire de contact. */
      nom: "Votre nom",
      /** @relecture Surya — champ du formulaire de contact. */
      email: "Votre adresse e-mail",
      /** @relecture Surya — champ du formulaire de contact. */
      message: "Votre message",
      /** @relecture Surya — aide sous le champ du message. */
      messageAide: "2 000 caractères au maximum.",
    },
    /** @relecture Surya — bouton d'envoi du formulaire de contact. */
    bouton: "Envoyer le message",
    /** @relecture Surya — bouton pendant l'envoi. */
    enCours: "Envoi en cours",
    /** @relecture Surya — confirmation après l'envoi. */
    confirmation: "Votre message est envoyé. Nous vous répondons par e-mail dès que possible.",
    erreurs: {
      /** @relecture Surya — champ vide. */
      nom: "Indiquez votre nom.",
      /** @relecture Surya — adresse vide ou mal formée. */
      email: "Indiquez une adresse e-mail valide.",
      /** @relecture Surya — message vide. */
      message: "Écrivez votre message.",
      /** @relecture Surya — message trop long. */
      messageLong: "Votre message dépasse 2 000 caractères.",
      /** @relecture Surya — l'envoi a échoué. */
      envoi: "Votre message n'a pas pu être envoyé. Réessayez dans quelques minutes.",
    },
    /** The e-mail the team receives. It is not client-facing. */
    courriel: {
      objet: "Message du formulaire de contact : {nom}",
      de: "De : {nom} ({email})",
    },
  },
});
