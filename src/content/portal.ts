import { catalogue } from "./locale";

/**
 * The signed-in portal's shell. No portal route exists yet; these are the
 * words the shell itself says, plus the sign-out confirmation from the DA's
 * example (Couleurs de confirmation).
 */
export const portal = catalogue({
  fr: {
    header: {
      /** @relecture Surya — libellé d'accessibilité de la navigation de l'espace. */
      navLabel: "Navigation de mon espace",
      /** @relecture Surya — bouton du menu sur mobile. */
      openMenu: "Ouvrir le menu",
      /** @relecture Surya — bouton du menu sur mobile. */
      closeMenu: "Fermer le menu",
      /** @relecture Surya — titre du panneau de menu, lu par les lecteurs d'écran. */
      menuTitle: "Menu",
      /** @relecture Surya — lien du logo vers l'espace, lu par les lecteurs d'écran. */
      homeLabel: "Berceo, retour à mon espace",
    },

    /** The DA's confirmation example, verbatim. */
    signOut: {
      /** @relecture Surya — déclencheur de la déconnexion. */
      trigger: "Se déconnecter",
      title: "Souhaitez-vous vraiment vous déconnecter ?",
      description:
        "Vous devrez vous identifier à nouveau pour accéder à votre espace.",
      confirm: "Oui, me déconnecter",
      cancel: "Non, rester connecté",
    },
  },
});
