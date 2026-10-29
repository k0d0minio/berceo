import { catalogue } from "./locale";

/**
 * A family's favourite professionals (favoris-marquer): the mark on a
 * professional's full profile and on her search card. Every entry is ours,
 * tagged `@relecture`, written in the guide's rules (vouvoiement, no
 * exclamation mark, no em dash, no ellipsis) and waiting for Surya. `{name}`
 * slots are filled with `fill()` from ./locale.
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
  },
});
