import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/proposal/section";
import { Badge } from "@/components/ui/badge";
import { proposal } from "@/content/proposal";

/**
 * The discovery questionnaire — the document sent to the Berceo team, rendered
 * verbatim from `.icm/docs/DECOUVERTE-BERCEO.md`. Content edits happen here and
 * in that file together so they stay in sync.
 */

function Bloquant() {
  return (
    <Badge variant="destructive" className="mr-2 align-baseline">
      bloquant
    </Badge>
  );
}

function Avocat() {
  return (
    <Badge variant="outline" className="mr-2 align-baseline">
      avocat
    </Badge>
  );
}

type Item = {
  bloquant?: boolean;
  avocat?: boolean;
  text: ReactNode;
};

type QuestionSection = {
  id: string;
  title: string;
  description?: string;
  items: Item[];
};

const questionnaire: QuestionSection[] = [
  {
    id: "vision",
    title: "La vision, en deux mots",
    items: [
      {
        text: "Le pitch, avec vos mots à vous : quel problème, pour qui, et pourquoi une plateforme plutôt qu’un groupe Facebook ou une agence classique ?",
      },
      {
        text: "Est-ce qu’il y a un business plan écrit ou un modèle financier ? Je peux le voir ?",
      },
      {
        text: "Comment comptez-vous gagner de l’argent, dans l’ordre d’importance : frais de réservation, abonnements familles, abonnements pros, cartes cadeaux, autre chose ? Quelle répartition visez-vous ?",
      },
      {
        text: "Un truc connu sur ce genre de plateformes : après la première rencontre, les familles re-réservent souvent la même personne en direct, sans repasser par la plateforme. Vous en êtes conscients ? Le modèle est-il pensé pour capter la valeur dès la première mise en relation ?",
      },
      {
        text: "Qui voyez-vous comme concurrents ? Vous connaissez Bsit (vérification itsme, abonnements, plus de 3 300 babysitters à Bruxelles), Care.com, Babysits, Yoopies, et les agences flamandes de gardes de nuit ? Et si Bsit ajoute la garde de nuit demain, c’est quoi la réponse de Berceo ?",
      },
      {
        text: "Comment vous positionnez-vous face à l’offre subventionnée : visites de sage-femme remboursées INAMI, doulas via les mutualités, service de la Gezinsbond à environ 25 €/nuit — alors que Berceo vise 100 à 300 €/nuit ?",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Qui décide, et comment on bosse ensemble",
    items: [
      {
        bloquant: true,
        text: "Qui décide au final sur le périmètre, le budget et la validation du travail ? Une personne, ou un consensus entre fondateurs ?",
      },
      {
        bloquant: true,
        text: "La société est-elle constituée (forme, numéro BCE) ? Sinon, pour quand — et qui signe mon contrat en attendant ? C’est aussi une condition pour itsme, qui exige une entité légale vérifiée.",
      },
      {
        text: "Votre disponibilité : quel rythme d’appels par semaine, quel délai de réponse à mes questions (24 h ? une semaine ?), et qui est mon point de contact unique ?",
      },
      {
        text: "Comment validez-vous le travail : un accord écrit par étape, ou de l’informel ?",
      },
      {
        text: "Vous attendez un NDA ? Je peux citer Berceo comme référence dans mon portfolio ?",
      },
      {
        text: "Si la collaboration se passe bien, vous imaginez quoi sur le long terme : un CTO à temps partiel, une discussion equity, ou du purement contractuel ?",
      },
      {
        text: "Est-ce que je m’occupe aussi de l’hébergement, du support, des statistiques et des extractions de données — ou quelqu’un d’autre de technique sera impliqué, maintenant ou plus tard (embauches prévues) ?",
      },
    ],
  },
  {
    id: "budget",
    title: "Le budget",
    items: [
      {
        bloquant: true,
        text: "Quel budget total est prévu pour la construction (design + développement + services tiers), et d’où vient-il (épargne, investisseurs, prêt, subside) ?",
      },
      {
        text: "À part la construction : quel budget mensuel acceptez-vous une fois lancé ? Il y aura des frais fixes : hébergement, commissions Stripe, coût par vérification itsme, cartes, emails, monitoring, outils de support.",
      },
      {
        text: "Est-ce qu’il y a un budget pour l’essentiel hors code : avocat, comptable, primes d’assurance, contrat itsme, contenu et traduction, photos ?",
      },
      {
        text: "Avez-vous demandé (ou allez-vous demander) des subsides wallons ou bruxellois, ou rejoindre un incubateur ? Est-ce que ça impose des délais ou des rapports à rendre ?",
      },
    ],
  },
  {
    id: "arbitrages",
    title: "Les trois grands points à trancher",
    description:
      "Ces trois-là conditionnent toute l’architecture. Tant qu’ils ne sont pas tranchés, je ne peux pas construire.",
    items: [
      {
        bloquant: true,
        text: "L’argent de la garde : vous me confirmez que rien ne transite jamais par la plateforme ? Pas de séquestre, pas de paiement à la mission, pas de code de début de garde, pas de validation de fin ? Et la fourchette 100–300 €/nuit est-elle définitive ? C’est la décision qui a le plus de conséquences, techniques comme juridiques.",
      },
      {
        bloquant: true,
        text: "La visibilité des profils : des profils publics visibles sur Google et des profils réservés aux abonnés, c’est incompatible — il faut choisir. Ma proposition : des cartes anonymisées publiques plus des pages par commune pour le référencement, et le profil complet avec le contact derrière l’abonnement. Ça vous va ?",
      },
      {
        bloquant: true,
        text: "Les prix : aujourd’hui, tous les tarifs sont « à définir » — frais de réservation, les 4 formules d’abonnement familles, l’abonnement pro annuel, les cartes cadeaux. Sans chiffres, impossible de construire la facturation ou de chiffrer le projet. Il me faut : noms des formules, contenus, prix, périodes de facturation, essai gratuit ou non, réductions.",
      },
    ],
  },
  {
    id: "juridique",
    title: "Le juridique — à voir avec un avocat",
    description:
      "À mon avis, c’est le chapitre le plus urgent. Plusieurs points doivent être réglés avant même de parler de code.",
    items: [
      {
        avocat: true,
        bloquant: true,
        text: "Faciliter la garde de nuit régulière à domicile d’enfants de 0 à 12 ans, est-ce que ça déclenche une déclaration préalable ONE côté francophone, ou une notification Kind & Gezin/Opgroeien côté flamand — pour les professionnelles, pour la plateforme, ou pour personne ? Un avis juridique écrit est une condition au lancement.",
      },
      {
        avocat: true,
        text: "Le statut des professionnelles : sont-elles vraiment indépendantes ? Une directive européenne sur le travail de plateforme arrive (fin 2026) qui présume le salariat dans certains cas. Concrètement : quelles fonctionnalités dois-je éviter (attribution automatique des gardes, sanctions, contrôle serré des prix) pour rester du bon côté ?",
      },
      {
        avocat: true,
        text: "L’économie collaborative : si le paiement se fait en cash hors plateforme, est-ce que ça disqualifie Berceo du régime fiscal avantageux (agrément, précompte d’environ 10,7 %, plafond d’environ 7 890 € en 2026) ? Vous voulez restructurer les paiements pour en bénéficier ?",
      },
      {
        avocat: true,
        text: "DAC7 (l’échange automatique d’infos fiscales entre plateformes et le fisc) : avec le paiement hors plateforme, Berceo échappe-t-elle à l’obligation de déclaration ? Et êtes-vous à l’aise avec l’image que ça donne de contourner le système ?",
      },
      {
        avocat: true,
        text: "Le travail au noir : quelle est la responsabilité de la plateforme si elle met en relation une offre et une demande réglées en cash sans aucune déclaration ? Quels avertissements, quelles obligations pour les pros (attestation d’indépendant, numéro de TVA ou d’entreprise) faut-il prévoir ?",
      },
      {
        text: "Qui rédige les CGU/CGV, la politique de confidentialité, la politique cookies et les contrats pros/familles ? Ce n’est pas mon rôle. Un avocat est-il déjà engagé ? Budgété ?",
      },
      {
        avocat: true,
        text: "Les règles européennes sur les plateformes (DSA) : bouton pour signaler un contenu, justification écrite en cas de suspension, transparence des conditions. Qu’est-ce qui s’applique à Berceo et que dois-je prévoir dans le produit ?",
      },
      {
        avocat: true,
        text: "Le règlement « platform-to-business » : les professionnelles sont des utilisatrices business — faut-il publier les critères de classement, prévenir des changements de CGU, offrir un canal de plainte interne ?",
      },
      {
        avocat: true,
        text: "L’accessibilité : la loi européenne sur l’accessibilité s’applique au commerce en ligne depuis juin 2025. Berceo est-elle concernée, et à quel niveau (en pratique : la norme WCAG 2.1 AA) ?",
      },
      {
        text: "Les assurances : Berceo prendra-t-elle une RC plateforme ? Exigerez-vous que les familles aient une assurance « gens de maison » (comme Bsit) et que les pros prouvent leur RC professionnelle ? Un courtier a-t-il été approché ? Une assurance par garde, façon Bsit, est-elle sur la table ?",
      },
      {
        avocat: true,
        text: "Les titres protégés : « puéricultrice », « infirmière », « sage-femme » sont des titres réglementés. La plateforme peut-elle les afficher, et quelle preuve doit-elle détenir pour ça ?",
      },
      {
        avocat: true,
        text: "Le casier judiciaire : exigerez-vous l’extrait modèle 596-2 (activités avec des mineurs) ? À renouveler tous les combien, stocké comment, et qu’est-ce qui disqualifie ? L’avocat doit dire si on a le droit de l’exiger et de le conserver — mais pour de la garde de nourrissons la nuit, c’est éthiquement central.",
      },
    ],
  },
  {
    id: "familles",
    title: "Côté familles",
    items: [
      {
        text: "Qui est la famille type de la V1 : uniquement les nouveau-nés, ou les 0–12 ans comme dans les textes légaux ? Est-ce qu’il y a une limite d’âge (par exemple 0–12 mois) ?",
      },
      {
        text: "Quels champs exacts à l’inscription ? Je recommande le strict minimum — et surtout aucune donnée de santé.",
      },
      {
        text: "Les familles encodent-elles des infos sur l’enfant au-delà de l’âge (allergies, besoins médicaux) ? Ma recommandation ferme : pas en V1 — ce sont des données sensibles au sens du RGPD.",
      },
      {
        text: "Une famille doit-elle aussi être vérifiée, ou juste un compte et un moyen de paiement ? Les pros qui entrent chez des inconnus la nuit ont un intérêt évident à ce que les familles le soient.",
      },
      {
        text: "Que contient une demande de garde : dates, créneau horaire, adresse (à quelle précision, révélée quand ?), nombre d’enfants, âges, remarques ? Vous autorisez du texte libre ? (Ça implique de la modération et du RGPD.)",
      },
      {
        text: "Uniquement des nuits à l’unité en V1, ou aussi des séries récurrentes ?",
      },
      {
        text: "Jusqu’à combien de temps à l’avance peut-on réserver, et avec quel préavis minimum ? Un mode urgence « pour ce soir » ?",
      },
      {
        text: "Les familles peuvent-elles mettre des pros en favoris et re-réserver la même personne ? Ça alimente la fuite hors plateforme — est-ce que ça vous dérange ?",
      },
      {
        text: "Que voit une famille sur une pro avant de s’abonner ou de payer : photo, prénom, distance, note, badges vérifiés ?",
      },
      {
        text: "Français uniquement en V1, c’est confirmé ? Et le néerlandais et l’anglais, pour quand ? Ça influence mes choix techniques dès maintenant.",
      },
    ],
  },
  {
    id: "pros",
    title: "Côté professionnelles",
    items: [
      {
        bloquant: true,
        text: "Qui compte comme « gardienne de nuit » : quels diplômes et certificats sont acceptés (puéricultrice, infirmière, sage-femme, équivalents petite enfance, expérience seule) ? Il me faut la liste définitive — elle conditionne tout le système de vérification.",
      },
      {
        text: "Les « types » de profil (niveaux, badges) découlent-ils des diplômes, et influencent-ils la fourchette de prix autorisée ou seulement l’affichage ?",
      },
      {
        text: "Le parcours d’inscription exact : quelles étapes sont obligatoires (identité, diplôme, preuve d’assurance, déclarations sur l’honneur) et lesquelles sont optionnelles ?",
      },
      {
        text: "Les pros gèrent-elles un calendrier de disponibilités en V1, ou tout se négocie dans la messagerie ? (Vos notes disent « localisation uniquement » — je confirme : pas de calendrier ?)",
      },
      {
        text: "Que paie une pro, et quand : abonnement annuel avant d’être visible ? Gratuit jusqu’à la première garde ? Le prix côté pros détermine la facilité à recruter les premières.",
      },
      {
        text: "Une pro peut-elle refuser une demande sans pénalité ? Suivez-vous son taux d’acceptation, et sert-il au classement ? Attention : c’est exactement le genre de « contrôle » visé par la directive sur le travail de plateforme (voir 5.2).",
      },
      {
        text: "Quel ordre de tri dans les résultats de recherche et sur la carte, et le publierez-vous (voir 5.8) ?",
      },
      {
        text: "Le rayon d’action : fixé par la pro, par la plateforme, ou les deux ? Rayon maximum ?",
      },
      {
        text: "Quelle preuve de statut d’indépendant et quel numéro d’entreprise dois-je collecter ? C’est aussi la réponse à la question du travail au noir (5.5).",
      },
      {
        text: "La re-vérification : certains documents expirent (assurance chaque année, casier judiciaire). Qui relance pour les renouvellements ?",
      },
      {
        text: "Que voit une pro sur la famille avant d’accepter : nom, adresse exacte, âges des enfants ? À quel moment l’adresse précise est-elle révélée ?",
      },
      {
        text: "La sortie : que deviennent le profil, les notes et les gardes en cours d’une pro suspendue ou bannie — et quel préavis et quel recours a-t-elle (obligations européennes, voir 5.7 et 5.8) ?",
      },
    ],
  },
  {
    id: "verification",
    title: "La vérification des dossiers",
    items: [
      {
        text: "« Vérifié » veut dire quoi, exactement : le document a l’air authentique ? L’école ou l’institution a confirmé ? Un registre officiel a été consulté ? Aucun prestataire du marché ne vérifie les diplômes — ce sera manuel. Il me faut une procédure écrite et des critères de refus.",
      },
      {
        text: "Un coup de main de l’IA pour trier les diplômes (extraire l’émetteur, le nom, la date, signaler les anomalies — un humain décide toujours) : en V1 ou plus tard ? Et êtes-vous à l’aise avec le fait que les documents transitent par un prestataire d’IA ? (RGPD : il faut un contrat et un traitement en Europe.)",
      },
      {
        text: "Est-ce que je prévois la vérification de références professionnelles en V1 ?",
      },
      {
        text: "Quel délai de vérification promettez-vous à une pro qui s’inscrit, et qui s’en occupe concrètement (vous ? combien d’heures par semaine) ?",
      },
    ],
  },
  {
    id: "paiements",
    title: "Paiements et abonnements",
    items: [
      {
        bloquant: true,
        text: "Les frais de réservation : montant exact (fixe ou pourcentage), facturés à la famille, à la pro, ou aux deux ? Prélevés à la demande, à l’acceptation, ou à la confirmation ?",
      },
      {
        bloquant: true,
        text: "L’annulation : qui peut annuler, jusqu’à quand, et que deviennent les frais à chaque étape (gardés ou remboursés) ? Il me faut le tableau complet — annulations, absences, litiges, force majeure — pour programmer les paiements.",
      },
      {
        text: "Les absences (des deux côtés) : quel statut, remboursement, pénalité, trace dans le dossier ?",
      },
      {
        text: "Que débloque exactement l’abonnement famille : voir les profils complets, contacter, réserver, un nombre de demandes par mois ?",
      },
      {
        text: "Les cartes cadeaux : parcours d’achat, montants, utilisables contre quoi (abonnements seulement ? frais aussi ?), expiration (il y a des règles belges sur les bons) — et vous êtes d’accord que je développe un système de crédits maison ?",
      },
      {
        text: "Moyens de paiement : Bancontact et cartes, confirmé ? Domiciliation SEPA pour les abonnements ? Apple Pay et Google Pay ?",
      },
      {
        text: "Paiements échoués : politique de relance, délai de grâce, à quel moment je coupe l’accès ?",
      },
      {
        text: "Les factures : les familles et les pros ont-elles besoin de vraies factures (TVA) pour les frais et abonnements ? Générées par Stripe ou par moi ?",
      },
      {
        text: "Le paiement de la garde hors plateforme, côté interface : est-ce que j’affiche quelque part le prix convenu, est-ce que je suggère des moyens de paiement (cash, QR, virement), ou silence total ? Attention : plus la plateforme organise ce paiement, plus la position juridique se dégrade (voir 5.3 à 5.5).",
      },
      {
        text: "Un jour, vous voudrez peut-être traiter les paiements de garde sur la plateforme (avec séquestre) ? Ça décide si je prépare la base de données pour ça dès maintenant.",
      },
      {
        text: "Euro et Belgique uniquement au lancement ? Une ambition France changerait l’analyse TVA et juridique.",
      },
      { text: "Codes promo et crédits de parrainage : en V1 ?" },
      {
        text: "Les litiges : en V1 ils arrivent sur votre email — quel délai de réponse annoncez-vous publiquement, et que voient la famille et la pro dans l’application ?",
      },
    ],
  },
  {
    id: "securite",
    title: "Sécurité et confiance",
    items: [
      {
        bloquant: true,
        text: "Le scénario « 3 h du matin » : une famille ou une pro a besoin d’aide en pleine garde — urgence, conflit, personne ne s’est présentée. Que propose Berceo : un contact d’urgence, un fondateur de garde, un protocole publié, ou explicitement rien au-delà du 112 ? Quelle que soit la réponse, elle doit être écrite noir sur blanc et cohérente avec le marketing. Ça conditionne les CGU et tous les textes du produit.",
      },
      {
        text: "Le signalement d’incident : comment chaque partie signale un problème de sécurité après une garde, qui trie, qui enquête, et quelles sont les issues possibles (avertissement, suspension, bannissement, signalement aux autorités) ?",
      },
      {
        text: "Dans quels cas Berceo contacte-t-elle d’elle-même les autorités (ONE, police) — et qui prend cette décision ?",
      },
      {
        text: "Au-delà du minimum légal, à quoi Berceo s’engage-t-elle pour la sécurité des bébés : casier judiciaire, références, appel de contrôle après la première nuit, relecture des avis ? Care.com a eu des scandales de vérification bâclée — qu’est-ce qu’on refuse de reproduire ?",
      },
      {
        text: "La sécurité des pros : elles entrent chez des inconnus la nuit. Vérifiez-vous les familles, partagez-vous leurs évaluations, est-ce que je prévois un pointage d’arrivée/départ, une ligne d’escalade ?",
      },
      {
        text: "La fuite de coordonnées : est-ce que je détecte et bloque les numéros de téléphone et emails dans les messages avant réservation (contre le contournement, et pour la sécurité), ou on accepte la fuite ?",
      },
      {
        text: "Harcèlement et discrimination : quel canal de plainte, quel engagement de réponse, et quels motifs de retrait — dans les deux sens ?",
      },
      {
        text: "Les photos d’enfants : autorisées quelque part (profils, demandes, messages) ? Ma recommandation : nulle part en V1 — données de mineurs et sécurité.",
      },
      {
        text: "La double authentification (2FA) : obligatoire pour les pros et les admins, vu la sensibilité des données ?",
      },
      {
        text: "Les outils d’administration : suspendre un profil, geler les réservations, forcer une re-vérification — avec un journal qui trace chaque action ?",
      },
    ],
  },
  {
    id: "produit-v1",
    title: "Le produit V1, concrètement",
    items: [
      {
        text: "Les profils V1 : localisation plus les documents vérifiés, rien d’autre — pas de préférences ni de calendrier ? Quelle est la liste exacte des champs pour chaque rôle ?",
      },
      {
        text: "La mise en relation : un seul mode en V1 — (a) la famille publie une demande et les pros postulent, ou (b) la famille parcourt la carte et contacte en direct ? L’autre mode passe en V1.1.",
      },
      {
        text: "La messagerie : je confirme le cycle de vie — la conversation s’ouvre quand exactement, se ferme automatiquement après la garde, puis reste consultable en lecture seule ? Des règles de réouverture ?",
      },
      {
        text: "Les évaluations : des étoiles sur 3 ou 4 critères (lesquels exactement ?), dans les deux sens, sans texte libre en V1 ? Et visibles quand — dès qu’une partie a noté, ou seulement quand les deux l’ont fait ?",
      },
      {
        text: "Les abonnements et cartes cadeaux : confirmés pour le lancement, ou est-ce que je les sors de la V1 ? (Les prix restent nécessaires dans tous les cas — voir point 4.3.)",
      },
    ],
  },
  {
    id: "design",
    title: "Design et contenu",
    items: [
      {
        text: "La marque : logo, couleurs, typographie — c’est finalisé ? Livré dans quel format (Figma, fichiers) ? Qui l’a créée, et cette personne reste-t-elle impliquée ?",
      },
      {
        text: "Est-ce qu’il y a des maquettes, ou je conçois les écrans à partir de composants standards avec votre relecture ? Un designer est-il budgété (voir 3.3) ?",
      },
      {
        text: "Qui écrit tous les textes en français : inscription, emails, messages d’erreur, FAQ, pages sécurité ? Vous, un copywriter, ou un brouillon de ma part que vous relisez ?",
      },
      {
        text: "Le ton et le vocabulaire : « garde », « gardienne », « professionnel(le) » ? Votre position sur les termes genrés et l’écriture inclusive ?",
      },
      {
        text: "Photos et illustrations : banque d’images, sur mesure, ou rien ? De vraies photos de vraies pros posent des questions de consentement et de sécurité.",
      },
      {
        text: "Les pages légales (CGU, confidentialité, cookies — voir 5.6) : pour quelle date ? Elles bloquent le lancement.",
      },
      {
        text: "Le site vitrine : il fait partie de ce projet ou c’est séparé ? Qui le maintient ?",
      },
    ],
  },
  {
    id: "acquisition",
    title: "Acquisition et référencement",
    items: [
      {
        text: "Comment les 100 premières familles entendent-elles parler de Berceo ? Est-ce qu’il y a un budget marketing, séparé du budget de construction ?",
      },
      {
        text: "L’œuf et la poule : quel côté recrutez-vous d’abord, les pros ou les familles ? Et faut-il prévoir une phase « conciergerie » (mise en relation manuelle par vous) avant le tout-automatique ?",
      },
      {
        text: "Est-ce qu’il existe déjà une marque ou une communauté (Instagram, liste d’attente, presse) sur laquelle s’appuyer ?",
      },
      {
        text: "Une fois la visibilité des profils tranchée (point 4.2) : quelles pages sont publiques — accueil, comment ça marche, tarifs, pages par commune, blog ?",
      },
      {
        text: "Les pages par commune : lesquelles au lancement, quel contenu pour qu’elles ne soient pas des coquilles vides (Google pénalise les pages creuses), et qui fournit ce contenu ?",
      },
      { text: "Un blog est-il prévu ? Qui écrit ?" },
      {
        text: "De la pub payante (Meta, Google Ads) : pages d’atterrissage, mesure des conversions — et donc bannière cookies et consentement ?",
      },
      { text: "Le parrainage : en V1 ou plus tard ?" },
    ],
  },
  {
    id: "lancement",
    title: "Lancement et fonctionnement au quotidien",
    items: [
      {
        text: "Les critères d’acceptation de la V1 : la liste précise qui veut dire « c’est fini » et qui déclenche le paiement final ?",
      },
      {
        text: "La géographie : quelles communes ou quels arrondissements en premier ?",
      },
      {
        text: "Une beta fermée (sur invitation, une seule commune, mise en relation manuelle) est-elle acceptable avant le lancement public ?",
      },
      {
        text: "Soyons réalistes : combien d’heures par semaine pouvez-vous vraiment consacrer à la vérification des dossiers et au traitement des litiges ?",
      },
    ],
  },
  {
    id: "pratique",
    title: "Quelques questions pratiques",
    items: [
      {
        text: "Le contenu : vous voulez pouvoir modifier vous-mêmes les pages marketing et la FAQ, ou « on demande au dev » suffit pour la V1 ?",
      },
      {
        text: "La messagerie : « rafraîchir la page pour voir les nouveaux messages », c’est acceptable en V1, ou vous attendez du temps réel ?",
      },
      {
        text: "Les notifications : email uniquement, ou aussi SMS/WhatsApp en V1 ? (Ça coûte, et ça demande des consentements en plus.)",
      },
      {
        text: "Les emails : une préférence de prestataire hébergé en Europe ? Et quelles notifications font partie de la V1 : événements de réservation, nouveau message, statut de vérification, reçus d’abonnement, récapitulatifs ?",
      },
      {
        text: "La recherche : un rayon autour d’une adresse suffit en V1, ou il faut des filtres et tris en plus (note, prix, type de profil) ?",
      },
      {
        text: "Les noms de domaine : achetés ? Au nom de qui ? Qui a l’accès DNS ? Et quel domaine pour les emails automatiques (il faudra le configurer proprement pour ne pas finir en spam) ?",
      },
    ],
  },
];

export default function DiscoveryPage() {
  return (
    <main id="top" className="mx-auto max-w-3xl px-6 pb-24">
      <header className="py-16 sm:py-24">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{proposal.client}</Badge>
          <Badge variant="outline">Découverte</Badge>
          <span className="text-sm text-muted-foreground">{proposal.date}</span>
        </div>

        <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Questions de découverte
        </h1>

        <div className="prose-proposal mt-8">
          <p>Salut à toute l’équipe,</p>
          <p>
            Avant de pouvoir chiffrer le projet et me mettre à construire, j’ai
            besoin de clarifier pas mal de choses avec vous. J’ai rassemblé ici
            toutes mes questions, classées par thème. Pas de stress : je
            n’attends pas des réponses parfaites du premier coup, et « on ne
            sait pas encore » est une réponse tout à fait valable — ça me dit
            juste qu’il faudra trancher ensemble.
          </p>
          <p>Deux petites conventions :</p>
          <ul className="list-none space-y-2 pl-0">
            <li>
              <Bloquant />
              sans réponse, je ne peux ni faire un devis sérieux, ni lancer.
            </li>
            <li>
              <Avocat />
              question qui demande l’avis d’un juriste, pas le mien. Je la pose
              ici pour qu’elle ne passe pas à la trappe.
            </li>
          </ul>
        </div>

        <nav
          aria-label="Sommaire"
          className="mt-10 rounded-lg border border-border p-6"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sommaire
          </p>
          <ol className="mt-4 grid list-decimal gap-x-8 gap-y-2 pl-5 text-sm marker:text-muted-foreground sm:grid-cols-2">
            {questionnaire.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <p className="mt-8 text-sm text-muted-foreground">
          {proposal.author.name} · {proposal.author.role} ·{" "}
          {proposal.author.location}
        </p>
      </header>

      {questionnaire.map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          title={`${index + 1}. ${section.title}`}
          description={section.description}
        >
          <ol>
            {section.items.map((item, i) => (
              <li key={i}>
                {item.avocat ? <Avocat /> : null}
                {item.bloquant ? <Bloquant /> : null}
                {item.text}
              </li>
            ))}
          </ol>
        </Section>
      ))}

      <section className="border-t border-border py-14">
        <div className="prose-proposal">
          <p>
            Voilà ! C’est long, je sais. Mais chaque réponse m’évite une
            mauvaise surprise en cours de route. Je propose de commencer par les
            points marqués <Bloquant /> et le chapitre juridique, et de dérouler
            le reste au fil de nos appels.
          </p>
          <p>
            Merci d’avance,
            <br />
            et à très vite.
          </p>
          <p>
            — {proposal.author.name} ·{" "}
            <a href={`mailto:${proposal.author.email}`}>
              {proposal.author.email}
            </a>
          </p>
          <p>
            La proposition d’engagement qui accompagne ce document se trouve
            ici : <Link href="/proposition">la proposition</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
