import { catalogue } from "./locale";

/**
 * The professional's indicative availability: « Mes disponibilités » and the
 * « Prochaines disponibilités » block families see. Entries without a tag are
 * Surya's guide verbatim ("Les disponibilités"); every `@relecture` entry is
 * ours, written in the guide's rules (vouvoiement, no exclamation mark, no em
 * dash, no ellipsis) and waiting for Surya. Availability is never a commitment
 * (D-12): no word here promises a night. `{name}` slots are filled with
 * `fill()` from ./locale.
 */
export const disponibilites = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — onglet de la page. */
      titre: "Mes disponibilités",
    },

    professionnelle: {
      titre: "Mes disponibilités",
      instructions:
        "Indiquez les nuits où vous êtes disponible. Ces informations sont indicatives : vous restez libre d'accepter ou de refuser toute demande.",
      boutons: {
        disponible: "Disponible",
        indisponible: "Indisponible",
      },
      aide: "Vos disponibilités ne sont pas contractuelles. Vous pouvez les modifier à tout moment et rester libre de refuser une demande même si vous avez indiqué être disponible.",
      /** @relecture Surya — la page avant la validation du profil (D-21). */
      nonValide:
        "Votre calendrier sera accessible dès que votre profil aura été validé par l'équipe Berceo.",
      /** @relecture Surya — légende du calendrier. */
      legende: "Touchez les nuits à modifier, puis choisissez Disponible ou Indisponible.",
      /** @relecture Surya — nom accessible du calendrier. */
      calendrier: "Vos nuits, de ce soir à huit semaines",
      /** @relecture Surya — titre de l'aperçu du bloc vu par les familles (D-69). */
      apercu: "Ce que voient les familles",
      etats: {
        /** @relecture Surya — nom accessible d'une nuit marquée. */
        disponible: "{nuit}, disponible",
        /** @relecture Surya — nom accessible d'une nuit non marquée. */
        nonIndiquee: "{nuit}, non indiquée",
      },
      messages: {
        /** @relecture Surya — après l'enregistrement. */
        enregistre: "Vos disponibilités ont été enregistrées.",
        /** @relecture Surya — une nuit sortie du calendrier entre l'affichage et l'envoi. */
        horsFenetre:
          "Une des nuits choisies n'est plus dans votre calendrier. Rechargez la page et choisissez à nouveau.",
        /** @relecture Surya — aucune nuit choisie. */
        vide: "Choisissez au moins une nuit.",
        /** @relecture Surya — le profil n'est plus validé. */
        nonValide:
          "Votre profil n'est pas validé : vos disponibilités ne peuvent pas être enregistrées pour le moment.",
        /** @relecture Surya — échec de l'enregistrement. */
        generique: "Vos disponibilités n'ont pas pu être enregistrées. Veuillez réessayer.",
      },
    },

    famille: {
      titre: "Prochaines disponibilités",
      avertissement:
        "Ces disponibilités sont indicatives. La professionnelle confirmera lors de l'acceptation de votre demande.",
      /** @relecture Surya — aucune nuit indiquée ; ne dit jamais qu'elle est indisponible (D-80). */
      vide: "Cette professionnelle n'a pas encore indiqué de disponibilités. Vous pouvez tout de même lui adresser votre demande.",
    },

    nuits: {
      /** @relecture Surya — « Nuit du lundi 12 au mardi 13 octobre ». */
      nuit: "Nuit du {debut} au {fin}",
      /** @relecture Surya — « lundi 12 ». */
      jour: "{jour} {n}",
      /** @relecture Surya — « mardi 13 octobre ». */
      jourMois: "{jour} {n} {mois}",
      /** @relecture Surya — le premier du mois : « jeudi 1er octobre ». */
      premier: "1er",
      /** @relecture Surya — les jours, du lundi au dimanche. */
      jours: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
      /** @relecture Surya — en-têtes des colonnes du calendrier. */
      joursCourts: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
      /** @relecture Surya — les mois. */
      mois: [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ],
      /** @relecture Surya — en-tête d'un mois du calendrier, « Octobre 2026 ». */
      moisAnnee: "{mois} {annee}",
    },
  },
});
