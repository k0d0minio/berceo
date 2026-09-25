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

    demandeUrgente: {
      /** @relecture Surya — objet de l'e-mail d'une demande urgente, envoyé tout de suite (D-51). */
      objet: "Demande urgente à {commune} pour le {date}",
      /** @relecture Surya — corps : la nuit et les enfants. */
      corps: "Une famille de {commune} cherche une professionnelle pour la nuit du {nuit}. {enfants}.",
      /** @relecture Surya — l'invitation à répondre vite. */
      appel: "Si vous êtes disponible, consultez la demande dès que possible.",
      cta: "Voir les demandes disponibles",
    },

    resumeDemandes: {
      /** @relecture Surya — objet du résumé quotidien, une seule demande (D-51). */
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
