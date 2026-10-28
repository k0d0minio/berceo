import { catalogue } from "./locale";

/**
 * `/qui-sommes-nous` — the founders' story, written by Alix and Jordane in the
 * first person and delivered in feedback round 1 (Drive,
 * `feedback-round-1.pdf`, « Qui sommes-nous texte »; D-23). Verbatim but for
 * the guide's punctuation: two lines are tagged where it changed. The
 * apostrophes are straight, as everywhere in the catalogue.
 *
 * Verbatim from the guide: the closing sentence.
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
    paragraphs: [
      /** @relecture Surya — ponctuation du guide : « entourés… jusqu'à » devient « entourés, jusqu'à ». */
      "Nous sommes deux sages-femmes diplômées, et Berceo est né d'un constat qui nous a profondément marquées : les jeunes parents sont souvent très bien entourés, jusqu'à la tombée de la nuit.",
      "Après la naissance, tout s'accélère. On rentre à la maison avec son bébé, parfois après quelques jours seulement. Le suivi post-partum existe, les consultations aussi, mais lorsqu'arrive la nuit, les parents se retrouvent souvent seuls face aux réveils, aux pleurs, aux tétées, aux biberons et à une fatigue qui s'accumule.",
      "La nuit est pourtant une part immense de l'expérience des premiers mois.",
      "C'est aussi la nuit que les doutes prennent plus de place. Que l'on se demande si l'on fait bien. Que l'épuisement devient difficile à supporter. Que l'on peut se sentir seul, dépassé, ou simplement avoir besoin que quelqu'un prenne le relais quelques heures.",
      "Et pourtant, demander de l'aide reste parfois difficile.",
      "Parce qu'on nous répète qu'il faut « profiter », qu'un bébé « ça se gère », que les nuits difficiles sont normales. Certains parents culpabilisent à l'idée de ne pas réussir seuls, comme si demander du soutien signifiait ne pas être à la hauteur.",
      "Nous pensons exactement l'inverse.",
      "Demander du relais ne fait pas de vous de moins bons parents. Avoir besoin de dormir ne fait pas de vous de moins bons parents. Et accepter de l'aide ne signifie pas que vous aimez moins votre bébé.",
      "Au contraire : prendre soin de soi, c'est aussi prendre soin de son enfant.",
      "C'est de cette conviction qu'est née Berceo.",
      "Nous avons voulu créer une solution qui réponde à un besoin encore trop peu accompagné : permettre aux parents de ne plus être seuls la nuit, en leur donnant accès à des personnes formées, expérimentées et dignes de confiance pour prendre le relais auprès de leur bébé.",
      "Parce qu'une garde de nuit, ce n'est pas simplement « garder un bébé ».",
      "C'est savoir comprendre ses besoins, respecter son rythme et les habitudes de sa famille, accompagner ses réveils, rassurer ses parents et leur permettre de retrouver quelques heures de sommeil avec la sérénité de savoir leur enfant entre de bonnes mains.",
      "Berceo, c'est donc bien plus qu'un service de garde.",
      "C'est un espace où les parents peuvent souffler, sans jugement et sans culpabilité.",
      /** @relecture Surya — ponctuation du guide : « à porter — et que » devient « à porter, et que ». */
      "Un accompagnement fondé sur la compétence, la confiance et la douceur, pour que les nuits avec bébé soient un peu moins lourdes à porter, et que les parents puissent, eux aussi, être entourés et prendre soin d'eux.",
    ],
    closing: "Vous aussi, faites confiance à Berceo.",
  },
});
