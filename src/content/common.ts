import { catalogue } from "./locale";

/**
 * Words every surface shares: the brand, the public header and footer, the
 * calls to action. Written to Surya's editorial guide (D-19): vouvoiement, no
 * exclamation mark, no em dash, no ellipsis, the validated lexicon.
 *
 * Page names and URLs are the guide's URL map, verbatim. An entry tagged
 * `@relecture` is ours, written in the guide's rules, and waits for Surya.
 */
export const common = catalogue({
  fr: {
    name: "Berceo",

    /** The vitrine's pages, from the guide's URL map. Built by the vitrine stub. */
    pages: {
      commentCaMarche: { label: "Comment ça marche", href: "/comment-ca-marche" },
      /** The professional's side of « Comment ça marche » (feedback round 1). */
      commentCaMarcheProfessionnelles: {
        /** @relecture Surya — nom de la page des professionnelles. */
        label: "Comment ça marche pour les professionnelles",
        href: "/comment-ca-marche/professionnelles",
      },
      tarifs: { label: "Tarifs", href: "/tarifs" },
      quiSommesNous: { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
      faq: { label: "FAQ", href: "/faq" },
      /** The charter each professional accepts at step 4 (onboarding-retour-1). */
      charte: {
        label: "Charte des professionnelles Berceo",
        href: "/charte-des-professionnelles",
      },
      inscriptionFamille: {
        label: "Inscription famille",
        href: "/inscription-famille",
      },
      inscriptionProfessionnelle: {
        label: "Inscription professionnelle",
        href: "/inscription-professionnelle",
      },
      conditionsGenerales: { label: "CGU", href: "/conditions-generales" },
      confidentialite: {
        label: "Politique de confidentialité",
        href: "/confidentialite",
      },
    },

    /**
     * The public navigation, as the DA's deck writes it (slide 19; JAM-327,
     * Jamie's answers to questions 2 and 5). « Contact » shows only where the
     * environment has a contact address.
     */
    nav: {
      accueil: { label: "Accueil", href: "/" },
      histoire: { label: "Histoire", href: "/qui-sommes-nous" },
      gardesDeNuit: { label: "Nos gardes de nuit", href: "/comment-ca-marche" },
      contact: { label: "Contact", href: "/contact" },
    },

    header: {
      /** @relecture Surya — icône de compte de l'en-tête, lue par les lecteurs d'écran. */
      compte: "Mon compte",
      /** @relecture Surya — libellé d'accessibilité de la navigation principale. */
      navLabel: "Navigation principale",
      /** @relecture Surya — bouton du menu sur mobile. */
      openMenu: "Ouvrir le menu",
      /** @relecture Surya — bouton du menu sur mobile. */
      closeMenu: "Fermer le menu",
      /** @relecture Surya — titre du panneau de menu, lu par les lecteurs d'écran. */
      menuTitle: "Menu",
      /** @relecture Surya — lien du logo vers l'accueil, lu par les lecteurs d'écran. */
      homeLabel: "Berceo, retour à l'accueil",
    },

    footer: {
      /** @relecture Surya — libellé d'accessibilité du pied de page. */
      navLabel: "Pied de page",
      /** @relecture Surya — accroche sous le logo, reprise du message principal du guide. */
      tagline:
        "Des professionnelles de santé veillent sur votre bébé pour que vous puissiez enfin dormir.",
    },

    /**
     * The two calls to action of D-25. "Gardienne de la nuit" is a button only
     * where the text above has said these are health professionals; everywhere
     * else it is "Trouver une professionnelle".
     */
    cta: {
      trouverGardienne: "Trouver votre gardienne de la nuit",
      trouverProfessionnelle: "Trouver une professionnelle",
      /** The professional's door, the guide's recommended wording (vitrine). */
      rejoindreReseau: "Rejoindre le réseau",
    },

    /**
     * Who the professionals are, worded so it stays true whether or not the
     * founders admit students (D-7): no « diplômées » here.
     * @relecture Surya — formulation couvrant les étudiantes sages-femmes, en attente du guide révisé.
     */
    professionnelles:
      "Sages-femmes, infirmières en néonatologie, puéricultrices : chaque professionnelle est vérifiée par Berceo avant sa première garde.",
  },
});
