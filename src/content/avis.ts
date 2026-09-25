import { catalogue } from "./locale";

/**
 * The ratings after a garde (avis-etoiles, D-18, D-115 to D-122): the
 * criteria, the form, why a garde cannot be rated, the note and the gardes
 * count wherever they show. Surya's guide gives only « Laisser un avis » (its
 * post-garde e-mail's button); every other entry is ours, written in the
 * guide's rules (vouvoiement, no exclamation mark, no em dash, no ellipsis, no
 * insurance wording, D-8) and waiting for Surya. Stars only: nothing here asks
 * for a word of text (D-18). `{name}` slots are filled with `fill()`.
 */
export const avis = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de l'onglet du formulaire. */
      titre: "Votre avis sur la garde",
    },

    /** Guide — le bouton de l'e-mail « Demande d'avis post-garde ». */
    lien: "Laisser un avis",

    /**
     * @relecture Surya — les critères (D-115), dans l'ordre des quatre notes.
     * La famille note la professionnelle ; la professionnelle note la famille.
     */
    criteres: {
      famille: {
        ponctualite: "Ponctualité",
        communication: "Communication",
        soin: "Soin",
        confiance: "Confiance",
      },
      professionnelle: {
        accueil: "Accueil",
        communication: "Communication",
        clarteConsignes: "Clarté des consignes",
        respectCadre: "Respect du cadre",
      },
    },

    formulaire: {
      /** @relecture Surya — titre côté famille : la professionnelle et la nuit. */
      titreFamille: "Votre avis sur la garde de {prenom}",
      /** @relecture Surya — titre côté professionnelle : la famille et la nuit. */
      titreProfessionnelle: "Votre avis sur la garde chez {prenom}",
      /** @relecture Surya — la nuit, sous le titre. */
      nuit: "Nuit du {date}",
      /** @relecture Surya — la consigne. */
      consigne: "Choisissez de 1 à 5 étoiles pour chacun des quatre critères.",
      /** @relecture Surya — nom accessible d'une étoile, au singulier. */
      etoile: "{n} étoile sur 5",
      /** @relecture Surya — nom accessible d'une étoile, au pluriel. */
      etoiles: "{n} étoiles sur 5",
      /** @relecture Surya — la publication en double aveugle (D-116). */
      publication:
        "Votre avis compte dans la note de {prenom} dès que {prenom} a donné le sien, ou au plus tard 14 jours après la garde. Personne ne voit le détail de vos étoiles.",
      /** @relecture Surya — un avis ne se modifie pas (D-117). */
      definitif: "Une fois envoyé, votre avis ne peut plus être modifié.",
      /** @relecture Surya — le bouton d'envoi. */
      bouton: "Envoyer mon avis",
      /** @relecture Surya — pendant l'envoi. */
      envoi: "Envoi en cours",
      /** @relecture Surya — après l'envoi. */
      merci: "Merci, votre avis est enregistré.",
      /** @relecture Surya — retour à la garde. */
      retour: "Revenir à la garde",
    },

    /** @relecture Surya — l'avis donné, en lecture seule, sur la garde. */
    donne: {
      titre: "Votre avis",
      date: "Donné le {date}",
    },

    /** @relecture Surya — pourquoi le formulaire ne s'affiche pas (D-117, D-122). */
    refus: {
      pasTerminee: "Vous pourrez donner votre avis une fois la garde terminée.",
      annulee: "Cette garde a été annulée : elle ne reçoit pas d'avis.",
      delaiPasse: "Le délai de 14 jours pour donner votre avis sur cette garde est passé.",
      dejaNote: "Vous avez déjà donné votre avis sur cette garde.",
    },

    /** @relecture Surya — un envoi refusé. */
    erreurs: {
      incomplet: "Choisissez de 1 à 5 étoiles pour chacun des quatre critères.",
      generique: "Votre avis n'a pas pu être enregistré. Réessayez dans un instant.",
    },

    /** La note et le nombre de gardes (D-119), partout où ils s'affichent. */
    note: {
      /** @relecture Surya — nom accessible de la note, avec sa valeur. */
      accessible: "Note {note} sur 5",
      /** @relecture Surya — aucune note publiée : jamais un zéro. */
      aucune: "Pas encore de note",
      /** @relecture Surya — le nombre de gardes faites avec Berceo, au singulier. */
      garde: "1 garde avec Berceo",
      /** @relecture Surya — le nombre de gardes, au pluriel. */
      gardes: "{n} gardes avec Berceo",
      /** @relecture Surya — la note de la famille sur la carte d'une demande (D-118). */
      famille: "La famille",
      /** @relecture Surya — sa propre note, sur l'accueil de son espace (D-121). */
      vous: "Votre note",
      /** @relecture Surya — ce que la note mesure, sous sa propre note. */
      explication:
        "La moyenne des étoiles reçues après vos gardes, une fois que les deux côtés ont donné leur avis ou 14 jours après la garde.",
    },
  },
});
