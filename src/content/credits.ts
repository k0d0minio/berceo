import { catalogue } from "./locale";

/**
 * A family's Berceo credit ledger (credits-registre): the block « Mes crédits » on
 * her home and on « Mes réservations ». Every entry is ours, tagged
 * `@relecture`, written in the guide's rules (vouvoiement, no exclamation
 * mark, no em dash, no ellipsis) and waiting for Surya. `{montant}` is the
 * amount in euros from `eurosFromCents`, the € after it (D-99); `{date}` is
 * a day as `formatDate` writes it. Both are filled with `fill()` from
 * ./locale. The 24 months are the answers' [9.2], not a price.
 */
export const creditsFamille = catalogue({
  fr: {
    /** @relecture Surya — titre du bloc, sur l'accueil et sur « Mes réservations ». */
    titre: "Mes crédits",
    /** @relecture Surya — la phrase sous le titre. */
    intro: "Un crédit Berceo couvre les frais de service d'une prochaine garde. Il est valable 24 mois.",
    /** @relecture Surya — le solde, l'euro après le nombre. */
    solde: "Votre solde : {montant} €",
    /** @relecture Surya — la ligne quand elle n'a aucun crédit. */
    vide: "Vous n'avez pas de crédit pour le moment.",
    /** @relecture Surya — un crédit disponible : ce qu'il peut encore payer, et sa date d'expiration. */
    valable: "{montant} €, valable jusqu'au {date}",
    /** @relecture Surya — un crédit déjà utilisé en entier. */
    utilise: "{montant} €, utilisé",
    /** @relecture Surya — un crédit annulé : l'absence qui l'a créé a été contestée (annulations-table). */
    annule: "{montant} €, annulé après la contestation du signalement",
    /** @relecture Surya — un crédit expiré, et sa date d'expiration. */
    expire: "{montant} €, expiré le {date}",
    /** @relecture Surya — le titre de la liste des crédits qui ne paient plus rien. */
    passes: "Crédits utilisés, annulés ou expirés",
    /** @relecture Surya — l'origine d'un crédit, une ligne du tableau des fondatrices ou leur geste. */
    origines: {
      annulation_famille: "Garde annulée par vous",
      annulation_professionnelle: "Garde annulée par la professionnelle",
      absence_professionnelle: "Absence de la professionnelle",
      annulation_berceo: "Garde annulée par Berceo",
      geste_berceo: "Offert par Berceo",
    },
  },
});
