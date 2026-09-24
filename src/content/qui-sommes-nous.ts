import { catalogue } from "./locale";

/**
 * `/qui-sommes-nous` — a placeholder until Alix and Jordane deliver their
 * story, written by them in the first person (D-23; operator decision in
 * Define, V-2). The page is `noindex` and out of the sitemap until then.
 *
 * Verbatim from the guide: the closing sentence. The rest is ours and tagged.
 */
export const quiSommesNous = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre et meta de la page d'attente. */
      title: "Qui sommes-nous | Berceo, garde de nuit pour nourrissons",
      /** @relecture Surya — idem. */
      description:
        "Berceo est né de l'expérience de deux sages-femmes belges. Leur histoire arrive bientôt sur cette page. Découvrez déjà la garde de nuit à domicile.",
    },

    title: "Qui sommes-nous",
    /** @relecture Surya — texte d'attente, remplacé par le récit des fondatrices. */
    placeholder:
      "Berceo est né de l'expérience de deux sages-femmes, Alix et Jordane. Elles vous racontent bientôt leur histoire sur cette page.",
    closing: "Vous aussi, faites confiance à Berceo.",
  },
});
