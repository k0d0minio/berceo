import { catalogue } from "./locale";

/**
 * The search a family runs in her space and the two public pages it feeds: a
 * professional's teaser page and a commune's page (D-11, D-14). Entries without
 * a tag are Surya's guide verbatim (« La recherche », the SEO chapter's title
 * and meta patterns, the profile's « Quelques mots sur moi »); every
 * `@relecture` entry is ours, written in the guide's rules (vouvoiement, no
 * exclamation mark, no em dash, no ellipsis but the guide's own placeholder)
 * and waiting for Surya. No price, no insurance wording (D-8), no blanket
 * « diplômées » (D-7). `{name}` slots are filled with `fill()` from ./locale.
 */
export const recherche = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — onglet de la page de recherche. */
      recherche: "Trouver une professionnelle",
      /** The guide's pattern for a professional's page (SEO, « Fiche professionnelle »). */
      ficheTitre: "{prenom}, {profession} disponible pour gardes de nuit | Berceo",
      ficheDescription:
        "{prenom} est {profession}, disponible pour des gardes de nuit à domicile dans la zone {zone}. Profil vérifié par Berceo.",
      /** @relecture Surya — la zone du meta quand elle se déplace dans plusieurs communes. */
      zoneEtEnvirons: "{commune} et environs",
      /** @relecture Surya — la zone du meta quand aucune commune n'est déclarée. */
      zoneBelgique: "Belgique",
      /** @relecture Surya — titre d'une page commune, sur le mot-clé longue traîne du guide. */
      communeTitre: "Garde de nuit à domicile à {commune} | Berceo",
      /** @relecture Surya — meta d'une page commune. */
      communeDescription:
        "Sage-femme disponible pour une garde de nuit à {commune} : trouvez une professionnelle de santé vérifiée par Berceo pour les nuits avec votre nourrisson.",
    },

    /** Navigation of the family's space (D-25: the label, not the storytelling). */
    nav: "Trouver une professionnelle",

    recherche: {
      /** @relecture Surya — titre de la page. */
      titre: "Trouver une professionnelle",
      label: "Votre commune ou code postal",
      /** The guide's placeholder, its three dots included: the one ellipsis this catalogue keeps. */
      placeholder: "Ex : Ixelles, Waterloo, 1000...",
      bouton: "Rechercher",
      /** @relecture Surya — aide sous le champ. */
      aide: "Tapez le nom de votre commune ou son code postal, puis choisissez-la dans la liste.",
      /** @relecture Surya — nom accessible de la liste de suggestions. */
      suggestions: "Communes proposées",
      /** @relecture Surya — aucune suggestion pour ce qui est tapé. */
      aucuneSuggestion: "Aucune commune ne correspond à votre saisie.",
      /** @relecture Surya — la saisie ne désigne aucune commune. */
      inconnue: "Nous ne trouvons pas cette commune. Choisissez-la dans la liste.",
      /** @relecture Surya — au-dessus des résultats. */
      resultatsPour: "Professionnelles pour {communes}",
      /** @relecture Surya — nombre de résultats. */
      uneProfessionnelle: "1 professionnelle",
      /** @relecture Surya — nombre de résultats. */
      professionnelles: "{n} professionnelles",
    },

    /**
     * No professional in the zone (D-124): the guide's message without its
     * clause on neighbouring zones, which the platform does not do.
     * @relecture Surya
     */
    aucune: {
      texte:
        "Aucune professionnelle n'est disponible dans cette zone pour le moment. Publiez quand même votre demande, elle sera visible dès qu'une professionnelle couvrira votre commune.",
      /** @relecture Surya — le même message sur une page commune, pour une visiteuse sans compte. */
      texteCommune:
        "Aucune professionnelle n'est encore inscrite dans cette commune. Créez votre compte famille et publiez votre demande, elle sera visible dès qu'une professionnelle couvrira votre commune.",
      /** @relecture Surya — bouton, dans l'espace famille. */
      publier: "Publier une demande",
    },

    carte: {
      verifie: "Profil vérifié par Berceo",
      /** @relecture Surya — nom accessible d'une carte, qui mène au profil. */
      voirProfil: "Voir le profil de {prenom}",
      /** @relecture Surya — la zone sur une carte. */
      zone: "Se déplace à {communes}",
      /** @relecture Surya — la zone quand elle compte plus de trois communes. */
      zoneEtAutres: "Se déplace à {communes} et {n} autres communes",
      /** @relecture Surya — la zone quand elle compte exactement une commune de plus. */
      zoneEtUneAutre: "Se déplace à {communes} et 1 autre commune",
      /** @relecture Surya — titre court de « Prochaines disponibilités » sur une carte. */
      prochaines: "Prochaines disponibilités",
      /** @relecture Surya — aucune nuit indiquée, sans dire qu'elle est indisponible (D-80). */
      aucuneNuit: "Aucune nuit indiquée pour le moment",
    },

    fiche: {
      /** @relecture Surya — l'intitulé de la zone sur la page publique. */
      zone: "Communes où elle intervient",
      bio: "Quelques mots sur moi",
      /** @relecture Surya — l'appel à créer un compte (D-3, D-14). */
      ctaTitre: "Son profil complet vous attend",
      /** @relecture Surya — le texte de l'appel. */
      ctaTexte:
        "Avec un compte famille gratuit, vous voyez son profil complet et ses prochaines disponibilités, et vous pouvez lui envoyer votre demande en priorité.",
      /** @relecture Surya — le bouton de l'appel. */
      ctaBouton: "Créer mon compte gratuit pour voir son profil complet",
    },

    commune: {
      /** @relecture Surya — le titre de la page. */
      titre: "Garde de nuit à domicile à {commune}",
      /** @relecture Surya — l'introduction de la page. */
      intro:
        "Les premières semaines avec un nourrisson, les nuits sont courtes. Berceo met en relation les familles de {commune} avec des sages-femmes, des puéricultrices et des infirmières en néonatologie qui prennent une garde de nuit à domicile, pour que vous puissiez dormir.",
      /** @relecture Surya — le second paragraphe de l'introduction. */
      verification:
        "Chaque professionnelle est vérifiée à la main par l'équipe Berceo avant que son profil ne soit visible. Vous publiez votre demande, elles vous répondent, vous choisissez.",
      /** @relecture Surya — le titre de la liste. */
      liste: "Les professionnelles qui se déplacent à {commune}",
      /** @relecture Surya — le titre de l'appel final. */
      ctaTitre: "Trouvez votre garde de nuit à {commune}",
      /** @relecture Surya — le texte de l'appel final. */
      ctaTexte:
        "Créez votre compte famille gratuit pour voir les profils complets et publier votre demande.",
      /** @relecture Surya — le bouton de l'appel final et du message sans professionnelle. */
      ctaBouton: "Créer mon compte famille",
      /** @relecture Surya — l'intitulé des liens vers la vitrine. */
      enSavoirPlus: "Pour en savoir plus",
    },
  },
});
