import { catalogue } from "./locale";

/**
 * The family's profile and the prompt on her space's home. None of these lines
 * is in Surya's guide yet, so every entry is ours, written in the guide's rules
 * (vouvoiement, no exclamation mark, no em dash, no ellipsis) and tagged
 * `@relecture Surya`. The field labels the profile shares with sign-up
 * (prénom, nom, e-mail, téléphone) stay in ./comptes. `{n}` is filled with
 * `fill()` from ./locale.
 */
export const famille = catalogue({
  fr: {
    profil: {
      /** @relecture Surya — titre de la page profil (onglet et en-tête). */
      titre: "Mon profil",
      /** @relecture Surya — introduction de la page profil. */
      intro: "Vos coordonnées et votre commune. Vous pouvez les modifier à tout moment.",

      sections: {
        /** @relecture Surya — titre de section. */
        coordonnees: "Vos coordonnées",
        /** @relecture Surya — titre de section. */
        adresse: "Votre commune et votre adresse",
        /** @relecture Surya — titre de section. */
        famille: "Votre famille",
      },

      champs: {
        /** @relecture Surya — libellé du champ commune. */
        commune: "Commune ou code postal",
        /** @relecture Surya — libellé. */
        rue: "Rue",
        /** @relecture Surya — libellé. */
        numero: "Numéro",
        /** @relecture Surya — libellé. */
        boite: "Boîte",
        /** @relecture Surya — libellé du champ facultatif sur la famille. */
        contexte: "Quelques mots sur votre famille",
      },

      aides: {
        /** @relecture Surya — l'e-mail ne peut pas être modifié tant que Neon Auth ne le permet pas. */
        email: "Votre adresse e-mail ne peut pas être modifiée pour le moment.",
        /** @relecture Surya — aide sous le champ commune. */
        commune:
          "Tapez votre code postal ou le nom de votre commune, puis choisissez-la dans la liste.",
        /** @relecture Surya — l'adresse n'est partagée qu'après la réservation (D-15). */
        adresse:
          "Votre adresse n'est communiquée à la professionnelle qu'une fois la réservation confirmée. Vous pouvez la compléter maintenant ou au moment de réserver.",
        /** @relecture Surya — aucune donnée de santé (D-20). */
        contexte:
          "Facultatif. N'indiquez aucune information de santé ni le prénom de vos enfants.",
        /** @relecture Surya — compteur de caractères. */
        compteur: "{n} caractères sur 300",
      },

      commune: {
        /** @relecture Surya — exemple dans le champ commune. */
        exemple: "Par exemple 1050 ou Ixelles",
        /** @relecture Surya — liste vide. */
        aucunResultat: "Aucune commune ne correspond. Vérifiez le code postal ou l'orthographe.",
        /** @relecture Surya — nom de la liste pour les lecteurs d'écran. */
        liste: "Communes correspondantes",
      },

      /** @relecture Surya — bouton. */
      bouton: "Enregistrer",
      /** @relecture Surya — bouton pendant l'envoi. */
      enCours: "Enregistrement en cours",
      /** @relecture Surya — confirmation après l'enregistrement. */
      enregistre: "Vos informations sont enregistrées.",

      erreurs: {
        /** @relecture Surya — commune tapée mais pas choisie dans la liste. */
        commune: "Choisissez votre commune dans la liste.",
        /** @relecture Surya — rue sans numéro, ou numéro sans rue. */
        adresseIncomplete: "Indiquez la rue et le numéro.",
        /** @relecture Surya — boîte sans rue ni numéro. */
        boiteSeule: "Indiquez aussi la rue et le numéro.",
        /** @relecture Surya — texte au-delà de 300 caractères. */
        contexteLong: "Ce texte ne peut pas dépasser 300 caractères.",
        /** @relecture Surya — rue, numéro ou boîte trop longs. */
        long: "Ce texte est trop long.",
      },
    },

    accueil: {
      completer: {
        /** @relecture Surya — encart sur l'espace famille tant que la commune manque. */
        titre: "Complétez votre profil",
        /** @relecture Surya — pourquoi la commune est demandée. */
        texte: "Indiquez votre commune pour pouvoir publier vos demandes de garde.",
        /** @relecture Surya — lien vers le profil. */
        lien: "Compléter mon profil",
      },
    },
  },
});
