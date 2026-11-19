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
        /** The DA's confirmation colours (JAM-300). @relecture Surya — explication interne. */
        { token: "rouge-confirmation", name: "Rouge de confirmation", role: "Choix importants : annuler, refuser", share: "" },
        /** @relecture Surya — explication interne. */
        { token: "vert-confirmation", name: "Vert de confirmation", role: "Choix importants : confirmer", share: "" },
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
        /** @relecture Surya — explication interne (JAM-300). */
        rouge: "Refuser, dans l'espace des fondatrices",
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
      hint: "Le rouge et le vert n'apparaissent que pour les choix importants : confirmer, annuler, refuser.",
    },

    icons: {
      title: "Iconographie",
      /** @relecture Surya — explication interne (JAM-300). */
      text: "Des icônes pleines, simples et arrondies. 20 à 24 px dans les champs et la navigation, 24 à 32 px dans les cartes, 40 à 56 px pour les services.",
    },

    /**
     * The deck's screens, one specimen for each slide, so Surya can examine
     * them (JAM-327). The slide numbers are the pages of `Direction
     * artistique web.pdf`.
     */
    ecrans: {
      /** @relecture Surya — page interne, non indexée. */
      title: "Les écrans du deck",
      /** @relecture Surya — explication interne. */
      text: "Un exemple pour chaque diapositive du deck « Direction artistique web ». Le numéro est celui de la page du PDF.",
      /** @relecture Surya — légende d'un exemple, « Diapositive 19 ». */
      diapositive: "Diapositive {n}",
      /** @relecture Surya — légendes internes des exemples. */
      legendes: {
        accueil: "L'en-tête sur la photo, le héros et le premier bloc sur rayures",
        bandeau: "Le bandeau de section, puis le bloc taupe sur rayures",
        blocTaupe: "Le bloc de contenu taupe",
        carteTransparente: "La carte transparente à icônes sur une photo",
        recherche: "Le bloc transparent sur une photo, et le champ de recherche sur sauge",
        dialogue: "Le dialogue de confirmation",
        cartes: "La carte de profil et la carte de demande, sur sauge",
        histoire: "« Notre histoire »",
        temoignages: "Les cartes de témoignage",
        attente: "La page d'attente",
        icones: "Les 18 icônes de Surya",
      },
      /** The deck's sample of slide 10. */
      bandeau: {
        title: "Les Gardiennes",
        text: "Les professionnelles de santé qui veillent sur les premières nuits des familles.",
      },
      /** The deck's sample of slide 21. */
      recherche: { titre: "Titre", texte: "Un texte court sur une photographie.", ville: "ville" },
      /** The deck's sample card of slide 25. */
      profil: { prenom: "Emma", commune: "Bruxelles" },
      /**
       * The deck's sample testimonial of slide 27, word for word. It is an
       * example, not a real testimonial: it never leaves this page.
       */
      temoignage: {
        exemple: "Exemple",
        etoiles: "5 étoiles sur 5",
        liste: "Exemples de témoignages",
        quote:
          "« Après plusieurs semaines sans véritable nuit de repos, nous avons réservé une garde avec une sage-femme rencontrée sur Berceo. Son profil vérifié nous a immédiatement rassurés. Cette nuit nous a permis de souffler tout en sachant notre bébé entre de bonnes mains. »",
        name: "Sophie, Bruxelles",
        detail: "Maman d'un bébé de trois mois",
      },
      /** The deck's waiting page of slide 29, word for word. */
      attente: {
        title: "Votre bébé est entre de bonnes mains",
        text: "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile.",
        bouton: "Site en construction",
      },
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
      disponibilites: {
        /** @relecture Surya — page interne, non indexée. */
        title: "Prochaines disponibilités",
        /** @relecture Surya — explication interne (D-69). */
        text: "Le bloc vu par les familles sur le profil d'une professionnelle, avec des nuits indiquées puis sans aucune.",
      },
      avis: {
        /** @relecture Surya — page interne, non indexée. */
        title: "Les étoiles",
        /** @relecture Surya — explication interne (avis-etoiles). */
        text: "Une note avec son nombre de gardes, une personne sans note encore, et un critère du formulaire d'avis.",
      },
      recherche: {
        /** @relecture Surya — page interne, non indexée. */
        title: "La recherche",
        /** @relecture Surya — explication interne (recherche-et-fiches-publiques). */
        text: "La carte d'une professionnelle dans la recherche de l'espace famille, la même carte sur une page commune publique, sans photo ni disponibilités, et le message quand aucune professionnelle ne couvre la zone.",
        /** @relecture Surya — prénom d'exemple. */
        prenom: "Emma",
      },
    },
  },
});
