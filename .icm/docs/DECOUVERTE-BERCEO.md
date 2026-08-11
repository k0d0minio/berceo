# Berceo — Questions de découverte

Salut à toute l'équipe,

Avant de pouvoir chiffrer le projet et me mettre à construire, j'ai besoin de clarifier pas mal de choses avec vous. J'ai rassemblé ici toutes mes questions, classées par thème. Pas de stress : je n'attends pas des réponses parfaites du premier coup, et « on ne sait pas encore » est une réponse tout à fait valable — ça me dit juste qu'il faudra trancher ensemble.

Deux petites conventions :

- **(bloquant)** : sans réponse, je ne peux ni faire un devis sérieux, ni lancer.
- **(avocat)** : question qui demande l'avis d'un juriste, pas le mien. Je la pose ici pour qu'elle ne passe pas à la trappe.

---

## 1. La vision, en deux mots

1. Le pitch, avec vos mots à vous : quel problème, pour qui, et pourquoi une plateforme plutôt qu'un groupe Facebook ou une agence classique ?
2. Est-ce qu'il y a un business plan écrit ou un modèle financier ? Je peux le voir ?
3. Comment comptez-vous gagner de l'argent, dans l'ordre d'importance : frais de réservation, abonnements familles, abonnements pros, cartes cadeaux, autre chose ? Quelle répartition visez-vous ?
4. Un truc connu sur ce genre de plateformes : après la première rencontre, les familles re-réservent souvent la même personne en direct, sans repasser par la plateforme. Vous en êtes conscients ? Le modèle est-il pensé pour capter la valeur dès la première mise en relation ?
5. Qui voyez-vous comme concurrents ? Vous connaissez Bsit (vérification itsme, abonnements, plus de 3 300 babysitters à Bruxelles), Care.com, Babysits, Yoopies, et les agences flamandes de gardes de nuit ? Et si Bsit ajoute la garde de nuit demain, c'est quoi la réponse de Berceo ?
6. Comment vous positionnez-vous face à l'offre subventionnée : visites de sage-femme remboursées INAMI, doulas via les mutualités, service de la Gezinsbond à environ 25 €/nuit — alors que Berceo vise 100 à 300 €/nuit ?

## 2. Qui décide, et comment on bosse ensemble

1. **(bloquant)** Qui décide au final sur le périmètre, le budget et la validation du travail ? Une personne, ou un consensus entre fondateurs ?
2. **(bloquant)** La société est-elle constituée (forme, numéro BCE) ? Sinon, pour quand — et qui signe mon contrat en attendant ? C'est aussi une condition pour itsme, qui exige une entité légale vérifiée.
3. Votre disponibilité : quel rythme d'appels par semaine, quel délai de réponse à mes questions (24 h ? une semaine ?), et qui est mon point de contact unique ?
4. Comment validez-vous le travail : un accord écrit par étape, ou de l'informel ?
5. Vous attendez un NDA ? Je peux citer Berceo comme référence dans mon portfolio ?
6. Si la collaboration se passe bien, vous imaginez quoi sur le long terme : un CTO à temps partiel, une discussion equity, ou du purement contractuel ?
7. Est-ce que je m'occupe aussi de l'hébergement, du support, des statistiques et des extractions de données — ou quelqu'un d'autre de technique sera impliqué, maintenant ou plus tard (embauches prévues) ?

## 3. Le budget

1. **(bloquant)** Quel budget total est prévu pour la construction (design + développement + services tiers), et d'où vient-il (épargne, investisseurs, prêt, subside) ?
2. À part la construction : quel budget mensuel acceptez-vous une fois lancé ? Il y aura des frais fixes : hébergement, commissions Stripe, coût par vérification itsme, cartes, emails, monitoring, outils de support.
3. Est-ce qu'il y a un budget pour l'essentiel hors code : avocat, comptable, primes d'assurance, contrat itsme, contenu et traduction, photos ?
4. Avez-vous demandé (ou allez-vous demander) des subsides wallons ou bruxellois, ou rejoindre un incubateur ? Est-ce que ça impose des délais ou des rapports à rendre ?

## 4. Les trois grands points à trancher

Ces trois-là conditionnent toute l'architecture. Tant qu'ils ne sont pas tranchés, je ne peux pas construire.

1. **(bloquant)** L'argent de la garde : vous me confirmez que rien ne transite jamais par la plateforme ? Pas de séquestre, pas de paiement à la mission, pas de code de début de garde, pas de validation de fin ? Et la fourchette 100–300 €/nuit est-elle définitive ? C'est la décision qui a le plus de conséquences, techniques comme juridiques.
2. **(bloquant)** La visibilité des profils : des profils publics visibles sur Google et des profils réservés aux abonnés, c'est incompatible — il faut choisir. Ma proposition : des cartes anonymisées publiques plus des pages par commune pour le référencement, et le profil complet avec le contact derrière l'abonnement. Ça vous va ?
3. **(bloquant)** Les prix : aujourd'hui, tous les tarifs sont « à définir » — frais de réservation, les 4 formules d'abonnement familles, l'abonnement pro annuel, les cartes cadeaux. Sans chiffres, impossible de construire la facturation ou de chiffrer le projet. Il me faut : noms des formules, contenus, prix, périodes de facturation, essai gratuit ou non, réductions.

## 5. Le juridique — à voir avec un avocat

À mon avis, c'est le chapitre le plus urgent. Plusieurs points doivent être réglés avant même de parler de code.

1. **(avocat) (bloquant)** Faciliter la garde de nuit régulière à domicile d'enfants de 0 à 12 ans, est-ce que ça déclenche une déclaration préalable ONE côté francophone, ou une notification Kind & Gezin/Opgroeien côté flamand — pour les professionnelles, pour la plateforme, ou pour personne ? Un avis juridique écrit est une condition au lancement.
2. **(avocat)** Le statut des professionnelles : sont-elles vraiment indépendantes ? Une directive européenne sur le travail de plateforme arrive (fin 2026) qui présume le salariat dans certains cas. Concrètement : quelles fonctionnalités dois-je éviter (attribution automatique des gardes, sanctions, contrôle serré des prix) pour rester du bon côté ?
3. **(avocat)** L'économie collaborative : si le paiement se fait en cash hors plateforme, est-ce que ça disqualifie Berceo du régime fiscal avantageux (agrément, précompte d'environ 10,7 %, plafond d'environ 7 890 € en 2026) ? Vous voulez restructurer les paiements pour en bénéficier ?
4. **(avocat)** DAC7 (l'échange automatique d'infos fiscales entre plateformes et le fisc) : avec le paiement hors plateforme, Berceo échappe-t-elle à l'obligation de déclaration ? Et êtes-vous à l'aise avec l'image que ça donne de contourner le système ?
5. **(avocat)** Le travail au noir : quelle est la responsabilité de la plateforme si elle met en relation une offre et une demande réglées en cash sans aucune déclaration ? Quels avertissements, quelles obligations pour les pros (attestation d'indépendant, numéro de TVA ou d'entreprise) faut-il prévoir ?
6. Qui rédige les CGU/CGV, la politique de confidentialité, la politique cookies et les contrats pros/familles ? Ce n'est pas mon rôle. Un avocat est-il déjà engagé ? Budgété ?
7. **(avocat)** Les règles européennes sur les plateformes (DSA) : bouton pour signaler un contenu, justification écrite en cas de suspension, transparence des conditions. Qu'est-ce qui s'applique à Berceo et que dois-je prévoir dans le produit ?
8. **(avocat)** Le règlement « platform-to-business » : les professionnelles sont des utilisatrices business — faut-il publier les critères de classement, prévenir des changements de CGU, offrir un canal de plainte interne ?
9. **(avocat)** L'accessibilité : la loi européenne sur l'accessibilité s'applique au commerce en ligne depuis juin 2025. Berceo est-elle concernée, et à quel niveau (en pratique : la norme WCAG 2.1 AA) ?
10. Les assurances : Berceo prendra-t-elle une RC plateforme ? Exigerez-vous que les familles aient une assurance « gens de maison » (comme Bsit) et que les pros prouvent leur RC professionnelle ? Un courtier a-t-il été approché ? Une assurance par garde, façon Bsit, est-elle sur la table ?
11. **(avocat)** Les titres protégés : « puéricultrice », « infirmière », « sage-femme » sont des titres réglementés. La plateforme peut-elle les afficher, et quelle preuve doit-elle détenir pour ça ?
12. **(avocat)** Le casier judiciaire : exigerez-vous l'extrait modèle 596-2 (activités avec des mineurs) ? À renouveler tous les combien, stocké comment, et qu'est-ce qui disqualifie ? L'avocat doit dire si on a le droit de l'exiger et de le conserver — mais pour de la garde de nourrissons la nuit, c'est éthiquement central.

## 6. Côté familles

1. Qui est la famille type de la V1 : uniquement les nouveau-nés, ou les 0–12 ans comme dans les textes légaux ? Est-ce qu'il y a une limite d'âge (par exemple 0–12 mois) ?
2. Quels champs exacts à l'inscription ? Je recommande le strict minimum — et surtout aucune donnée de santé.
3. Les familles encodent-elles des infos sur l'enfant au-delà de l'âge (allergies, besoins médicaux) ? Ma recommandation ferme : pas en V1 — ce sont des données sensibles au sens du RGPD.
4. Une famille doit-elle aussi être vérifiée, ou juste un compte et un moyen de paiement ? Les pros qui entrent chez des inconnus la nuit ont un intérêt évident à ce que les familles le soient.
5. Que contient une demande de garde : dates, créneau horaire, adresse (à quelle précision, révélée quand ?), nombre d'enfants, âges, remarques ? Vous autorisez du texte libre ? (Ça implique de la modération et du RGPD.)
6. Uniquement des nuits à l'unité en V1, ou aussi des séries récurrentes ?
7. Jusqu'à combien de temps à l'avance peut-on réserver, et avec quel préavis minimum ? Un mode urgence « pour ce soir » ?
8. Les familles peuvent-elles mettre des pros en favoris et re-réserver la même personne ? Ça alimente la fuite hors plateforme — est-ce que ça vous dérange ?
9. Que voit une famille sur une pro avant de s'abonner ou de payer : photo, prénom, distance, note, badges vérifiés ?
10. Français uniquement en V1, c'est confirmé ? Et le néerlandais et l'anglais, pour quand ? Ça influence mes choix techniques dès maintenant.

## 7. Côté professionnelles

1. **(bloquant)** Qui compte comme « gardienne de nuit » : quels diplômes et certificats sont acceptés (puéricultrice, infirmière, sage-femme, équivalents petite enfance, expérience seule) ? Il me faut la liste définitive — elle conditionne tout le système de vérification.
2. Les « types » de profil (niveaux, badges) découlent-ils des diplômes, et influencent-ils la fourchette de prix autorisée ou seulement l'affichage ?
3. Le parcours d'inscription exact : quelles étapes sont obligatoires (identité, diplôme, preuve d'assurance, déclarations sur l'honneur) et lesquelles sont optionnelles ?
4. Les pros gèrent-elles un calendrier de disponibilités en V1, ou tout se négocie dans la messagerie ? (Vos notes disent « localisation uniquement » — je confirme : pas de calendrier ?)
5. Que paie une pro, et quand : abonnement annuel avant d'être visible ? Gratuit jusqu'à la première garde ? Le prix côté pros détermine la facilité à recruter les premières.
6. Une pro peut-elle refuser une demande sans pénalité ? Suivez-vous son taux d'acceptation, et sert-il au classement ? Attention : c'est exactement le genre de « contrôle » visé par la directive sur le travail de plateforme (voir 5.2).
7. Quel ordre de tri dans les résultats de recherche et sur la carte, et le publierez-vous (voir 5.8) ?
8. Le rayon d'action : fixé par la pro, par la plateforme, ou les deux ? Rayon maximum ?
9. Quelle preuve de statut d'indépendant et quel numéro d'entreprise dois-je collecter ? C'est aussi la réponse à la question du travail au noir (5.5).
10. La re-vérification : certains documents expirent (assurance chaque année, casier judiciaire). Qui relance pour les renouvellements ?
11. Que voit une pro sur la famille avant d'accepter : nom, adresse exacte, âges des enfants ? À quel moment l'adresse précise est-elle révélée ?
12. La sortie : que deviennent le profil, les notes et les gardes en cours d'une pro suspendue ou bannie — et quel préavis et quel recours a-t-elle (obligations européennes, voir 5.7 et 5.8) ?

## 8. La vérification des dossiers

1. « Vérifié » veut dire quoi, exactement : le document a l'air authentique ? L'école ou l'institution a confirmé ? Un registre officiel a été consulté ? Aucun prestataire du marché ne vérifie les diplômes — ce sera manuel. Il me faut une procédure écrite et des critères de refus.
2. Un coup de main de l'IA pour trier les diplômes (extraire l'émetteur, le nom, la date, signaler les anomalies — un humain décide toujours) : en V1 ou plus tard ? Et êtes-vous à l'aise avec le fait que les documents transitent par un prestataire d'IA ? (RGPD : il faut un contrat et un traitement en Europe.)
3. Est-ce que je prévois la vérification de références professionnelles en V1 ?
4. Quel délai de vérification promettez-vous à une pro qui s'inscrit, et qui s'en occupe concrètement (vous ? combien d'heures par semaine) ?

## 9. Paiements et abonnements

1. **(bloquant)** Les frais de réservation : montant exact (fixe ou pourcentage), facturés à la famille, à la pro, ou aux deux ? Prélevés à la demande, à l'acceptation, ou à la confirmation ?
2. **(bloquant)** L'annulation : qui peut annuler, jusqu'à quand, et que deviennent les frais à chaque étape (gardés ou remboursés) ? Il me faut le tableau complet — annulations, absences, litiges, force majeure — pour programmer les paiements.
3. Les absences (des deux côtés) : quel statut, remboursement, pénalité, trace dans le dossier ?
4. Que débloque exactement l'abonnement famille : voir les profils complets, contacter, réserver, un nombre de demandes par mois ?
5. Les cartes cadeaux : parcours d'achat, montants, utilisables contre quoi (abonnements seulement ? frais aussi ?), expiration (il y a des règles belges sur les bons) — et vous êtes d'accord que je développe un système de crédits maison ?
6. Moyens de paiement : Bancontact et cartes, confirmé ? Domiciliation SEPA pour les abonnements ? Apple Pay et Google Pay ?
7. Paiements échoués : politique de relance, délai de grâce, à quel moment je coupe l'accès ?
8. Les factures : les familles et les pros ont-elles besoin de vraies factures (TVA) pour les frais et abonnements ? Générées par Stripe ou par moi ?
9. Le paiement de la garde hors plateforme, côté interface : est-ce que j'affiche quelque part le prix convenu, est-ce que je suggère des moyens de paiement (cash, QR, virement), ou silence total ? Attention : plus la plateforme organise ce paiement, plus la position juridique se dégrade (voir 5.3 à 5.5).
10. Un jour, vous voudrez peut-être traiter les paiements de garde sur la plateforme (avec séquestre) ? Ça décide si je prépare la base de données pour ça dès maintenant.
11. Euro et Belgique uniquement au lancement ? Une ambition France changerait l'analyse TVA et juridique.
12. Codes promo et crédits de parrainage : en V1 ?
13. Les litiges : en V1 ils arrivent sur votre email — quel délai de réponse annoncez-vous publiquement, et que voient la famille et la pro dans l'application ?

## 10. Sécurité et confiance

1. **(bloquant)** Le scénario « 3 h du matin » : une famille ou une pro a besoin d'aide en pleine garde — urgence, conflit, personne ne s'est présentée. Que propose Berceo : un contact d'urgence, un fondateur de garde, un protocole publié, ou explicitement rien au-delà du 112 ? Quelle que soit la réponse, elle doit être écrite noir sur blanc et cohérente avec le marketing. Ça conditionne les CGU et tous les textes du produit.
2. Le signalement d'incident : comment chaque partie signale un problème de sécurité après une garde, qui trie, qui enquête, et quelles sont les issues possibles (avertissement, suspension, bannissement, signalement aux autorités) ?
3. Dans quels cas Berceo contacte-t-elle d'elle-même les autorités (ONE, police) — et qui prend cette décision ?
4. Au-delà du minimum légal, à quoi Berceo s'engage-t-elle pour la sécurité des bébés : casier judiciaire, références, appel de contrôle après la première nuit, relecture des avis ? Care.com a eu des scandales de vérification bâclée — qu'est-ce qu'on refuse de reproduire ?
5. La sécurité des pros : elles entrent chez des inconnus la nuit. Vérifiez-vous les familles, partagez-vous leurs évaluations, est-ce que je prévois un pointage d'arrivée/départ, une ligne d'escalade ?
6. La fuite de coordonnées : est-ce que je détecte et bloque les numéros de téléphone et emails dans les messages avant réservation (contre le contournement, et pour la sécurité), ou on accepte la fuite ?
7. Harcèlement et discrimination : quel canal de plainte, quel engagement de réponse, et quels motifs de retrait — dans les deux sens ?
8. Les photos d'enfants : autorisées quelque part (profils, demandes, messages) ? Ma recommandation : nulle part en V1 — données de mineurs et sécurité.
9. La double authentification (2FA) : obligatoire pour les pros et les admins, vu la sensibilité des données ?
10. Les outils d'administration : suspendre un profil, geler les réservations, forcer une re-vérification — avec un journal qui trace chaque action ?

## 11. Le produit V1, concrètement

1. Les profils V1 : localisation plus les documents vérifiés, rien d'autre — pas de préférences ni de calendrier ? Quelle est la liste exacte des champs pour chaque rôle ?
2. La mise en relation : un seul mode en V1 — (a) la famille publie une demande et les pros postulent, ou (b) la famille parcourt la carte et contacte en direct ? L'autre mode passe en V1.1.
3. La messagerie : je confirme le cycle de vie — la conversation s'ouvre quand exactement, se ferme automatiquement après la garde, puis reste consultable en lecture seule ? Des règles de réouverture ?
4. Les évaluations : des étoiles sur 3 ou 4 critères (lesquels exactement ?), dans les deux sens, sans texte libre en V1 ? Et visibles quand — dès qu'une partie a noté, ou seulement quand les deux l'ont fait ?
5. Les abonnements et cartes cadeaux : confirmés pour le lancement, ou est-ce que je les sors de la V1 ? (Les prix restent nécessaires dans tous les cas — voir point 4.3.)

## 12. Design et contenu

1. La marque : logo, couleurs, typographie — c'est finalisé ? Livré dans quel format (Figma, fichiers) ? Qui l'a créée, et cette personne reste-t-elle impliquée ?
2. Est-ce qu'il y a des maquettes, ou je conçois les écrans à partir de composants standards avec votre relecture ? Un designer est-il budgété (voir 3.3) ?
3. Qui écrit tous les textes en français : inscription, emails, messages d'erreur, FAQ, pages sécurité ? Vous, un copywriter, ou un brouillon de ma part que vous relisez ?
4. Le ton et le vocabulaire : « garde », « gardienne », « professionnel(le) » ? Votre position sur les termes genrés et l'écriture inclusive ?
5. Photos et illustrations : banque d'images, sur mesure, ou rien ? De vraies photos de vraies pros posent des questions de consentement et de sécurité.
6. Les pages légales (CGU, confidentialité, cookies — voir 5.6) : pour quelle date ? Elles bloquent le lancement.
7. Le site vitrine : il fait partie de ce projet ou c'est séparé ? Qui le maintient ?

## 13. Acquisition et référencement

1. Comment les 100 premières familles entendent-elles parler de Berceo ? Est-ce qu'il y a un budget marketing, séparé du budget de construction ?
2. L'œuf et la poule : quel côté recrutez-vous d'abord, les pros ou les familles ? Et faut-il prévoir une phase « conciergerie » (mise en relation manuelle par vous) avant le tout-automatique ?
3. Est-ce qu'il existe déjà une marque ou une communauté (Instagram, liste d'attente, presse) sur laquelle s'appuyer ?
4. Une fois la visibilité des profils tranchée (point 4.2) : quelles pages sont publiques — accueil, comment ça marche, tarifs, pages par commune, blog ?
5. Les pages par commune : lesquelles au lancement, quel contenu pour qu'elles ne soient pas des coquilles vides (Google pénalise les pages creuses), et qui fournit ce contenu ?
6. Un blog est-il prévu ? Qui écrit ?
7. De la pub payante (Meta, Google Ads) : pages d'atterrissage, mesure des conversions — et donc bannière cookies et consentement ?
8. Le parrainage : en V1 ou plus tard ?

## 14. Lancement et fonctionnement au quotidien

1. Les critères d'acceptation de la V1 : la liste précise qui veut dire « c'est fini » et qui déclenche le paiement final ?
2. La géographie : quelles communes ou quels arrondissements en premier ?
3. Une beta fermée (sur invitation, une seule commune, mise en relation manuelle) est-elle acceptable avant le lancement public ?
4. Soyons réalistes : combien d'heures par semaine pouvez-vous vraiment consacrer à la vérification des dossiers et au traitement des litiges ?

## 15. Quelques questions pratiques

1. Le contenu : vous voulez pouvoir modifier vous-mêmes les pages marketing et la FAQ, ou « on demande au dev » suffit pour la V1 ?
2. La messagerie : « rafraîchir la page pour voir les nouveaux messages », c'est acceptable en V1, ou vous attendez du temps réel ?
3. Les notifications : email uniquement, ou aussi SMS/WhatsApp en V1 ? (Ça coûte, et ça demande des consentements en plus.)
4. Les emails : une préférence de prestataire hébergé en Europe ? Et quelles notifications font partie de la V1 : événements de réservation, nouveau message, statut de vérification, reçus d'abonnement, récapitulatifs ?
5. La recherche : un rayon autour d'une adresse suffit en V1, ou il faut des filtres et tris en plus (note, prix, type de profil) ?
6. Les noms de domaine : achetés ? Au nom de qui ? Qui a l'accès DNS ? Et quel domaine pour les emails automatiques (il faudra le configurer proprement pour ne pas finir en spam) ?

---

Voilà ! C'est long, je sais. Mais chaque réponse m'évite une mauvaise surprise en cours de route. Je propose de commencer par les points marqués **(bloquant)** et le chapitre juridique, et de dérouler le reste au fil de nos appels.

Merci d'avance,
et à très vite.
