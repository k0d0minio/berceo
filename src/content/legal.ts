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
      /**
       * Calendly, the recipient of the booking data of the sleep consultation
       * (JAM-352). The page shows this block only where the consultation page
       * exists. It says what the code does: the calendar loads only after the
       * visitor's click, and what the visitor types there goes to Calendly.
       * It names no country of storage and no retention period: Berceo does
       * not know them. The founders' legal text replaces it when it arrives.
       */
      consultationSommeil: {
        /** @relecture Surya — titre du bloc sur Calendly, destinataire des données du rendez-vous. */
        title: "Consultation sommeil et Calendly",
        paragraphs: [
          /** @relecture Surya — quand l'agenda de Calendly se charge. */
          "Le rendez-vous de la consultation sommeil se prend dans un agenda fourni par Calendly. Cet agenda ne s'affiche qu'après votre clic sur « Choisir un créneau ». Avant ce clic, la page n'envoie rien à Calendly.",
          /** @relecture Surya — les données que Calendly reçoit, et ce qu'il en fait. */
          "Votre nom, votre adresse e-mail et les informations que vous saisissez dans l'agenda sont alors reçus par Calendly, qui vous envoie l'e-mail de confirmation du rendez-vous.",
          /** @relecture Surya — la politique de confidentialité qui s'applique à ces données. */
          "La politique de confidentialité de Calendly s'applique à ces données.",
        ],
      },
    },
  },
});
