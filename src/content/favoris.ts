import { catalogue } from "./locale";

/**
 * A family's favourite professionals: the mark on a professional's full
 * profile and on her search card (favoris-marquer), and the list « Mes
 * professionnelles » (favoris-liste). Every entry is ours, tagged
 * `@relecture`, written in the guide's rules (vouvoiement, no exclamation
 * mark, no em dash, no ellipsis) and waiting for Surya. `{name}` slots are
 * filled with `fill()` from ./locale. « Voir le profil complet » and « Lui
 * envoyer ma demande en priorité » are the guide's, in `./reservations.ts`.
 */
export const favoris = catalogue({
  fr: {
    /** @relecture Surya — le bouton qui marque une professionnelle. */
    ajouter: "Ajouter à mes professionnelles",
    /** @relecture Surya — le bouton qui retire la marque. */
    retirer: "Retirer de mes professionnelles",
    /** @relecture Surya — nom accessible du bouton sur une carte de la recherche. */
    ajouterNom: "Ajouter {prenom} à mes professionnelles",
    /** @relecture Surya — nom accessible du bouton sur une carte de la recherche. */
    retirerNom: "Retirer {prenom} de mes professionnelles",
    /** @relecture Surya — entrée de navigation et titre de la page de la liste. */
    nav: "Mes professionnelles",
    liste: {
      /** @relecture Surya — la phrase sous le titre. */
      intro:
        "Retrouvez ici les professionnelles que vous avez ajoutées et celles qui ont déjà fait une garde chez vous.",
      /** @relecture Surya — le titre du premier bloc, ses favorites. */
      ajoutees: "Celles que vous avez ajoutées",
      /** @relecture Surya — le titre du second bloc, les professionnelles de ses gardes passées. */
      passees: "Celles de vos gardes passées",
      /** @relecture Surya — la ligne quand la liste est vide. Le lien vers la recherche la suit. */
      vide: "Vous n'avez pas encore de professionnelle ici.",
      /** @relecture Surya — la carte d'une professionnelle qui n'est plus validée ou dont le compte est suspendu. */
      indisponible: "Cette professionnelle n'est plus disponible sur Berceo.",
    },
  },
});
