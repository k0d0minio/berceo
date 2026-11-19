import { catalogue } from "./locale";

/**
 * `/qui-sommes-nous` — the founders' story, written by Alix and Jordane and
 * delivered in feedback round 2 (`Retour 2 JAMIE.pdf`, JAM-301), which
 * replaces the text of round 1. Verbatim, with its headings: seven sections
 * under the H1, the values as four named items. The apostrophes are straight,
 * as everywhere in the catalogue.
 *
 * « Deux sages-femmes diplômées » names the two founders, not every
 * professional, so D-7 does not hold here: the client's text wins (Jamie,
 * 2026-11-18; JAM-301, question 1).
 */
export const quiSommesNous = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de la page qui porte le récit. */
      title: "Qui sommes-nous | Deux sages-femmes à l'origine de Berceo",
      /** @relecture Surya — idem. */
      description:
        "Deux sages-femmes racontent pourquoi elles ont créé Berceo : que les jeunes parents ne soient plus seuls la nuit et puissent souffler, sans jugement.",
    },

    title: "Qui sommes-nous ?",
    sections: [
      {
        title: "Deux sages-femmes, une conviction commune",
        paragraphs: [
          "Nous sommes deux sages-femmes diplômées, à l'origine de Berceo. Notre projet est né d'un constat qui nous a profondément marquées : les jeunes parents peuvent être bien entourés le jour et se retrouver seuls lorsque la nuit tombe.",
          "Nous avons voulu donner une place à ce besoin de soutien nocturne, avec une conviction qui guide notre démarche : prendre soin des bébés, c'est aussi prendre soin de leurs parents.",
        ],
        values: [],
      },
      {
        title: "L'origine de Berceo : penser aussi aux nuits",
        paragraphs: [
          "Après une naissance, un nouveau quotidien se dessine. Le retour à la maison marque le début d'une rencontre, d'un apprentissage et d'une organisation à construire.",
          "Le suivi post-partum et les consultations apportent des repères précieux. Pourtant, une fois la nuit venue, les parents doivent souvent faire face seuls aux réveils, aux pleurs, aux tétées et aux biberons, tandis que la fatigue s'accumule.",
          "La nuit occupe une place considérable dans les premiers mois avec un bébé. Elle peut aussi rendre les inquiétudes plus présentes et les difficultés plus lourdes à vivre. Même lorsqu'un entourage est disponible, il n'est pas toujours possible de lui demander de prendre le relais.",
          "Berceo est né de cette envie : faciliter l'accès à un soutien pendant ces heures où les parents en ressentent le besoin.",
        ],
        values: [],
      },
      {
        title: "Notre mission : rendre le relais plus accessible",
        paragraphs: [
          "Berceo est une plateforme de mise en relation entre les familles et les professionnelles de la périnatalité pour des gardes de nuit à domicile.",
          "Notre mission est de faciliter leur rencontre, afin que les parents puissent trouver un accompagnement adapté à leur situation, qu'ils recherchent un relais ponctuel ou une présence régulière.",
          "Nous souhaitons leur permettre d'exprimer leurs besoins, de découvrir les profils des professionnelles et d'échanger avec elles pour choisir la personne à qui ils souhaitent confier ce relais.",
        ],
        values: [],
      },
      {
        title: "Notre vision de l'accompagnement de nuit",
        paragraphs: [
          "Accueillir une professionnelle chez soi et lui confier son bébé est une démarche personnelle, qui demande de la confiance.",
          "Pour nous, un accompagnement de nuit repose sur l'attention portée au bébé, mais aussi sur l'écoute de ses parents. Il se prépare par un échange sur les habitudes de la famille, les besoins de l'enfant et les attentes de chacun.",
          "Selon ses qualifications et dans les limites de ses compétences, la professionnelle accompagne le bébé pendant la nuit et apporte aux parents une présence rassurante.",
          "L'objectif est de leur offrir un temps pour se reposer, tout en respectant leur place et leurs choix.",
        ],
        values: [],
      },
      {
        title: "Nos valeurs",
        paragraphs: [],
        values: [
          {
            name: "La bienveillance, sans jugement.",
            text: "Chaque parent vit les premières semaines et les premiers mois à sa manière. Nous souhaitons accueillir les besoins de chaque famille avec respect, sans minimiser sa fatigue ni lui demander de justifier son besoin d'aide.",
          },
          {
            name: "La confiance, construite dans l'échange.",
            text: "La confiance se nourrit d'informations claires et d'un dialogue ouvert. Nous accordons une place essentielle à la présentation des profils, à la compréhension du rôle de chacune et aux échanges qui précèdent une garde.",
          },
          {
            name: "Le respect de chaque famille.",
            text: "Les habitudes, les choix et les attentes diffèrent d'un foyer à l'autre. Nous défendons un accompagnement qui se construit avec les parents, en tenant compte du rythme de leur bébé et de leur réalité quotidienne.",
          },
          {
            name: "La reconnaissance des compétences.",
            text: "Les professionnelles de la périnatalité possèdent des qualifications et des expériences différentes, qu'il est essentiel de rendre lisibles. Nous souhaitons valoriser leurs compétences et permettre aux familles de comprendre l'accompagnement que chacune peut proposer.",
          },
        ],
      },
      {
        title: "Notre engagement : vous aider à demander du soutien",
        paragraphs: [
          "Demander de l'aide reste parfois difficile. On peut hésiter, penser que l'on devrait réussir seul ou attendre que la fatigue devienne trop importante.",
          "Nous souhaitons contribuer à changer ce regard.",
          "Avoir besoin de dormir est légitime. Souhaiter passer le relais quelques heures l'est tout autant. Accepter du soutien peut permettre de préserver son énergie et de vivre plus sereinement son quotidien avec son enfant.",
          "Vous n'avez pas besoin d'être à bout pour avoir le droit de souffler.",
        ],
        values: [],
      },
      {
        title: "Et si nous préparions vos prochaines nuits ?",
        paragraphs: [
          "Avec Berceo, nous voulons faire une place au repos des parents dans l'accompagnement après la naissance.",
          "Découvrez les professionnelles présentes sur la plateforme et échangez avec elles pour trouver le relais qui correspond à votre famille.",
          "Parce que les parents aussi méritent que l'on prenne soin d'eux.",
        ],
        values: [],
      },
    ],
  },
});
