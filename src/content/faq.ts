import { catalogue } from "./locale";

/**
 * `/faq`. The guide asks for question-and-answer pairs (answers of two to five
 * sentences, precise and reassuring) and every question about verification
 * and safety here; it gives no list. Every question and answer below is ours,
 * written in the guide's rules from the settled scope, and none states a term
 * the sources do not give.
 *
 * A `link` names a page of `common.pages` by its key, so each URL is written
 * once.
 *
 * @relecture Surya — toutes les questions et réponses de la FAQ sont rédigées d'après le guide et les décisions du cadrage.
 */
export const faq = catalogue({
  fr: {
    meta: {
      title: "Questions fréquentes sur la garde de nuit bébé | Berceo",
      description:
        "Vérification des professionnelles, déroulement d'une garde de nuit, tarifs, annulation : les réponses aux questions des familles et des professionnelles.",
    },

    title: "Questions fréquentes",
    intro:
      "Les réponses aux questions que se posent les familles et les professionnelles de santé sur Berceo.",

    groups: [
      {
        title: "Vérification et sécurité",
        items: [
          {
            question: "Qui sont les professionnelles de Berceo ?",
            answer:
              "Ce sont des professionnelles de santé : des sages-femmes, des infirmières en néonatologie et des puéricultrices. Elles connaissent les nourrissons et les situations qui appellent une attention médicale. Ce ne sont pas des baby-sitters.",
          },
          {
            question: "Comment Berceo vérifie-t-il les professionnelles ?",
            answer:
              "Chaque professionnelle dépose son diplôme ou son attestation et valide des déclarations sur l'honneur. L'équipe Berceo examine chaque dossier à la main. Aucun profil n'est visible avant cette vérification manuelle.",
            link: { label: "Comment fonctionne Berceo", page: "commentCaMarche" },
          },
          {
            question: "Quand mon adresse est-elle partagée ?",
            answer:
              "Pour publier une demande, seule votre commune est nécessaire. Votre adresse exacte n'est communiquée à la professionnelle qu'une fois la réservation confirmée.",
          },
          {
            question:
              "Une professionnelle peut-elle garder un bébé qui a besoin de soins particuliers ?",
            answer:
              "Les gardes de nuit Berceo s'adressent aux nourrissons sans condition médicale particulière nécessitant des soins spécialisés. Vous le confirmez au moment de publier votre demande. En cas de doute, parlez-en à votre médecin ou à votre sage-femme.",
          },
        ],
      },
      {
        title: "Pour les familles",
        items: [
          {
            question: "Comment trouver une professionnelle ?",
            answer:
              "Publiez votre demande de garde avec la date, l'heure de début, l'âge de votre bébé et votre commune. Les professionnelles disponibles dans votre commune vous répondent. Vous consultez leur profil et vous choisissez celle qui veillera sur votre bébé.",
            link: { label: "Les étapes en détail", page: "commentCaMarche" },
          },
          {
            question: "Combien de temps dure une garde de nuit ?",
            answer:
              "Une garde de nuit standard dure onze heures. Vous choisissez l'heure de début au moment de publier votre demande.",
          },
          {
            question: "Faut-il créer un compte ?",
            answer:
              "Oui. La création d'un compte famille est gratuite et vous donne accès aux profils complets des professionnelles.",
            link: { label: "Créer un compte famille", page: "inscriptionFamille" },
          },
          {
            question: "Comment fonctionnent les avis ?",
            answer:
              "Après chaque garde, la famille et la professionnelle se notent mutuellement avec des étoiles. Ces notes apparaissent sur les profils et aident chacune et chacun à choisir en confiance.",
          },
        ],
      },
      {
        title: "Tarifs et paiement",
        items: [
          {
            question: "Combien coûte une garde de nuit ?",
            answer:
              "Chaque professionnelle fixe son tarif de nuit, entre 100 € et 300 €. Des frais de service de 3 % sont prélevés à la confirmation de la réservation. Il n'y a pas d'abonnement.",
            link: { label: "Consulter les tarifs", page: "tarifs" },
          },
          {
            question: "Comment se passe le paiement ?",
            answer:
              "Vous rémunérez la professionnelle directement, après la garde. Berceo ne perçoit que les frais de service de 3 %, prélevés à la confirmation de la réservation.",
          },
          {
            question: "Que se passe-t-il en cas d'annulation ?",
            answer:
              "Si la professionnelle annule, les frais de service vous sont intégralement remboursés. Si vous annulez, ils ne sont pas remboursés. En cas de difficulté, contactez l'équipe Berceo.",
          },
        ],
      },
      {
        title: "Pour les professionnelles",
        items: [
          {
            question: "Comment rejoindre Berceo ?",
            answer:
              "Créez votre compte, complétez votre profil, déposez vos justificatifs et validez vos déclarations sur l'honneur. L'équipe Berceo vérifie votre dossier dans les 24 heures ouvrables et vous prévient par e-mail dès que votre profil est activé.",
            link: {
              label: "Créer un compte professionnel",
              page: "inscriptionProfessionnelle",
            },
          },
          {
            question: "Est-ce que je reste indépendante ?",
            answer:
              "Oui. Berceo ne vous emploie pas : la plateforme vous met en relation avec des familles. Vous fixez votre tarif, vous choisissez vos zones et les gardes que vous acceptez.",
          },
          {
            question: "Comment suis-je rémunérée ?",
            answer:
              "La famille vous rémunère directement, après la garde. Berceo ne prélève rien sur votre tarif de nuit.",
          },
        ],
      },
    ],
  },
});
