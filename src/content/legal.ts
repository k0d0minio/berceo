import { catalogue } from "./locale";

/**
 * The two legal pages, placeholders until the founders deliver the texts (the
 * guide leaves legal drafting to Berceo). Both are `noindex` and out of the
 * sitemap until then.
 *
 * @relecture Surya — titres, metas et textes d'attente des pages légales.
 */
export const legal = catalogue({
  fr: {
    conditionsGenerales: {
      meta: {
        title: "Conditions générales d'utilisation de la plateforme | Berceo",
        description:
          "Les conditions générales d'utilisation de Berceo, plateforme belge de garde de nuit à domicile, seront publiées ici avant l'ouverture de la plateforme.",
      },
      title: "Conditions générales d'utilisation",
      placeholder:
        "Les conditions générales d'utilisation seront publiées sur cette page avant l'ouverture de la plateforme.",
    },
    confidentialite: {
      meta: {
        title: "Politique de confidentialité de la plateforme | Berceo",
        description:
          "La politique de confidentialité de Berceo, plateforme belge de garde de nuit à domicile, sera publiée sur cette page avant l'ouverture de la plateforme.",
      },
      title: "Politique de confidentialité",
      placeholder:
        "La politique de confidentialité sera publiée sur cette page avant l'ouverture de la plateforme.",
    },
  },
});
