import { catalogue } from "./locale";

/**
 * Transactional e-mails. The guide ("Les e-mails") sets the shape: a clear
 * subject, "Bonjour [Prénom],", two to four sentences, one action, signed
 * "L'équipe Berceo" and never "Cordialement". Entries without a tag are the
 * guide's, verbatim; `@relecture` entries are ours and wait for Surya.
 * Never a word about insurance (D-8). `{prenom}` is filled with `fill()`.
 */
export const emails = catalogue({
  fr: {
    layout: {
      salutation: "Bonjour {prenom},",
      /** @relecture Surya — salutation quand le prénom n'est pas encore connu. */
      salutationSansPrenom: "Bonjour,",
      signature: "L'équipe Berceo",
      /** @relecture Surya — repli sous le bouton. */
      lienTexte: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      /** @relecture Surya — pied de l'e-mail. */
      pied: "Vous recevez cet e-mail parce qu'un compte Berceo est associé à cette adresse.",
    },

    bienvenueFamille: {
      objet: "Bienvenue sur Berceo, {prenom} 🤍",
      corps:
        "Votre compte est créé. Vous pouvez désormais accéder aux profils de nos professionnelles et publier votre première demande de garde. Prenez le temps de vous reposer, c'est pour ça qu'on est là.",
      cta: "Publier ma première demande",
    },

    /** La validation du profil professionnel (le guide, verbatim, D-8 : aucune mention d'assurance). */
    profilValide: {
      objet: "Votre profil Berceo est activé",
      corps:
        "Votre dossier a été vérifié. Votre profil est maintenant visible et vous pouvez accéder aux demandes de garde dans votre zone. Bienvenue dans le réseau.",
      cta: "Voir les demandes disponibles",
    },

    /**
     * La demande de complément. Le corps est celui du guide, sans l'adresse de
     * contact que Berceo n'a pas encore (D-51). {motif} est le motif des fondatrices.
     */
    complementDemande: {
      /** @relecture Surya — objet de l'e-mail de demande de complément. */
      objet: "Votre dossier Berceo : un complément est nécessaire",
      corps:
        "Nous avons bien reçu votre dossier. Pour finaliser votre inscription, nous avons besoin d'un complément : {motif}.",
      /** @relecture Surya — la dernière phrase du guide, sans « à l'adresse [email] ou » (D-51). */
      suite: "Merci de nous transmettre ce document via votre espace personnel.",
      /** @relecture Surya — bouton vers le dossier. */
      cta: "Compléter mon dossier",
    },

    /** Le refus. Le corps est celui du guide, sans la phrase de contact (D-51). */
    profilRefuse: {
      /** @relecture Surya — objet de l'e-mail de refus. */
      objet: "Votre dossier Berceo",
      corps:
        "Nous avons examiné votre dossier avec attention. Malheureusement, nous ne sommes pas en mesure d'activer votre profil pour la raison suivante : {motif}.",
      /** @relecture Surya — bouton vers l'espace. */
      cta: "Voir mon espace",
    },

    demandeUrgente: {
      /** @relecture Surya — objet de l'e-mail d'une demande urgente, envoyé tout de suite (D-61). */
      objet: "Demande urgente à {commune} pour le {date}",
      /** @relecture Surya — corps : la nuit et les enfants. */
      corps: "Une famille de {commune} cherche une professionnelle pour la nuit du {nuit}. {enfants}.",
      /** @relecture Surya — l'invitation à répondre vite. */
      appel: "Si vous êtes disponible, consultez la demande dès que possible.",
      cta: "Voir les demandes disponibles",
    },

    resumeDemandes: {
      /** @relecture Surya — objet du résumé quotidien, une seule demande (D-61). */
      objetUne: "Une nouvelle demande de garde dans votre zone",
      /** @relecture Surya — objet du résumé quotidien, plusieurs demandes. */
      objet: "{n} nouvelles demandes de garde dans votre zone",
      /** @relecture Surya — introduction, une seule demande. */
      introUne: "Une nouvelle demande a été publiée dans les communes où vous intervenez.",
      /** @relecture Surya — introduction, plusieurs demandes. */
      intro: "{n} nouvelles demandes ont été publiées dans les communes où vous intervenez.",
      /** @relecture Surya — une ligne par demande. */
      ligne: "{commune}, nuit du {nuit}. {enfants}.",
      cta: "Voir les demandes disponibles",
    },

    /**
     * Nouvelle candidature (famille), le guide verbatim, un point ajouté à la fin
     * du corps. {profession} est écrite en minuscules au milieu de la phrase.
     */
    nouvelleReponse: {
      objet: "{prenom} a répondu à votre demande",
      corps: "{prenom}, {profession}, a postulé pour votre garde du {date}. Consultez son profil et confirmez votre choix.",
      cta: "Voir le profil de {prenom}",
    },

    /** Confirmation de réservation (famille), le guide sans sa phrase sur l'assurance (D-8, D-78). */
    reservationFamille: {
      objet: "Votre garde du {date} est confirmée ✓",
      corps: "Tout est prêt. {prenom} sera chez vous le {date} à partir de {heure}. L'adresse lui a été transmise.",
      cta: "Voir les détails de ma réservation",
    },

    /** Confirmation de réservation (professionnelle), le guide ; « Bonne nuit ! » perd son point d'exclamation (D-78). */
    reservationProfessionnelle: {
      objet: "Garde confirmée : {date} chez {prenomFamille}",
      /** @relecture Surya — « Bonne nuit. » au lieu de « Bonne nuit ! » (D-78). */
      corps:
        "Votre garde du {date} est confirmée. L'adresse et les coordonnées de la famille vous ont été transmises. Bonne nuit.",
      cta: "Voir les détails de la garde",
    },

    /** Une réponse déclinée : une autre professionnelle choisie, la demande republiée ou annulée (D-70, D-76). */
    nonRetenue: {
      /** @relecture Surya — objet. */
      objet: "Votre disponibilité pour la garde du {date}",
      /** @relecture Surya — corps : la famille a fait un autre choix ou la demande est close. */
      corps:
        "La famille de {commune} a fait un autre choix pour la nuit du {nuit}, ou sa demande n'est plus ouverte. Merci pour votre disponibilité.",
      /** @relecture Surya — la suite. */
      suite: "D'autres demandes vous attendent peut-être dans votre zone.",
      cta: "Voir les demandes disponibles",
    },

    /** Une demande envoyée en priorité à une professionnelle (D-71). Aucun nom de famille. */
    prioritaire: {
      /** @relecture Surya — objet. */
      objet: "Une famille vous envoie sa demande en priorité",
      /** @relecture Surya — corps : la nuit et les enfants. */
      corps: "Une famille de {commune} vous a choisie pour la nuit du {nuit}. {enfants}.",
      /** @relecture Surya — la demande reste visible des autres (le guide, « La mise en relation »). */
      suite:
        "Sa demande reste visible des autres professionnelles de sa zone jusqu'à ce qu'elle confirme une réservation.",
      /** @relecture Surya — bouton vers la liste. */
      cta: "Voir la demande",
    },

    /** Un nouveau message dans la conversation (messagerie, D-90) : un avis, jamais le texte du message. */
    nouveauMessage: {
      /** @relecture Surya — objet, avec le prénom de qui a écrit. */
      objet: "{prenom} vous a écrit",
      /** @relecture Surya — corps : qui, et pour quelle garde. */
      corps: "{prenom} vous a écrit au sujet de la garde du {date}. Vous pouvez lui répondre sur Berceo.",
      /** @relecture Surya — bouton vers la conversation. */
      cta: "Lire le message",
    },

    verification: {
      /** @relecture Surya — objet de l'e-mail de vérification. */
      objet: "Confirmez votre adresse e-mail",
      /** @relecture Surya — corps de l'e-mail de vérification. */
      corps:
        "Votre compte Berceo est presque prêt. Confirmez votre adresse e-mail pour activer votre accès.",
      /** @relecture Surya — bouton de l'e-mail de vérification. */
      cta: "Confirmer mon adresse",
      /** @relecture Surya — mention pour qui n'a rien demandé. */
      ignorer: "Si vous n'avez pas créé de compte sur Berceo, ignorez simplement cet e-mail.",
    },

    reinitialisation: {
      /** @relecture Surya — objet de l'e-mail de réinitialisation. */
      objet: "Choisissez un nouveau mot de passe",
      /** @relecture Surya — corps de l'e-mail de réinitialisation. */
      corps:
        "Vous avez demandé à changer votre mot de passe. Ce lien vous permet d'en choisir un nouveau.",
      /** @relecture Surya — bouton de l'e-mail de réinitialisation. */
      cta: "Choisir un nouveau mot de passe",
      /** @relecture Surya — mention pour qui n'a rien demandé. */
      ignorer:
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.",
    },
  },
});
