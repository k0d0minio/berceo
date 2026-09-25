import { catalogue } from "./locale";

/**
 * The answer and the booking (candidature-et-reservation): the professional's
 * « Je suis disponible », the family's comparison and choice, the full profile
 * she reads, the priority request, republishing, the récapitulatif and both
 * sides' bookings. Entries marked « guide » are Surya's guide verbatim (« La
 * mise en relation », « La réservation »), « DA » the art direction's card;
 * every `@relecture` entry is ours, written in the guide's rules (vouvoiement,
 * no exclamation mark, no em dash, no ellipsis) and waiting for Surya. The only
 * price is the professional's own rate (D-4); never a word about insurance
 * (D-8) or about how the family pays (D-1). `{name}` slots are filled with
 * `fill()` from ./locale.
 */
export const reservations = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — onglet du profil d'une professionnelle. */
      profil: "Profil de la professionnelle",
      /** @relecture Surya — onglet de l'envoi en priorité. */
      priorite: "Envoyer une demande en priorité",
      /** @relecture Surya — onglet des réservations de la famille. */
      reservations: "Mes réservations",
      /** Guide — le titre du récapitulatif. */
      reservation: "Récapitulatif de votre garde",
      /** @relecture Surya — onglet des gardes de la professionnelle. */
      gardes: "Mes gardes",
      /** @relecture Surya — onglet d'une garde de la professionnelle. */
      garde: "Votre garde",
    },

    /** La ligne de prix de la carte, d'après la DA (« 150€ pour la garde de nuit »), l'euro après le nombre. */
    tarif: "{montant} € pour la garde de nuit",

    professionnelle: {
      /** Guide — le bouton pour postuler. */
      disponible: "Je suis disponible pour cette garde",
      /** Guide — le message de confirmation. */
      confirmation:
        "Votre disponibilité a bien été transmise à la famille. Vous serez notifiée dès qu'elle aura fait son choix.",
      /** @relecture Surya — la carte après sa réponse. */
      repondu: "Vous avez répondu",
      /** @relecture Surya — retirer sa réponse (D-73). */
      retirer: "Retirer ma disponibilité",
      /** @relecture Surya — après le retrait. */
      retiree: "Votre disponibilité est retirée.",
      /** @relecture Surya — marque d'une demande envoyée en priorité (D-71). */
      prioritaire: "Demande prioritaire",
      /** @relecture Surya — lien de l'accueil vers ses gardes. */
      lienGardes: "Voir mes gardes",
      erreurs: {
        /** @relecture Surya — profil non validé. */
        nonValide: "Votre profil doit être validé pour répondre à une demande.",
        /** @relecture Surya — demande attribuée ou annulée entre-temps. */
        fermee: "Cette demande n'est plus ouverte.",
        /** @relecture Surya — la nuit a commencé. */
        commencee: "Cette garde a déjà commencé.",
        /** @relecture Surya — commune hors de sa zone. */
        horsZone: "Cette demande ne concerne pas les communes où vous intervenez.",
        /** @relecture Surya — la famille a décliné sa réponse (D-70). */
        declinee: "La famille a fait un autre choix pour cette demande.",
        /** @relecture Surya — déjà une garde cette nuit-là (D-73). */
        dejaReservee: "Vous avez déjà une garde confirmée cette nuit-là.",
        /** @relecture Surya — réponse déjà transmise. */
        dejaRepondu: "Vous avez déjà répondu à cette demande.",
        /** @relecture Surya — demande introuvable. */
        introuvable: "Cette demande n'existe plus.",
        /** @relecture Surya — retrait impossible. */
        retrait: "Votre disponibilité ne peut plus être retirée.",
      },
    },

    famille: {
      /** Guide — le titre de la section. */
      reponsesTitre: "Les professionnelles qui ont répondu à votre demande",
      /** Guide — lien vers le profil. */
      voirProfil: "Voir le profil complet",
      /** Guide — bouton de choix. */
      accepter: "Accepter et réserver",
      /** @relecture Surya — aucune réponse encore. */
      aucuneReponse:
        "Aucune professionnelle n'a encore répondu à votre demande. Vous recevrez un e-mail à chaque réponse.",
      /** @relecture Surya — une réponse, sur la carte de « Mes demandes ». */
      uneReponse: "1 réponse",
      /** @relecture Surya — plusieurs réponses. */
      reponses: "{n} réponses",
      /** @relecture Surya — adresse manquante pour réserver (D-77). */
      adresseRequise:
        "Pour réserver, indiquez d'abord votre adresse dans votre profil. Elle ne sera communiquée qu'à la professionnelle choisie, une fois la réservation confirmée.",
      /** @relecture Surya — lien vers le profil pour l'adresse. */
      completerAdresse: "Compléter mon adresse",
      /** @relecture Surya — modification verrouillée par une réponse (D-76). */
      verrou:
        "Des professionnelles ont répondu à cette demande, elle ne peut donc plus être modifiée. Si aucune réponse ne vous convient, vous pouvez la republier.",
      /** @relecture Surya — lien d'une demande attribuée vers sa réservation. */
      voirReservation: "Voir ma réservation",
      /** @relecture Surya — photo d'une professionnelle. */
      photo: "Photo de {prenom}",
      erreurs: {
        /** @relecture Surya — demande attribuée, annulée ou commencée entre-temps. */
        nonModifiable: "Cette demande ne peut plus être réservée.",
        /** @relecture Surya — réponse retirée entre-temps. */
        indisponible: "Cette professionnelle n'est plus disponible pour cette garde.",
        /** @relecture Surya — deux réservations en même temps. */
        conflit: "Cette garde vient d'être réservée ou n'est plus disponible. Rechargez la page.",
        /** @relecture Surya — réponse introuvable. */
        introuvable: "Cette réponse n'existe plus.",
        /** @relecture Surya — adresse manquante (D-77). */
        adresse:
          "Pour réserver, indiquez d'abord votre adresse dans votre profil. Elle ne sera communiquée qu'à la professionnelle choisie, une fois la réservation confirmée.",
        /** @relecture Surya — republication impossible. */
        republication: "Cette demande ne peut plus être republiée.",
      },
    },

    /** « Accepter et réserver » et la page de réservation. */
    recapitulatif: {
      /** Guide. */
      titre: "Récapitulatif de votre garde",
      /** @relecture Surya — les libellés des éléments que le guide demande d'afficher. */
      libelles: {
        date: "Date",
        heure: "Heure",
        duree: "Durée",
        professionnelle: "Professionnelle",
        profession: "Profession",
        tarif: "Tarif de la garde",
        telephone: "Téléphone",
      },
      /** @relecture Surya — les heures de la garde. */
      heures: "de {debut} à {fin}",
      /** @relecture Surya — la durée standard (le guide : 11 heures). */
      duree: "{n} heures",
      /** @relecture Surya — la famille règle la garde directement, sans dire comment (D-1). */
      paiement: "Vous réglez la garde directement à la professionnelle.",
      /** @relecture Surya — réponse qui renonce (rouge, D-24). */
      renoncer: "Revenir aux réponses",
    },

    profil: {
      /** DA — la mention de la carte profil. */
      verifie: "Profil vérifié par Berceo",
      /** @relecture Surya — ses communes. */
      zone: "Communes où elle intervient",
      /** @relecture Surya — ses spécialisations. */
      specialisations: "Spécialisations",
      /** @relecture Surya — son expérience. */
      experience: "Expérience",
      /** @relecture Surya — sa présentation. */
      bio: "Présentation",
      /** Guide — l'envoi en priorité. */
      priorite: "Lui envoyer ma demande en priorité",
      /** @relecture Surya — retour à la demande. */
      retourDemande: "Retour à ma demande",
    },

    priorite: {
      /** Guide — le message explicatif. */
      message:
        "Votre demande sera envoyée en priorité à {prenom}. Elle restera également visible des autres professionnelles de votre zone jusqu'à confirmation.",
      /** @relecture Surya — choisir une demande existante. */
      choisir: "Choisissez l'une de vos demandes ouvertes",
      /** @relecture Surya — envoyer cette demande. */
      envoyer: "Lui envoyer cette demande",
      /** @relecture Surya — aucune demande à envoyer. */
      aucune: "Vous n'avez pas de demande ouverte à lui envoyer.",
      /** @relecture Surya — publier une nouvelle demande pour elle. */
      nouvelle: "Ou publiez une nouvelle demande pour elle",
      /** @relecture Surya — la note du formulaire publié depuis son profil. */
      note: "Cette demande sera envoyée en priorité à {prenom}.",
      /** @relecture Surya — après l'envoi. */
      envoyee: "Votre demande a été envoyée en priorité à {prenom}.",
      /** @relecture Surya — envoi impossible. */
      erreur: "Cette demande ne peut plus être envoyée en priorité.",
    },

    republication: {
      /** @relecture Surya — bouton (D-70). */
      bouton: "Republier ma demande",
      /** @relecture Surya — titre de la confirmation. */
      titre: "Republier cette demande",
      /** @relecture Surya — conséquence de la republication. */
      description:
        "Les professionnelles qui ont déjà répondu seront prévenues que leur disponibilité n'a pas été retenue. Votre demande sera de nouveau proposée aux autres professionnelles de votre zone.",
      /** @relecture Surya — réponse qui republie (vert, D-24). */
      oui: "Oui, republier",
      /** @relecture Surya — réponse qui garde les réponses (rouge, D-24). */
      non: "Non, garder les réponses",
      /** @relecture Surya — après la republication. */
      faite: "Votre demande est republiée. Les réponses précédentes ont été déclinées.",
    },

    reservationsFamille: {
      /** @relecture Surya — titre. */
      titre: "Mes réservations",
      /** @relecture Surya — introduction. */
      intro: "Vos gardes confirmées, et les professionnelles que vous avez déjà réservées.",
      /** @relecture Surya — aucune réservation. */
      vide: "Vous n'avez pas encore de réservation.",
      /** @relecture Surya — gardes à venir. */
      aVenir: "À venir",
      /** @relecture Surya — gardes passées. */
      passees: "Passées",
      /** @relecture Surya — lien vers le récapitulatif. */
      voir: "Voir le récapitulatif",
      /** @relecture Surya — recontacter une professionnelle déjà réservée. */
      recontacter: "Lui envoyer une nouvelle demande en priorité",
      /** @relecture Surya — après la réservation. */
      confirmee: "Votre garde est confirmée. {prenom} a reçu votre adresse.",
      /** @relecture Surya — retour à la liste. */
      retour: "Retour à mes réservations",
    },

    gardes: {
      /** @relecture Surya — titre. */
      titre: "Mes gardes",
      /** @relecture Surya — introduction. */
      intro: "Vos gardes confirmées. L'adresse de la famille figure sur chaque garde.",
      /** @relecture Surya — aucune garde. */
      vide: "Vous n'avez pas encore de garde confirmée.",
      /** @relecture Surya — gardes à venir. */
      aVenir: "À venir",
      /** @relecture Surya — gardes passées. */
      passees: "Passées",
      /** @relecture Surya — lien vers une garde. */
      voir: "Voir la garde",
      /** @relecture Surya — la famille. */
      famille: "La famille",
      /** @relecture Surya — son nom. */
      nom: "Nom",
      /** @relecture Surya — l'adresse. */
      adresse: "Adresse",
      /** @relecture Surya — boîte. */
      boite: "boîte {boite}",
      /** @relecture Surya — téléphone absent. */
      nonRenseigne: "Non renseigné",
      /** @relecture Surya — retour à la liste. */
      retour: "Retour à mes gardes",
    },
  },
});
