import { catalogue } from "./locale";

/**
 * Accounts: sign-up, sign-in, the password reset, e-mail verification and the
 * three spaces. Surya's guide, "Les comptes", gives the entries without a tag
 * verbatim; an entry tagged `@relecture` is ours, written in the guide's rules
 * (vouvoiement, no exclamation mark, no em dash, no ellipsis), and waits for
 * Surya. `{prenom}` is filled with `fill()` from ./locale.
 */
export const comptes = catalogue({
  fr: {
    meta: {
      inscriptionFamille: {
        /** @relecture Surya — titre de page, mot-clé du guide « inscription plateforme garde bébé nuit ». */
        title: "Inscription famille : garde de nuit pour votre bébé",
        /** @relecture Surya — description de page. */
        description:
          "Créez votre compte famille en 3 minutes et accédez aux profils des professionnelles de santé disponibles pour des gardes de nuit à domicile.",
      },
      inscriptionProfessionnelle: {
        /** @relecture Surya — titre de page, mot-clé du guide « proposer gardes de nuit nourrisson ». */
        title: "Inscription professionnelle : proposer des gardes de nuit",
        /** @relecture Surya — description de page. */
        description:
          "Sage-femme, infirmière ou puéricultrice : créez votre compte Berceo et proposez des gardes de nuit auprès des jeunes familles.",
      },
      /** @relecture Surya — titre de page. */
      connexion: "Connexion",
      /** @relecture Surya — titre de page. */
      motDePasseOublie: "Mot de passe oublié",
      /** @relecture Surya — titre de page. */
      nouveauMotDePasse: "Nouveau mot de passe",
      /** @relecture Surya — titre de page. */
      verification: "Vérifiez votre boîte e-mail",
      /** @relecture Surya — titre de page. */
      espace: "Mon espace",
    },

    champs: {
      prenom: "Prénom",
      nom: "Nom",
      email: "Adresse e-mail",
      telephone: "Numéro de téléphone",
      motDePasse: "Mot de passe",
      confirmation: "Confirmer le mot de passe",
      /** @relecture Surya — libellé du champ sur la page du nouveau mot de passe. */
      nouveauMotDePasse: "Nouveau mot de passe",
    },

    aides: {
      email:
        "Utilisé uniquement pour vous envoyer les confirmations et notifications importantes. Jamais de spam.",
      /**
       * @relecture Surya — la phrase du guide sans « Votre numéro sera vérifié par SMS » :
       * le numéro n'est pas vérifié en V1 (D-27).
       */
      telephone: "Il ne sera jamais partagé avec des tiers.",
      /** @relecture Surya — règle du mot de passe, sous le champ. */
      motDePasse: "8 caractères au minimum.",
    },

    inscription: {
      message:
        "L'inscription prend 3 minutes. Votre première nuit de repos est plus proche que vous ne le pensez.",
      famille: {
        /** @relecture Surya — titre de la page d'inscription famille. */
        title: "Créez votre compte famille",
        accroche:
          "Accédez aux profils des professionnelles de santé disponibles pour des gardes de nuit à domicile.",
      },
      professionnelle: {
        /** Le titre de l'étape 1 du guide. */
        title: "Créez votre compte",
        /** @relecture Surya — repère de progression avant l'onboarding (D-21). */
        etape: "Étape 1 sur 4",
        /** @relecture Surya — accroche de l'inscription professionnelle. */
        accroche:
          "Rejoignez les professionnelles de santé qui veillent sur les nuits des jeunes familles. Vous compléterez votre profil juste après.",
      },
      /** @relecture Surya — case de consentement, découpée autour des deux liens. */
      consentement: {
        avant: "J'accepte les ",
        cgu: "conditions générales",
        entre: " et la ",
        confidentialite: "politique de confidentialité",
        apres: " de Berceo.",
      },
      bouton: "Créer mon compte",
      /** @relecture Surya — état du bouton pendant l'envoi. */
      enCours: "Création de votre compte",
      succes:
        "Votre compte est créé. Vérifiez votre boîte e-mail pour activer votre accès.",
      /** @relecture Surya — lien vers la connexion sous le formulaire. */
      dejaInscrit: "Vous avez déjà un compte ?",
      /** @relecture Surya — lien vers la connexion. */
      seConnecter: "Se connecter",
    },

    connexion: {
      /** @relecture Surya — titre du formulaire de connexion. */
      title: "Connexion",
      /** @relecture Surya — bouton du formulaire de connexion. */
      bouton: "Se connecter",
      /** @relecture Surya — état du bouton pendant l'envoi. */
      enCours: "Connexion en cours",
      oublie: "Mot de passe oublié ?",
      /** @relecture Surya — invitation à s'inscrire sous le formulaire. */
      pasDeCompte: "Pas encore de compte ?",
      /** @relecture Surya — bouton pour renvoyer le lien de vérification. */
      renvoyer: "Renvoyer le lien",
      /** @relecture Surya — confirmation neutre après le renvoi du lien. */
      renvoye:
        "Si votre adresse doit encore être confirmée, un nouveau lien vous attend dans votre boîte e-mail.",
      /** @relecture Surya — message quand le lien de vérification a déjà servi. */
      dejaVerifie:
        "Votre adresse e-mail est confirmée. Connectez-vous pour accéder à votre espace.",
      /** @relecture Surya — message après le changement du mot de passe. */
      motDePasseChange:
        "Votre mot de passe est modifié. Connectez-vous avec le nouveau.",
    },

    motDePasseOublie: {
      /** @relecture Surya — titre de la page. */
      title: "Mot de passe oublié",
      instruction:
        "Saisissez votre adresse e-mail. Nous vous enverrons un lien pour choisir un nouveau mot de passe.",
      /** @relecture Surya — bouton d'envoi. */
      bouton: "Recevoir le lien",
      /** @relecture Surya — état du bouton pendant l'envoi. */
      enCours: "Envoi en cours",
      confirmation:
        "Si un compte existe avec cette adresse, vous recevrez un e-mail dans quelques minutes.",
      /** @relecture Surya — lien de retour. */
      retour: "Retour à la connexion",
    },

    nouveauMotDePasse: {
      /** @relecture Surya — titre de la page. */
      title: "Choisissez un nouveau mot de passe",
      /** @relecture Surya — bouton d'enregistrement. */
      bouton: "Enregistrer le mot de passe",
      /** @relecture Surya — état du bouton pendant l'envoi. */
      enCours: "Enregistrement en cours",
    },

    verification: {
      /** @relecture Surya — titre de la page après l'inscription. */
      title: "Vérifiez votre boîte e-mail",
      texte:
        "Votre compte est créé. Vérifiez votre boîte e-mail pour activer votre accès.",
      /** @relecture Surya — aide si l'e-mail n'arrive pas. */
      aide: "Vous ne le trouvez pas ? Pensez à regarder dans vos courriers indésirables.",
    },

    erreurs: {
      /** @relecture Surya — champ vide. */
      requis: "Ce champ est obligatoire.",
      /** @relecture Surya — adresse e-mail mal formée. */
      email: "Saisissez une adresse e-mail valide, par exemple nom@exemple.be.",
      /** @relecture Surya — numéro de téléphone mal formé. */
      telephone:
        "Saisissez un numéro de téléphone valide, par exemple 0470 12 34 56.",
      /** @relecture Surya — mot de passe trop court. */
      motDePasseCourt: "Le mot de passe doit contenir au moins 8 caractères.",
      /** @relecture Surya — mot de passe trop long. */
      motDePasseLong: "Le mot de passe ne peut pas dépasser 128 caractères.",
      /** @relecture Surya — confirmation différente. */
      confirmation: "Les deux mots de passe ne correspondent pas.",
      /** @relecture Surya — case de consentement non cochée. */
      consentement:
        "Pour créer votre compte, acceptez les conditions générales et la politique de confidentialité.",
      identifiants:
        "L'adresse e-mail ou le mot de passe est incorrect. Vérifiez vos informations et réessayez.",
      /** @relecture Surya — connexion avec une adresse pas encore confirmée. */
      nonVerifie:
        "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien que nous vous avons envoyé pour activer votre accès.",
      /** @relecture Surya — lien de vérification ou de réinitialisation expiré ou déjà utilisé. */
      lienInvalide: "Ce lien n'est plus valide. Demandez-en un nouveau.",
      /** @relecture Surya — compte sans espace (incident technique). */
      compteIndisponible:
        "Nous ne parvenons pas à ouvrir votre espace pour le moment. Réessayez un peu plus tard.",
      /** @relecture Surya — erreur technique générique. */
      generique: "Une erreur est survenue. Réessayez dans quelques instants.",
    },

    espaces: {
      /** @relecture Surya — salutation en tête de chaque espace. */
      salutation: "Bonjour {prenom}",
      /** @relecture Surya — entrée de navigation de l'espace. */
      navAccueil: "Mon espace",
      /** @relecture Surya — entrée de navigation vers le profil de la famille. */
      navProfil: "Mon profil",
      /** @relecture Surya — entrée de navigation vers les demandes de la famille. */
      navDemandesFamille: "Mes demandes",
      /** @relecture Surya — entrée de navigation vers les demandes de la zone de la professionnelle. */
      navDemandesProfessionnelle: "Demandes",
      professionnelle: {
        enAttente:
          "Votre compte est en attente de validation. Nous vous contacterons dès que votre profil sera activé.",
      },
      admin: {
        title: "Vue d'ensemble",
      },
    },
  },
});
