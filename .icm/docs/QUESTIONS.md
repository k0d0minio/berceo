# Berceo — Questionnaire de cadrage exhaustif

> Document de travail : la liste **maximale** des questions à poser à l'équipe Berceo
> pour pouvoir chiffrer précisément, construire sereinement et lancer légalement.
> Volontairement exhaustive — à élaguer avant envoi. Chaque réponse manquante est
> soit un risque chiffré dans le devis, soit une hypothèse écrite noir sur blanc.

**Légende des priorités**

| Tag | Signification |
|---|---|
| **[D]** | Bloquant pour le **devis** — impossible de chiffrer sans réponse |
| **[C]** | À trancher pendant le **cadrage** — avant la première ligne de code |
| **[L]** | À résoudre avant le **lancement** — n'empêche pas de démarrer le développement |

---

## A. Société, gouvernance & décision

*Qui décide, qui signe, qui paie — et l'entité légale conditionne itsme, Stripe et les CGU.*

1. **[D]** La société est-elle constituée ? Sous quelle forme (SRL…), avec quel numéro BCE ? Sinon, quand ?
2. **[D]** Qui est décisionnaire final sur le produit ? Sur le budget ? Une seule voix ou consensus des fondatrices ?
3. **[D]** Quel est le budget total envisagé pour la V1 (fourchette honnête, même large) ? Est-il financé (fonds propres, prêt, subsides, levée) ?
4. **[D]** Y a-t-il une échéance de lancement impérative (événement, salon, saison des naissances, engagement pris) ou une fenêtre souhaitée ?
5. **[C]** Quelle disponibilité hebdomadaire chacune des fondatrices peut-elle consacrer au projet (validation, tests, revue des vérifications) ?
6. **[C]** Qui sera l'interlocuteur produit au quotidien ? Quel canal (WhatsApp, Slack, e-mail) et quel rythme de points ?
7. **[C]** Le nom « Berceo » est-il déposé (marque Benelux/UE) ? Une recherche d'antériorité a-t-elle été faite ? Le nom de domaine est-il acquis, et lequel ?
8. **[C]** Existe-t-il d'autres prestataires ou conseils déjà engagés (avocat, comptable, agence de communication, graphiste) ? Qui coordonne ?
9. **[L]** Qui portera les contrats fournisseurs (itsme, Stripe, hébergement) et les comptes associés — la société ou une fondatrice en propre ?
10. **[C]** Quel est le critère de succès à 6 mois et à 12 mois (nombre de gardes réservées, de professionnelles vérifiées, revenu mensuel) ?
11. **[C]** Quel est le plan si la V1 ne trouve pas son marché — pivot envisagé (annuaire, agence, garde de jour) ou arrêt ?

## B. Modèle économique & tarification

*Impossible de construire la facturation sans chiffres. Aujourd'hui, tous les prix sont « à définir ».*

1. **[D]** Le prix de la garde est-il définitivement un curseur libre **100–300 €/nuit** fixé par la professionnelle ? La « tarification automatique par type de profil » du cahier des charges est-elle abandonnée ?
2. **[D]** Quel est le montant des **frais de service** par réservation ? Fixe ou pourcentage ? Qui les paie — la famille, la professionnelle, les deux ?
3. **[D]** Les frais de service sont-ils dus à la demande, à l'acceptation, ou à la confirmation de la garde ?
4. **[D]** Quels sont les prix des **4 formules famille** ? Que contient exactement chaque palier (nombre de mises en relation, visibilité des profils, priorité) ?
5. **[D]** Quel est le prix de l'**abonnement annuel professionnel** ? Que débloque-t-il précisément ?
6. **[D]** Les abonnements sont-ils indispensables à la V1, ou acceptez-vous de les reporter en V1.1 si les prix ne sont pas arrêtés à la signature ?
7. **[D]** Les **cartes cadeaux** sont-elles indispensables à la V1 ? Quels montants, quelle durée de validité, remboursables ou non ?
8. **[C]** Y a-t-il un accès gratuit (compte famille sans abonnement) ? Que voit-il et que peut-il faire ?
9. **[C]** Les prix affichés sont-ils TVAC ? Avez-vous validé le traitement TVA des frais de service et abonnements avec un comptable (OSS, franchise) ?
10. **[C]** Y a-t-il des promotions prévues au lancement (premier mois offert, parrainage, code promo presse) ?
11. **[C]** Quelle est votre position assumée sur la **désintermédiation** : acceptez-vous que les réservations répétées avec la même professionnelle sortent de la plateforme, le revenu reposant sur l'introduction + abonnements ? Ou faut-il des mécanismes de rétention (et lesquels) ?
12. **[C]** Quel volume attendez-vous la première année (familles inscrites, professionnelles actives, gardes/mois) ? Sur quoi fondez-vous ces chiffres ?
13. **[L]** Une professionnelle peut-elle proposer un tarif dégressif (forfait semaine, nuits multiples) ou est-ce hors V1 ?
14. **[L]** Qui fixe et assume la politique de remboursement commercial (geste commercial, avoir) au-delà des règles d'annulation ?

## C. Périmètre produit V1 — les contradictions à trancher

*Chaque point ci-dessous existe en deux versions contradictoires dans le cahier des charges annoté. Le devis dépend directement de ces arbitrages.*

1. **[D]** **Mode de mise en relation** : la V1 contient-elle (a) l'annonce publiée + candidatures des professionnelles, (b) la carte + demande directe, ou les deux ? (Les deux ≈ double le travail de matching — recommandation : un seul en V1.)
2. **[D]** **Visibilité des profils vs SEO** : les profils des professionnelles sont-ils publics et indexables, ou réservés aux abonnées ? Les deux à la fois sont impossibles. Acceptez-vous le schéma : pages marketing + pages locales par commune publiques, profils complets derrière l'abonnement ?
3. **[D]** **Profil professionnel V1** : confirmez-vous le profil minimal (identité, localisation, tarif, disponibilité) — sans préférences, spécialités ni bio enrichie ?
4. **[D]** **Vérification** : confirmez-vous qu'elle est bien DANS la V1 (itsme + carte d'identité en secours + revue manuelle des diplômes + déclarations sur l'honneur + disclaimer de transparence) ?
5. **[C]** **Messagerie** : confirmez-vous la règle de clôture automatique du fil à la fin de la garde (historique consultable, écriture bloquée) ? Que se passe-t-il si la même famille re-réserve la même professionnelle — nouveau fil ou réouverture ?
6. **[C]** **Évaluations** : étoiles uniquement, sur quels 3–4 critères exactement, dans les deux sens, sans texte libre en V1 ? Les notes sont-elles visibles publiquement, seulement aux abonnées, ou seulement en interne ?
7. **[C]** **Litiges** : traités par e-mail aux fondatrices en V1 — avec quel engagement de délai de réponse affiché (non contractuel) ?
8. **[C]** **Annulation** : quelle est la grille exacte (délais, rétention ou remboursement des frais de service, annulation côté famille vs côté professionnelle, cas de force majeure — bébé malade, professionnelle malade à 20h) ?
9. **[C]** Que se passe-t-il en cas de **no-show** de la professionnelle ? De la famille ? Qui arbitre, avec quelles conséquences (suspension, remboursement) ?
10. **[C]** La plateforme est-elle **francophone uniquement** en V1 ? Le néerlandais/anglais est-il prévu, et à quelle échéance ? (Impacte l'architecture i18n dès le départ.)
11. **[C]** V1 = site web responsive uniquement, sans application native ? Une PWA installable suffit-elle ?
12. **[C]** Quelles **notifications** en V1 : e-mail seul, ou aussi SMS/push ? Pour quels événements exactement (nouvelle demande, acceptation, message, rappel de garde) ?
13. **[C]** Une garde peut-elle couvrir **plusieurs enfants** (jumeaux) ? Le tarif change-t-il ? Champ « nombre d'enfants » suffit-il ?
14. **[C]** Quelle plage d'âge d'enfants la plateforme accepte-t-elle (0–3 mois, 0–12 mois, plus) ? Une garde de nuit pour un enfant de 3 ans est-elle en périmètre ?
15. **[C]** Quelles sont les heures types d'une garde (22h–7h ?) ? La famille définit-elle librement les horaires ? Y a-t-il une durée minimale ?
16. **[C]** Une demande de garde peut-elle être **récurrente** (toutes les nuits de la semaine, 3 nuits/semaine pendant un mois) ou uniquement à l'unité en V1 ?
17. **[L]** Faut-il une gestion de **calendrier de disponibilité** côté professionnelle en V1, ou la disponibilité se règle-t-elle dans la conversation ?
18. **[L]** Les familles peuvent-elles enregistrer des professionnelles en favoris ? Les professionnelles peuvent-elles bloquer une famille ?

## D. Offre, recrutement des professionnelles & amorçage

*Une place de marché sans offre au lancement est une page vide. Le plan d'amorçage conditionne aussi le calendrier.*

1. **[C]** Combien de professionnelles vérifiées visez-vous au lancement, et dans quelles communes/zones précisément ?
2. **[C]** Comment seront-elles recrutées (réseau des fondatrices, écoles de puériculture, associations, publicité) ? Qui s'en charge, et quand cela commence-t-il ?
3. **[C]** Existe-t-il déjà un vivier identifié (liste, groupe Facebook, contacts) ? De quelle taille ?
4. **[C]** Quels profils sont admis : puéricultrices diplômées uniquement, ou aussi infirmières, sages-femmes, doulas, aides-soignantes, étudiantes en puériculture, gardes expérimentées sans diplôme ? (Détermine toute la grille de vérification.)
5. **[C]** Le statut attendu des professionnelles est-il l'indépendante (complémentaire ou principale) ? Vérifiez-vous leur numéro BCE / statut social, ou est-ce leur responsabilité exclusive ?
6. **[C]** La plateforme est-elle réservée aux femmes (« Gardiennes ») ou ouverte à tous ? (Question à la fois de marque, d'éthique et de droit anti-discrimination — voir H.)
7. **[C]** Le lancement géographique : Bruxelles + Brabant wallon d'abord, ou toute la Belgique francophone d'emblée ? Des communes prioritaires ?
8. **[L]** Y a-t-il un plan d'amorçage côté demande (familles) : partenariats maternités, sages-femmes, mutualités, salons bébé, presse ?
9. **[L]** Les fondatrices assureront-elles elles-mêmes des gardes au début (pour tester le produit) ?

## E. Vérification, confiance & sécurité — le cœur du produit

*C'est le produit. Chaque exigence ajoutée ici est du temps de développement et un coût d'exploitation récurrent.*

### itsme & identité

1. **[D]** Avez-vous **contacté itsme** ? Où en est la démarche (formulaire, devis, contrat) ? Quel budget annuel a été annoncé ? — *Sans contrat itsme signé tôt, la V1 lance avec carte d'identité + revue manuelle, itsme en V1.1.*
2. **[D]** Si itsme est trop cher ou trop lent : validez-vous le repli **lecture de carte d'identité + selfie via un prestataire KYC** (Stripe Identity, Veriff…) ? Quel budget par vérification acceptez-vous (~1–2 €/contrôle) ?
3. **[C]** La vérification d'identité concerne-t-elle les **deux côtés** (professionnelles ET familles) ou seulement les professionnelles ? Si les familles aussi : au même niveau d'exigence ?
4. **[C]** À quel moment la vérification est-elle exigée : à l'inscription, avant publication du profil, avant la première réservation ?

### Qualifications & antécédents

5. **[D]** Quelle est la **liste exhaustive des documents exigés** d'une professionnelle : diplôme(s) — lesquels précisément —, attestations de formation, certificat de premiers secours (BEPS/pédiatrique), extrait de casier judiciaire, preuve d'assurance RC professionnelle, preuve de statut d'indépendante, références ?
6. **[D]** Exigez-vous l'**extrait de casier judiciaire modèle 596.2** (activités avec mineurs) ? De moins de combien de mois ? Renouvelé à quelle fréquence ? Qui le contrôle et selon quels critères de refus ?
7. **[C]** Qui définit la **grille d'acceptation** des diplômes (quels diplômes belges/étrangers, équivalences, quelles écoles) ? Existe-t-elle déjà par écrit ?
8. **[C]** La revue des diplômes est **manuelle par les fondatrices** en V1 : quel délai de traitement promettez-vous aux candidates (24h, 72h, 1 semaine) ? Qui assure la continuité pendant les congés ?
9. **[C]** Souhaitez-vous l'**assistance IA** à la revue documentaire (pré-extraction émetteur/nom/date, détection d'anomalies), la décision restant humaine ? — *Voir aussi H.11 sur l'AI Act.*
10. **[C]** Un **entretien** (visio ou téléphone) fait-il partie du parcours de validation en V1, ou uniquement les documents ?
11. **[C]** Vérifiez-vous des **références** (anciens employeurs/familles) ? Qui les appelle ?
12. **[C]** Que contient exactement la **déclaration sur l'honneur** signée par la professionnelle ? Par la famille ? Qui en rédige le texte (avocat) ?
13. **[C]** Quelle est la fréquence de **re-vérification** (casier, assurance, statut) : annuelle, à chaque renouvellement d'abonnement, jamais ?
14. **[C]** Quel est le processus de **retrait du badge / suspension** si un document expire, si une plainte grave arrive, si une condamnation est signalée ? Qui décide, avec quel droit de réponse ?

### Promesse publique & responsabilité

15. **[C]** Quel wording public exact pour la vérification : « profil vérifié » engage la plateforme — que promettez-vous, et que dit le **disclaimer de transparence** (rédigé par qui) ?
16. **[C]** Affichez-vous publiquement *ce qui* a été vérifié (identité ✓, diplôme ✓, casier ✓) ou un badge unique ?
17. **[L]** Que fait la plateforme si une famille signale un comportement inquiétant sans preuve ? Grille de gravité, procédure contradictoire, seuil de suspension immédiate ?
18. **[L]** Que fait la plateforme si une **professionnelle** signale un foyer dangereux ou une situation de maltraitance ? Avez-vous une position sur l'obligation de signalement (SOS Enfants, art. 458bis) à faire valider par l'avocat ?

## F. Sécurité de l'enfant, incidents & éthique opérationnelle

*Une plateforme qui place des inconnues auprès de nouveau-nés la nuit doit avoir des réponses écrites AVANT le premier incident.*

1. **[C]** Quel est le **protocole d'incident** pendant une garde (urgence médicale, accident, désaccord grave à 3h du matin) ? La plateforme fournit-elle un numéro d'urgence, ou renvoie-t-elle au 112 + contact famille uniquement ?
2. **[C]** Y a-t-il une astreinte des fondatrices la nuit au lancement ? Sinon, qu'affiche-t-on honnêtement aux familles ?
3. **[C]** Exigez-vous ou recommandez-vous une formation « sommeil sûr » / prévention de la mort subite du nourrisson ? Publiez-vous des consignes de sécurité (couchage, co-dodo, température) aux deux parties ?
4. **[C]** Une **fiche de consignes** par garde (allergies, médication, biberons, contacts d'urgence) fait-elle partie de la V1 ? — *Attention : la médication/santé = données de santé, voir G.4.*
5. **[C]** Assurances : la plateforme souscrira-t-elle une **RC exploitation/professionnelle** ? Exigez-vous la preuve de RC professionnelle des gardiennes ? Recommandez-vous l'assurance « gens de maison » aux familles (pratique Bsit) ? Un courtier a-t-il été consulté ?
6. **[C]** Quelle est votre position si un contrôle échoue silencieusement (faux diplôme passé à travers) : provision, assurance, communication de crise ? Qui parle à la presse ?
7. **[L]** Autorisez-vous les familles à utiliser un **babyphone/caméra** pendant la garde ? La professionnelle doit-elle en être informée ? (Position à écrire dans les CGU.)
8. **[L]** Politique sur les **photos** : la professionnelle peut-elle photographier l'enfant (pour rassurer les parents) ? Par quel canal ?
9. **[L]** Politique d'**équité d'accès** : tarif plancher à 100 € — assumez-vous d'exclure les familles modestes, ou prévoyez-vous un geste (cartes cadeaux solidaires, partenariat mutualités) ?
10. **[L]** Les filtres de recherche permettront-ils de discriminer (âge, origine perçue via photo, religion) ? Quelles données affichez-vous sur les profils pour minimiser ce risque ?

## G. RGPD & données personnelles

*Vous traiterez des identités, des documents officiels, des données sur des nourrissons et potentiellement des données de santé (article 9).*

1. **[C]** Qui est **responsable de traitement** (l'entité) ? Un DPO ou référent RGPD est-il désigné (même informel) ?
2. **[C]** Un **registre des traitements** existe-t-il ? Sinon, acceptez-vous que je le structure avec vous pendant le cadrage ?
3. **[C]** Qui rédige la **politique de confidentialité** et la politique cookies (avocat, modèle validé) ? Budget prévu ?
4. **[D]** Confirmez-vous que la V1 **exclut toute donnée de santé** de l'enfant des champs structurés (pas de champ « besoins médicaux ») pour rester hors article 9 — ou en voulez-vous, en assumant les obligations renforcées ?
5. **[C]** **Durées de conservation** à valider par type de donnée : documents d'identité (supprimés après vérification ? conservés combien de temps ?), diplômes, casiers judiciaires (conservation du document vs simple mention « vérifié le X »), messages, comptes inactifs, données de facturation.
6. **[C]** Le casier judiciaire est une donnée « article 10 » : votre avocat a-t-il validé la **base légale** pour le collecter/consulter en tant que plateforme privée ? Alternative : contrôle visuel sans stockage ?
7. **[C]** Exigence de **résidence des données** : « hébergé en Europe » vous suffit-il avec des sous-traitants américains sous DPA (Vercel/Supabase région UE), ou exigez-vous des fournisseurs européens (Scaleway/Hetzner), au prix d'un surcoût d'exploitation ?
8. **[C]** Quels outils d'**analytics/marketing** voulez-vous (GA4, Meta Pixel, TikTok) ? Acceptez-vous une alternative sans cookie tiers (Plausible/Matomo) pour alléger le consentement ?
9. **[L]** Parcours **droits des personnes** : export, rectification, suppression de compte — délai promis ? Que reste-t-il après suppression (factures, litiges en cours) ?
10. **[L]** Procédure de **violation de données** : qui notifie l'APD sous 72h, qui prévient les personnes ?
11. **[L]** Consentements horodatés et versionnés (CGU, confidentialité, marketing) — confirmez-vous ce mécanisme et qui gère les nouvelles versions ?
12. **[L]** Newsletters/marketing : quelle base (opt-in), quel outil, qui rédige ?

## H. Légal & réglementaire (Belgique/UE)

*Aucune de ces questions ne se résout par du code. La plupart exigent un avocat — le devis doit savoir qui le paie et quand.*

1. **[D]** Avez-vous un **avocat** (droit des plateformes / droit social) ? Un budget juridique est-il prévu ? Sinon, acceptez-vous que ce soit un prérequis bloquant au lancement (pas au développement) ?
2. **[D]** **Agrément ONE / Kind & Gezin** : votre avocat a-t-il analysé si la garde de nuit à domicile par des indépendantes déclenche déclaration/agrément (Code de qualité ONE) ? La réponse peut imposer des exigences produit (déclaration préalable des professionnelles).
3. **[D]** **Économie collaborative** : confirmez-vous le paiement de la garde **hors plateforme** (cash/virement/QR) en connaissance de cause — ce qui exclut le régime fiscal agréé (~10,7 %) et prive les professionnelles du plafond avantageux de 7 890 €/an ? Ou souhaitez-vous réétudier un paiement via plateforme pour y prétendre ? — *C'est LA décision structurante : architecture, fiscalité, DAC7, désintermédiation.*
4. **[C]** **Travail non déclaré** : quelle posture assume la plateforme (information fiscale claire aux professionnelles, rappels, rien) sachant que le cash hors plateforme facilite le noir ?
5. **[C]** **DAC7** : votre conseil a-t-il confirmé si Berceo est dans ou hors du champ (facilitation vs simple mise en relation sans connaissance du montant) ? Qui produira le rapport annuel si dedans ?
6. **[C]** **Directive travail de plateforme (2024/2831, transposition 2/12/2026)** : votre avocat a-t-il évalué le risque de présomption de salariat ? Acceptez-vous les contraintes produit qui minimisent le « contrôle » (pas de dispatch algorithmique, tarif réellement libre — le curseur 100–300 € borné est déjà un signal de contrôle) ?
7. **[C]** **DSA** : l'entité sera-t-elle micro/petite entreprise (exemptions traçabilité art. 30) ? Prévoir quand même : point de contact, mécanisme de signalement de contenu, motivation des suspensions ?
8. **[C]** **Règlement P2B (2019/1150)** : les professionnelles sont des utilisatrices professionnelles — CGU pros conformes (préavis de modification, motivation des déclassements/suspensions, transparence du classement sur la carte/liste) : qui les rédige ?
9. **[C]** **Droit de la consommation** : droit de rétractation de 14 jours sur les abonnements et frais de service — comment le gérez-vous (renonciation expresse à l'exécution immédiate) ? Mentions légales, ODR/médiation consommation ?
10. **[C]** **Anti-discrimination** : si la plateforme n'accepte que des femmes (« Gardiennes »), votre avocat a-t-il validé la compatibilité avec la loi Genre du 10 mai 2007 ? Sinon, le nom/positionnement change-t-il ?
11. **[C]** **AI Act** : si l'IA assiste le tri des candidatures/diplômes des professionnelles, cela peut toucher le haut risque (accès au travail indépendant, annexe III) — calendrier d'application en évolution (2026→2027). Confirmez-vous le principe « l'IA assiste, l'humain décide », documenté comme tel ?
12. **[C]** **Accessibilité (European Accessibility Act, en vigueur 28/6/2025)** : la Belgique n'exempte pas les micro-entreprises e-commerce (période transitoire jusqu'en 2030). Visez-vous WCAG 2.1/2.2 AA dès la V1 (recommandé, coût marginal si prévu dès le départ) ?
13. **[C]** **CGU/CGV** : trois textes distincts (familles, professionnelles, confidentialité) — qui les rédige, avec quel budget et quel délai ? Le développement peut avancer, pas le lancement.
14. **[L]** **Facturation** : la plateforme doit-elle émettre des factures conformes (frais de service, abonnements) ? Numérotation, mentions, e-invoicing belge (obligation B2B structurée 2026) si des pros demandent facture ?
15. **[L]** Jeux-concours/cartes cadeaux : règles belges spécifiques (valeur, expiration) validées ?

## I. Paiements & flux financiers

*Le choix « frais de service uniquement, garde payée hors plateforme » simplifie énormément — s'il est confirmé.*

1. **[D]** Confirmation finale : **aucun paiement de la garde ne transite par la plateforme** — pas d'escrow, pas de code de début de mission, pas de validation de libération de paiement, pas de Stripe Connect ?
2. **[D]** Le compte **Stripe** sera ouvert au nom de la société — qui fait le KYB Stripe et quand ?
3. **[C]** Moyens de paiement V1 : cartes + **Bancontact** ? SEPA pour les abonnements annuels ? Apple/Google Pay ?
4. **[C]** Gestion des **échecs de paiement** d'abonnement (relances, suspension de l'accès au bout de combien de jours) ?
5. **[C]** Les **cartes cadeaux** : achetables par des non-inscrits ? Utilisables sur frais de service ET abonnements ? Cumulables ? Un registre de crédits maison vous convient-il (recommandé) ?
6. **[C]** Remboursements : qui a le droit de déclencher un remboursement dans l'admin, avec quelle traçabilité ?
7. **[L]** Comptabilité : export mensuel (CSV) suffit-il pour votre comptable, ou faut-il une intégration (Billit, Yuki…) ?
8. **[L]** Affichez-vous aux familles une estimation du **coût total** (garde estimée + frais) avant demande, pour éviter les surprises ?

## J. Technique, hébergement & exploitation

*Pour dimensionner l'infrastructure, la reprise éventuelle et le run.*

1. **[C]** Confirmez-vous la cible **Next.js + Supabase (Postgres/RLS/PostGIS, région UE)** proposée, ou avez-vous des contraintes (prestataire imposé, existant) ?
2. **[C]** Existe-t-il **du code, des maquettes, des comptes déjà créés** (Vercel, Supabase, Google, Figma) ? Qui en détient les accès ?
3. **[C]** Cartographie : validez-vous **Mapbox ou MapLibre/OSM** plutôt que Google Maps (coûts), avec géocodage sur données belges ouvertes (BeSt Address) et **position floutée** des domiciles jusqu'à confirmation ?
4. **[C]** E-mails transactionnels : un fournisseur UE (Brevo) ou Resend/Postmark vous convient-il ? Depuis quel domaine expéditeur ?
5. **[C]** Quel niveau de **disponibilité** attendez-vous ? (Réaliste pour une V1 solo : best effort, pas de SLA contractuel, pas d'astreinte nocturne — à écrire noir sur blanc, justement parce que le produit vit la nuit.)
6. **[C]** Contenu éditorial (pages vitrine, FAQ, blog SEO local) : un **CMS** est-il nécessaire pour que vous éditiez seules, ou des fichiers gérés par le développeur suffisent-ils en V1 ?
7. **[C]** **SEO** : quelles ambitions concrètes (pages par commune, blog) et qui écrit les contenus ? (Le développeur livre la mécanique, pas les textes.)
8. **[C]** Combien de comptes **admin** au lancement, et faut-il des rôles différenciés (super-admin vs opératrice de vérification) dès la V1 ?
9. **[C]** Quels **tableaux de bord/KPI** minimum dans l'admin V1 (inscriptions, vérifications en attente, gardes, revenus) ?
10. **[L]** **Sauvegardes & continuité** : la rétention Supabase standard vous suffit-elle ? Qui détient les accès de secours si le développeur est indisponible ?
11. **[L]** Nom de domaine, DNS, boîtes mail professionnelles : qui les gère ?
12. **[L]** Support utilisateur : simple adresse e-mail au départ ? Qui répond, sous quel délai affiché ?
13. **[L]** Monitoring/erreurs (Sentry) et statut : souhaitez-vous être alertées, ou seulement le développeur ?

## K. Design, marque & contenu

1. **[C]** L'identité visuelle est « fournie » : que comprend-elle exactement (logo, palette, typos, charte complète, maquettes écran par écran) ? Dans quel format (Figma) ?
2. **[C]** S'il n'y a **pas de maquettes UI**, acceptez-vous une UI construite sur une bibliothèque de composants (rapide, sobre), ou faut-il budgéter un designer ?
3. **[C]** Qui écrit **tous les textes** de l'interface et des pages (ton, FR belge) ? Le développeur intègre, il ne rédige pas.
4. **[C]** Photos : banques d'images ou vraies photos ? Si vraies professionnelles/familles : consentements écrits prévus ?
5. **[L]** Réseaux sociaux, notoriété, RP : qui s'en occupe ? (Hors périmètre dev, mais conditionne le trafic au lancement.)

## L. Exploitation quotidienne & back-office

*Ce sont les fondatrices qui vivront dans l'admin. Le back-office est non négociable en V1 — son ampleur, si.*

1. **[C]** Qui traite les **vérifications** au quotidien, à quel rythme (tous les jours ? 2×/semaine ?) et pendant les vacances ?
2. **[C]** Volume attendu de candidatures professionnelles/mois au lancement (dimensionne l'outillage de revue) ?
3. **[C]** Fonctions admin V1 à confirmer : valider/refuser une vérification (avec motif), suspendre/réactiver un compte, voir les paiements et rembourser, consulter les signalements, éditer le contenu vitrine — autre chose d'indispensable ?
4. **[C]** Faut-il un mécanisme de **signalement** in-app (profil, message, comportement) dès la V1, ou l'e-mail suffit-il ?
5. **[L]** Modération de la messagerie : lecture par l'admin possible ? Sous quelles conditions affichées aux utilisateurs ? Détection de contournement (numéros de téléphone échangés pour désintermédier) — voulue ou non ?
6. **[L]** Rapports périodiques automatiques (hebdo par e-mail) souhaités ?

## M. Engagement, contrat & collaboration

*Les conditions de l'engagement lui-même — à clarifier avant de signer quoi que ce soit.*

1. **[D]** Validez-vous le principe **cadrage payant court → devis V1 ferme**, plutôt qu'un prix fixe sur tout le cahier des charges ?
2. **[D]** Le mode de facturation : régie (taux horaire/journalier) ou jalons ? Le taux proposé (120 €/h HTVA) est-il accepté ? Une composante variable (commission, participation) est-elle réellement sur la table, et laquelle ?
3. **[D]** Rythme : 2–3 jours/semaine à distance vous convient-il ? Quel délai de paiement des factures (15/30 jours) ?
4. **[C]** **Propriété intellectuelle** : le code est cédé à la société à paiement complet — accord ? Licence sur les briques génériques réutilisables ?
5. **[C]** Après la V1 : un **forfait de maintenance/itération mensuel** est-il envisagé (budget) ? Qui reprend le projet si la collaboration s'arrête (documentation de reprise prévue au devis) ?
6. **[C]** Garantie : correction des bugs de la V1 pendant N semaines après lancement — quelle attente ?
7. **[C]** Confidentialité/NDA réciproque et non-débauchage : souhaité ?
8. **[C]** Qui signe le contrat côté Berceo, et sous quelle entité si la société n'est pas encore constituée ?
9. **[L]** Référence commerciale : accepterez-vous que le projet figure en portfolio après lancement ?

---

## Les 10 réponses sans lesquelles aucun devis sérieux n'est possible

1. Budget disponible et financé (A3) et échéance (A4).
2. Un seul mode de mise en relation en V1, lequel (C1).
3. Profils publics/SEO **ou** réservés aux abonnées (C2).
4. Paiement de la garde 100 % hors plateforme, confirmé en connaissance des conséquences fiscales (H3/I1).
5. Montant des frais de service et fait générateur (B2/B3).
6. Prix des abonnements et cartes cadeaux — ou leur report en V1.1 (B4–B7).
7. Liste fermée des documents de vérification exigés, casier 596.2 inclus ou non (E5/E6).
8. Statut de la démarche itsme et repli KYC accepté (E1/E2).
9. Avocat engagé + budget juridique, avec les 4 analyses bloquantes : ONE, économie collaborative, DAC7, directive plateforme (H1–H6).
10. Entité légale constituée ou date de constitution (A1).

---

*Sources principales : recherche projet (`.icm/docs/REPORT.md`) ; SPF Justice (extrait 596.2) ; textes DSA (art. 30), règlement P2B 2019/1150, directive (UE) 2024/2831, AI Act (annexe III), European Accessibility Act (dir. 2019/882) et transposition belge. Les points juridiques sont des questions à faire trancher par un avocat, pas des conclusions.*
