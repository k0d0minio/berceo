import { catalogue } from "./locale";

/**
 * The founders' back-office. Nothing here is in Surya's guide yet: every entry
 * is ours, written in its rules and tagged `@relecture`. `{name}` slots are
 * filled with `fill()`.
 */
export const admin = catalogue({
  fr: {
    reglages: {
      /** @relecture Surya — titre de la section des réglages. */
      titre: "Réglages",
    },

    /** Le réglage des étudiantes sages-femmes (D-7). */
    etudiantes: {
      /** @relecture Surya — nom du réglage, repris du spec. */
      titre: "Accueillir les étudiantes sages-femmes",
      /** @relecture Surya — ce que fait le réglage. */
      description:
        "Activé, « étudiante sage-femme (3e ou 4e année) » est proposé aux professionnelles qui s'inscrivent. Désactivé, il ne l'est plus, et les dossiers qui le portent déjà le gardent.",
      /** @relecture Surya — état du réglage. */
      active: "Activé",
      desactive: "Désactivé",
      /** @relecture Surya — dernier changement. */
      modifie: "Modifié le {date} par {nom}",
      jamais: "Jamais modifié",
      /** @relecture Surya — boutons et confirmation. */
      activer: "Activer",
      desactiver: "Désactiver",
      confirmation: {
        titreActiver: "Accueillir les étudiantes sages-femmes ?",
        titreDesactiver: "Ne plus accueillir les étudiantes sages-femmes ?",
        descriptionActiver:
          "Les professionnelles qui s'inscrivent pourront choisir « étudiante sage-femme (3e ou 4e année) ».",
        descriptionDesactiver:
          "Ce choix ne sera plus proposé. Les dossiers qui le portent déjà le garderont.",
        oui: "Oui, confirmer",
        non: "Non, ne rien changer",
      },
      /** @relecture Surya — échec de l'enregistrement. */
      erreur: "Le réglage n'a pas pu être enregistré. Réessayez dans un instant.",
    },
  },
});
