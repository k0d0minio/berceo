import { catalogue } from "./locale";

/**
 * The design-system reference pages (`/design-system`, `/design-system/portail`).
 * Not indexed and linked from nowhere: they are for the founders, Surya and
 * whoever builds the next screen. Section names are the DA's own.
 */
export const designSystem = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — page interne, non indexée. */
      title: "Système de design",
      /** @relecture Surya — page interne, non indexée. */
      description:
        "La direction artistique web de Berceo appliquée : couleurs, typographie, boutons, cartes et blocs.",
    },

    /** @relecture Surya — page interne, non indexée. */
    intro:
      "Chaque écran de la plateforme est construit avec ces éléments. Ils appliquent la direction artistique web de Surya.",

    palette: {
      title: "Couleurs",
      /** The DA's own names, roles and indicative shares (Couleurs, p. 16 et 17). */
      swatches: [
        { token: "blanc", name: "Blanc", role: "Fond principal et surface de contenu", share: "30 %" },
        { token: "sauge", name: "Vert sauge", role: "Couleur identitaire", share: "25 %" },
        { token: "raye", name: "Motif rayé", role: "Fond secondaire identitaire", share: "20 %" },
        { token: "taupe", name: "Gris taupe", role: "Couleur de soutien, surface éditoriale", share: "15 %" },
        { token: "perle", name: "Gris perle", role: "Fond discret", share: "5 %" },
        { token: "beurre", name: "Jaune beurre", role: "Couleur d'accent", share: "5 %" },
      ],
    },

    type: {
      title: "Hiérarchie typographique",
      /** One line per level of the DA's table; the sample is the DA's own copy. */
      levels: [
        { level: "h1", name: "H1", sample: "Votre bébé est entre de bonnes mains." },
        { level: "h2", name: "H2", sample: "Dormir pour prendre soin de son bébé" },
        { level: "nav", name: "Navigation", sample: "Comment ça marche" },
        { level: "h3", name: "H3", sample: "Les premières nuits" },
        {
          level: "intro",
          name: "Texte d'introduction",
          sample:
            "Les premières nuits avec un nourrisson sont intenses. Berceo est là pour veiller sur votre bébé pendant que vous vous reposez.",
        },
        {
          level: "corps",
          name: "Texte courant",
          sample:
            "Publiez votre demande de garde de nuit. Les professionnelles de santé disponibles dans votre zone vous répondent. Vous choisissez celle qui veillera sur votre bébé.",
        },
        { level: "bouton", name: "Bouton", sample: "Je cherche une garde de nuit" },
        { level: "champ", name: "Champ de formulaire", sample: "Bruxelles" },
        { level: "legende", name: "Légende", sample: "Profil vérifié par Berceo" },
      ],
    },

    buttons: {
      title: "Boutons et actions",
      /** One per background of the DA's table. */
      backgrounds: {
        blanc: "Sur fond blanc",
        raye: "Sur le motif rayé",
        sauge: "Sur fond vert sauge",
        taupe: "Sur fond gris taupe",
      },
      sample: "Je cherche une garde de nuit",
      /** The DA's own column names (Boutons et actions, p. 23). */
      states: { default: "Par défaut", hover: "Au survol" },
    },

    cards: {
      title: "Cartes et blocs de contenu",
      /** @relecture Surya — explication interne. */
      onBlanc: "Carte sur fond blanc",
      /** @relecture Surya — explication interne. */
      onSauge: "Carte sur fond vert sauge",
      /** @relecture Surya — explication interne. */
      onPerle: "Carte sur fond gris perle",
      cardTitle: "Dormir pour prendre soin de son bébé",
      cardText:
        "Les premières nuits avec un nourrisson sont intenses. Berceo est là pour veiller sur votre bébé pendant que vous vous reposez.",
      cardCaption: "Profil vérifié par Berceo",
    },

    striped: {
      title: "Motif rayé",
      blockTitle: "Dormez. Votre bébé est entre de bonnes mains.",
    },

    translucent: {
      title: "Le système de transparence",
      blockTitle: "Trouver une garde de nuit",
      fieldLabel: "Votre commune ou votre code postal",
      fieldPlaceholder: "Bruxelles",
    },

    dialog: {
      title: "Couleurs de confirmation",
      /** @relecture Surya — explication interne. */
      hint: "Le rouge et le vert n'apparaissent que dans les fenêtres de confirmation.",
    },

    portail: {
      meta: {
        /** @relecture Surya — page interne, non indexée. */
        title: "Espace connecté",
        /** @relecture Surya — page interne, non indexée. */
        description: "La structure de l'espace connecté de Berceo.",
      },
      /** @relecture Surya — exemples de navigation ; les vraies pages viennent avec leurs fonctionnalités. */
      nav: [
        { label: "Mes demandes", href: "#demandes" },
        { label: "Mes messages", href: "#messages" },
        { label: "Mon profil", href: "#profil" },
      ],
      title: "Mon espace",
      /** @relecture Surya — explication interne. */
      text: "Les écrans de l'espace connecté prendront place ici.",
    },
  },
});
