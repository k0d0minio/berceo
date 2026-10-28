import { catalogue } from "./locale";

/**
 * « Charte des professionnelles Berceo », written by the founders and delivered
 * in feedback round 1 (Drive, `feedback-round-1.pdf`, onboarding-retour-1).
 * Verbatim, sections and lists as in the document. The apostrophes are
 * straight, as everywhere in the catalogue. A professional accepts it at step
 * 4 with the `charte` declaration. `/charte-des-professionnelles` shows it too.
 *
 * @relecture Surya — texte des fondatrices.
 */
export const charte = catalogue({
  fr: {
    meta: {
      /** @relecture Surya — titre de la page publique de la charte. */
      title: "Charte des professionnelles Berceo | Gardes de nuit",
      /** @relecture Surya — idem. */
      description:
        "Les engagements que chaque professionnelle Berceo accepte avant sa première garde de nuit : bienveillance, sécurité de l'enfant, confidentialité et respect.",
    },

    title: "Charte des professionnelles Berceo",

    intro: {
      title: "Notre engagement",
      paragraphs: [
        "Berceo est une plateforme qui met en relation des familles avec des personnes formées et expérimentées dans l'accompagnement des nouveau-nés et des jeunes enfants, afin de leur offrir un relais de confiance pendant la nuit.",
        "Nos professionnelles peuvent être sages-femmes, infirmières, professionnelles de la petite enfance ou étudiantes en fin de formation.",
        "Leur formation et leur expérience constituent un véritable gage de confiance pour les familles. Elles connaissent les besoins du nouveau-né, les rythmes des premiers mois et les réalités de la vie avec un bébé.",
        "Cependant, une garde Berceo reste une garde et un relais de nuit. Elle ne constitue pas une prestation médicale ou paramédicale.",
        "En rejoignant Berceo, chaque professionnelle s'engage à respecter les principes suivants.",
      ],
    },

    /** The 17 numbered sections: the lines before the list, the list, the lines after it. */
    sections: [
      {
        title: "Une présence professionnelle et bienveillante",
        avant: [
          "La mission première d'une professionnelle Berceo est de permettre aux parents de souffler, dormir et récupérer, tout en sachant leur enfant accompagné par une personne de confiance.",
          "Je m'engage à :",
        ],
        liste: [
          "être attentive et disponible auprès de l'enfant pendant toute la durée de la garde ;",
          "adopter une attitude douce, calme, patiente et bienveillante ;",
          "respecter le rythme, les habitudes et les besoins de l'enfant ;",
          "respecter les consignes données par les parents ;",
          "adopter une attitude professionnelle au domicile de la famille ;",
          "respecter l'intimité, le mode de vie et les habitudes de chaque famille ;",
          "ne porter aucun jugement sur les choix ou les pratiques parentales ;",
          "préserver un climat calme et sécurisant pendant la nuit.",
        ],
        apres: [
          "Chaque famille est différente. Je m'adapte à son fonctionnement dans la mesure où celui-ci reste compatible avec la sécurité et le bien-être de l'enfant.",
        ],
      },
      {
        title: "Le cadre d'intervention Berceo",
        avant: [
          "La professionnelle intervient dans le cadre d'un relais de nuit auprès de l'enfant.",
          "Son rôle peut notamment comprendre :",
        ],
        liste: [
          "accompagner le bébé lors de ses réveils ;",
          "donner le biberon ou accompagner l'allaitement selon l'organisation prévue par les parents ;",
          "changer l'enfant ;",
          "accompagner l'endormissement ;",
          "respecter et maintenir les habitudes de sommeil de l'enfant ;",
          "proposer un accompagnement autour du sommeil et, lorsque cela relève de ses compétences, conseiller les parents sur les routines et habitudes de sommeil de leur enfant ;",
          "prendre le relais auprès du bébé afin que les parents puissent dormir ;",
          "assurer une présence attentive et sécurisante pendant la nuit ;",
          "transmettre aux parents les informations importantes concernant le déroulement de la nuit.",
        ],
        apres: [
          "La professionnelle n'a pas pour mission de réaliser des soins médicaux ou paramédicaux. Le fait d'être diplômée dans le domaine de la santé ne modifie pas le cadre de la prestation Berceo.",
        ],
      },
      {
        title: "Aucun acte médical ou paramédical",
        avant: [
          "Dans le cadre d'une garde Berceo, je m'engage à ne réaliser aucun acte médical ou paramédical.",
          "Je m'engage notamment à ne pas :",
        ],
        liste: [
          "réaliser de consultation médicale ou paramédicale ;",
          "poser de diagnostic ;",
          "prescrire ou modifier un traitement ;",
          "réaliser un acte médical ou paramédical ;",
          "me substituer au médecin, à la sage-femme, à l'infirmier ou à tout autre professionnel de santé assurant le suivi de l'enfant ;",
          "présenter la garde Berceo comme une prestation de soins.",
        ],
        apres: [
          "Mon diplôme ou ma formation constitue une compétence supplémentaire pour accompagner l'enfant, mais je n'exerce pas ma profession de santé dans le cadre de la garde Berceo.",
          "Si une question ou une situation médicale se présente pendant la nuit, je reste dans les limites de mon rôle et invite les parents à contacter le professionnel de santé approprié.",
          "En cas d'urgence ou de danger immédiat pour l'enfant, les services d'urgence compétents doivent être contactés.",
        ],
      },
      {
        title: "Sécurité de l'enfant",
        avant: [
          "La sécurité de l'enfant constitue une priorité absolue.",
          "Je m'engage à :",
        ],
        liste: [
          "rester attentive à l'enfant pendant toute la durée de la garde ;",
          "respecter les règles de sécurité adaptées à son âge ;",
          "respecter les recommandations de sécurité relatives au sommeil du nourrisson ;",
          "utiliser le matériel mis à disposition conformément à son utilisation prévue ;",
          "ne jamais laisser volontairement l'enfant dans une situation présentant un risque pour sa sécurité ;",
          "demander des précisions aux parents lorsque leurs consignes ne sont pas suffisamment claires ;",
          "signaler aux parents toute situation inhabituelle observée pendant la nuit.",
        ],
        apres: [
          "En cas de doute concernant la sécurité de l'enfant, je privilégie toujours la prudence et demande conseil ou sollicite l'aide appropriée.",
        ],
      },
      {
        title: "Respect des parents",
        avant: [
          "Berceo existe aussi pour permettre aux parents de demander de l'aide sans culpabilité.",
          "Je m'engage à accueillir chaque famille avec respect et sans jugement.",
          "Je m'engage notamment à :",
        ],
        liste: [
          "ne jamais culpabiliser les parents concernant leurs choix ou leurs difficultés ;",
          "ne pas minimiser leur fatigue ou leur besoin de relais ;",
          "ne pas leur donner le sentiment qu'ils devraient réussir à tout gérer seuls ;",
          "respecter leurs décisions lorsqu'elles sont compatibles avec la sécurité de l'enfant ;",
          "communiquer de manière calme, claire et respectueuse ;",
          "respecter leur intimité et leur vie familiale.",
        ],
        apres: [
          "La professionnelle Berceo est là pour prendre le relais, pas pour prendre la place des parents.",
        ],
      },
      {
        title: "Confidentialité",
        avant: [
          "Dans le cadre de son intervention, la professionnelle peut avoir connaissance d'informations personnelles concernant l'enfant et sa famille.",
          "Je m'engage à préserver strictement leur confidentialité.",
          "Je m'engage notamment à ne pas :",
        ],
        liste: [
          "raconter à des tiers les informations concernant une famille ;",
          "communiquer les coordonnées d'une famille ;",
          "partager des informations concernant l'enfant ou ses parents avec d'autres personnes ;",
          "utiliser les informations auxquelles j'ai accès à des fins personnelles ou commerciales ;",
          "conserver ou utiliser des informations concernant une famille au-delà de ce qui est nécessaire à mon intervention.",
        ],
        apres: [
          "Cette obligation de confidentialité perdure après la fin de la relation avec la famille.",
        ],
      },
      {
        title: "Photos, vidéos et réseaux sociaux",
        avant: [
          "La vie privée des familles et des enfants doit être particulièrement protégée.",
          "Je m'engage à ne pas :",
        ],
        liste: [
          "photographier ou filmer un enfant sans l'autorisation préalable de ses parents ;",
          "publier une photo ou une vidéo d'un enfant ou d'une famille sans autorisation explicite ;",
          "publier sur les réseaux sociaux des informations permettant d'identifier une famille Berceo ;",
          "mentionner le nom d'une famille ou son domicile sur les réseaux sociaux ;",
          "utiliser une photo ou une information concernant une famille à des fins professionnelles ou commerciales sans autorisation.",
        ],
        apres: [
          "Une autorisation donnée pour prendre une photo ne vaut pas automatiquement autorisation de la publier.",
        ],
      },
      {
        title: "Ponctualité et engagement",
        avant: [
          "Lorsqu'une professionnelle accepte une garde, la famille doit pouvoir compter sur sa présence.",
          "Je m'engage à :",
        ],
        liste: [
          "respecter les horaires convenus ;",
          "arriver à l'heure au domicile de la famille ;",
          "prévenir la famille et Berceo le plus rapidement possible en cas de retard ;",
          "prévenir immédiatement en cas d'empêchement ;",
          "éviter toute annulation de dernière minute qui ne serait pas justifiée par une situation réelle ou imprévisible ;",
          "communiquer de manière honnête et transparente avec la famille et Berceo.",
        ],
        apres: [
          "En cas d'empêchement, je collabore autant que possible à la recherche d'une solution adaptée.",
        ],
      },
      {
        title: "Respect du domicile familial",
        avant: [
          "La garde se déroule au domicile de la famille. Ce lieu doit être considéré avec respect.",
          "Je m'engage à :",
        ],
        liste: [
          "respecter les lieux et les biens de la famille ;",
          "utiliser le matériel mis à disposition avec soin ;",
          "respecter les espaces privés de la maison ;",
          "ne pas inviter de tierce personne au domicile ;",
          "laisser les espaces utilisés propres et en ordre ;",
          "ne pas utiliser les affaires personnelles de la famille sans autorisation.",
        ],
        apres: [
          "La professionnelle est présente dans un cadre professionnel et doit adopter une attitude discrète et respectueuse.",
        ],
      },
      {
        title: "Téléphone et distractions",
        avant: [
          "Pendant une garde, ma priorité est l'enfant dont j'ai la responsabilité.",
          "Je peux utiliser mon téléphone lorsque cela est nécessaire pour communiquer avec les parents ou Berceo, ou en cas de nécessité personnelle.",
          "Je m'engage toutefois à ne pas utiliser mon téléphone ou d'autres appareils de manière excessive à des fins personnelles pendant la garde et à rester pleinement attentive à l'enfant.",
        ],
        liste: [],
        apres: [],
      },
      {
        title: "Alcool, substances et vigilance",
        avant: [
          "Une professionnelle doit être pleinement en mesure d'assurer une présence attentive auprès de l'enfant.",
          "Je m'engage à ne pas intervenir auprès d'une famille si mon état est susceptible d'altérer ma vigilance, mes capacités ou ma capacité à assurer la sécurité de l'enfant.",
          "La consommation d'alcool ou de substances pouvant altérer la vigilance est incompatible et strictement interdite avec l'exercice d'une garde Berceo.",
        ],
        liste: [],
        apres: [],
      },
      {
        title: "Respect de mon statut et de mes qualifications",
        avant: [
          "Je m'engage à présenter de manière exacte mon parcours, mes qualifications, mon expérience et mon statut sur la plateforme.",
          "Je m'engage à :",
        ],
        liste: [
          "ne jamais me présenter comme titulaire d'un diplôme que je ne possède pas ;",
          "ne pas exagérer ou falsifier mon expérience ;",
          "informer Berceo de toute modification importante de mon statut ou de mes qualifications ;",
          "respecter les limites liées à mon statut d'étudiante lorsque je suis en formation ;",
          "ne pas utiliser mon statut ou mon diplôme pour proposer aux familles des prestations qui ne font pas partie du cadre Berceo.",
        ],
        apres: [
          "Les informations présentes sur mon profil doivent rester exactes et à jour.",
        ],
      },
      {
        title: "Relation avec les familles en dehors de Berceo",
        avant: [
          "Berceo souhaite établir une relation de confiance durable avec les familles tout en garantissant un fonctionnement clair pour chacun.",
          "Je m'engage à ne pas utiliser les coordonnées ou informations obtenues via Berceo pour démarcher les familles à des fins commerciales ou leur proposer de manière inappropriée des prestations sans lien avec la garde Berceo.",
          "Toute relation professionnelle avec une famille doit rester respectueuse et transparente.",
        ],
        liste: [],
        apres: [],
      },
      {
        title: "Relations entre professionnelles",
        avant: [
          "Berceo souhaite créer une communauté de professionnelles partageant les mêmes exigences de qualité et de respect.",
          "Je m'engage à :",
        ],
        liste: [
          "respecter les autres professionnelles présentes sur la plateforme ;",
          "ne pas tenir de propos diffamatoires ou dénigrants à leur encontre ;",
          "respecter leur vie privée et leurs informations personnelles ;",
          "privilégier une communication respectueuse en cas de désaccord ;",
          "signaler à Berceo toute situation grave ou préoccupante plutôt que de chercher à la régler par des comportements conflictuels.",
        ],
        apres: [],
      },
      {
        title: "Signalement d'une situation préoccupante",
        avant: [
          "La sécurité et le bien-être de l'enfant restent prioritaires.",
          "Je m'engage à informer les parents et, lorsque cela est nécessaire, Berceo, si je suis confrontée à une situation particulièrement préoccupante dans le cadre d'une garde.",
          "Cela peut notamment concerner :",
        ],
        liste: [
          "une situation présentant un danger pour l'enfant ;",
          "un comportement violent ou inapproprié ;",
          "une situation dépassant clairement le cadre de mon intervention ;",
          "une demande des parents incompatible avec les règles de sécurité ;",
          "toute autre situation nécessitant l'intervention d'un professionnel ou des services compétents.",
        ],
        apres: [
          "En cas de danger immédiat, la priorité est donnée à la protection de l'enfant et au recours aux services d'urgence appropriés.",
        ],
      },
      {
        title: "Exactitude des informations transmises à Berceo",
        avant: [
          "En rejoignant la plateforme, je m'engage à fournir à Berceo des informations exactes et sincères concernant mon identité, ma formation, mon statut, mes qualifications et mon expérience.",
          "Je m'engage à informer Berceo de toute modification susceptible d'avoir une incidence sur mon activité sur la plateforme.",
          "Je comprends que Berceo peut demander des informations complémentaires ou procéder à des vérifications lorsqu'une situation le justifie.",
        ],
        liste: [],
        apres: [],
      },
      {
        title: "Respect de la charte",
        avant: [
          "En rejoignant Berceo, je reconnais avoir pris connaissance de la présente charte et m'engage à en respecter les principes.",
          "Je comprends que le non-respect de cette charte peut entraîner une demande d'explication, une suspension temporaire ou, en fonction de la gravité des faits, la suppression de mon profil de la plateforme.",
          "Les situations sont examinées au cas par cas, en tenant compte de leur nature et de leur gravité.",
        ],
        liste: [],
        apres: [],
      },
    ],

    engagement: {
      title: "L'engagement Berceo",
      paragraphs: [
        "Être professionnelle Berceo, ce n'est pas simplement être présente pendant une nuit.",
        "C'est permettre à des parents fatigués de fermer les yeux en sachant leur bébé entre de bonnes mains.",
        "C'est prendre le relais avec douceur, respecter les habitudes de chaque famille et offrir une présence fiable et rassurante.",
        "Votre diplôme ou votre formation est un véritable atout. Il témoigne de connaissances et d'une expérience précieuses auprès des nouveau-nés et des jeunes enfants.",
        "Mais chez Berceo, cette expertise est mise au service d'une mission simple : prendre le relais la nuit pour permettre aux parents de se reposer.",
        "Notre engagement repose sur trois valeurs essentielles :",
      ],
      valeurs: [
        {
          name: "Compétence",
          text: "Parce qu'un bébé mérite d'être accompagné par une personne formée et responsable.",
        },
        {
          name: "Confiance",
          text: "Parce que les parents doivent pouvoir dormir sereinement lorsqu'ils nous confient leur enfant.",
        },
        {
          name: "Douceur",
          text: "Parce que prendre soin d'un bébé, c'est aussi respecter son rythme, ses besoins et sa famille.",
        },
      ],
      closing: "En rejoignant Berceo, je m'engage à faire vivre ces valeurs auprès de chaque famille.",
    },
  },
});
