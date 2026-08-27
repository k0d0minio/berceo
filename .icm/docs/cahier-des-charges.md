**Cahier des Charges \- GDN**

Version adaptee \- sans controle documentaire des diplomes professionnels

Finalement, nous souhaitons adapter le processus de vérification des professionnels comme suit :

**Vérification de l'identité** : via **itsme** (si possible) ou, à défaut, via la **carte d'identité**.

**Vérification des qualifications** : les professionnels devront télécharger leurs justificatifs (diplôme, certificat de scolarité, etc., selon leur situation). Et nous les vérifierons dans un premier temps manuellement avant d’approuver le profil et si notre site a du succès un jour on voudrait que ce soit automatique.

Lors de l'inscription, ils devront également accepter les déclarations suivantes :

☑️ Je certifie que les documents transmis sont authentiques, complets et m'appartiennent.

☑️ Je déclare être légalement autorisé(e) à exercer les activités proposées sur la plateforme.

☑️ Je reconnais que toute fausse déclaration ou tout document falsifié entraînera la suppression immédiate de mon compte, sans remboursement, et pourra être signalé aux autorités compétentes.

☑️ J'accepte que la plateforme procède à toute vérification qu'elle juge utile auprès des organismes compétents.

Du côté des parents, nous souhaitons faire apparaître une mention de transparence du type :

Les professionnels doivent transmettre des justificatifs lors de leur inscription. La plateforme effectue des contrôles documentaires et des vérifications raisonnables, mais ne peut garantir l'authenticité absolue de chaque document fourni. Les parents demeurent responsables de leur choix et sont invités à rencontrer le professionnel, à échanger avec lui et à s'assurer que son profil, son expérience et ses compétences répondent à leurs attentes avant le début de la prestation.

| Element | Detail |
| :---- | :---- |
| Client | Gardiennes de la Nuit (nom provisoire) |
| Projet | Plateforme web de mise en relation pour gardes de nuit post-partum |
| Version | Document revise pour cadrage/devis |
| Date de revision | 2026-08-02 |
| Note de perimetre | Le controle documentaire des diplomes/certificats professionnels est exclu de cette version. |
| **Synthese de revision**Cette version conserve le principe de plateforme web de mise en relation, les comptes utilisateurs, les demandes de garde, la selection d'un professionnel, la messagerie, le paiement et l'administration. Elle retire le controle documentaire des diplomes/certificats professionnels, ainsi que les workflows et donnees associes. |  |

# 1\. Besoins fonctionnels

## Objectif general de l'application

Le projet vise a creer une plateforme web de mise en relation entre des parents de nouveau-nes ou nourrissons et des professionnels disponibles pour assurer des gardes de nuit en post-partum. La plateforme permet aux familles de publier une demande, de recevoir des candidatures, d'echanger avec les professionnels, de selectionner un intervenant et de suivre la mission jusqu'a sa cloture.

La plateforme reprend le principe d'une marketplace de mise en relation a deux faces. Les familles publient des demandes de garde et les professionnels inscrits se positionnent sur les missions correspondant a leurs criteres. Les tarifs peuvent etre standardises par la plateforme selon le profil declare du professionnel, afin de limiter la negociation de prix.

On souhaite mettre une roulette de prix allant de 100 à 300€ la nuit pour bloquer les prix en laissant tout de même le choix. 

Nous souhaitons proposer **deux modes de mise en relation d’office** :

1. **Création d'une annonce par le parent** : le parent publie une annonce visible par tous les professionnels correspondant aux critères, et ceux-ci peuvent y postuler.  
2. **Recherche directe par le parent** : le parent peut consulter une carte affichant les professionnels situés à proximité de son domicile, accéder à leurs profils et leur envoyer directement une demande de réservation s'il est intéressé.

L'objectif est de laisser aux parents le choix entre attendre des candidatures suite à une annonce ou prendre eux-mêmes l'initiative de contacter un professionnel.

Pour cette version, le controle documentaire des diplomes, certificats ou qualifications professionnelles n'est pas inclus. Le profil professionnel repose sur les informations declarees par l'utilisateur, l'acceptation des conditions de la plateforme, l'onboarding de paiement et les actions d'administration prevues dans le back-office.

## Type de projet

* Application web responsive accessible sur mobile, tablette et ordinateur.  
* Partie vitrine orientee presentation du service et decouvrabilite.  
* Espace famille authentifie pour publier et suivre les demandes.  
* Espace professionnel authentifie pour renseigner son profil, consulter les demandes et se positionner.  
* Infrastructure de paiement via Stripe/Stripe Connect, selon le modele valide techniquement et juridiquement. 

Finalement, nous avons décidé que **Berceo ne percevra pas le paiement de la prestation de garde de nuit**.

La plateforme prélèvera uniquement les **frais de service** au moment de la réservation. Le règlement de la prestation sera ensuite effectué **directement entre le parent et le professionnel** à l'issue de la garde, selon le mode de paiement de leur choix (espèces, QR code, virement, etc.).

Cette solution simplifie le fonctionnement de la plateforme et permet également au professionnel de s'assurer lui-même du paiement de sa prestation.

Concernant les frais de service :

* **En cas d'annulation à l'initiative du parent**, les frais de service restent acquis à Berceo et ne sont pas remboursés.  
* **En cas d'annulation à l'initiative du professionnel**, les frais de service sont intégralement remboursés au parent, celui-ci n'étant pas responsable de l'annulation.

* Back-office d'administration pour suivre les utilisateurs, demandes, missions, paiements et retours.  
* Structure prevue pour une evolution ulterieure vers des fonctionnalites plus automatisees.

## Fonctionnalites cles

MH \= Must Have | SH \= Should Have | CH \= Could Have

### A. Vitrine et contenu public

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Page d'accueil | Presentation du concept avec blocs distincts famille/professionnel. | MH |
| Qui sommes-nous | Page storytelling sur les fondatrices et l'origine du projet. | MH |
| Comment ca fonctionne | Explication du parcours cote famille et cote professionnel. | MH |
| Pages SEO professionnels | Fiches publiques brandables et indexables, sous reserve du choix produit. | SH |
| Page partenaires | Mise en avant de partenaires de la marque. | CH |

### B. Authentification et comptes

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Inscription famille | Creation d'un compte famille avec informations de contact et contexte de base. | MH |
| Inscription professionnel | Creation d'un compte professionnel avec profil declaratif et preferences de mission. | MH |
| Onboarding paiement pro | Creation d'un compte Stripe Connect pour permettre les versements. | MH |
| Connexion/deconnexion | Authentification securisee, redirection selon le role. | MH |
| Mot de passe oublie | Parcours de reinitialisation par email. | MH |
| Acceptation CGU/RGPD | Validation et horodatage du consentement. | MH |
| Declaration sur l'honneur | Declaration du professionnel concernant l'exactitude des informations fournies et ses obligations legales/fiscales. | MH |

### C. Profils utilisateurs

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Profil professionnel | Fiche detaillee: type de profil declare, zone, disponibilites, preferences d'age des enfants, bio. | MH |
| Tarification automatique | Tarif affecte automatiquement selon le profil declare ou les regles definies par la plateforme. NON roulette entre 100 et 300€ | MH |
| Profil famille | Coordonnees, contexte familial et historique des demandes. | MH |
| Modification de profil | Possibilite pour les utilisateurs de tenir leurs informations a jour. | MH |
| Gestion admin des comptes | Consultation, activation, suspension ou reactiver un compte sans controle documentaire de qualification. AVEC contrôle | MH |

### D. Demandes et mise en relation

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Publication de demande | La famille cree une demande: date, horaire, nombre/age des enfants, contexte, localisation. | MH |
| Liste des demandes | Le professionnel parcourt les demandes correspondant a ses criteres. | MH |
| Positionnement | Le professionnel se positionne sur une demande; nombre de reponses plafonne. Nombre de réponses non plafonnées dans un premier temps le temps que la plateforme fonctionne  | MH |
| Selection | La famille valide un professionnel et confirme la reservation. | MH |
| Reouverture annonce | Une demande peut etre republiee si aucune reponse ne convient. | MH |
| Contact recurrent | Retrouver et recontacter un professionnel deja rencontre. | MH |

### E. Messagerie

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Messagerie interne | Echanges entre famille et professionnel autour d'une demande.  **Message automatique envoyé par Berceo dans la messagerie du parent et du professionnel : L'équipe Berceo vous souhaite une excellente garde \! 🤍** N'hésitez pas également à confirmer ensemble les derniers détails pratiques (heure d'arrivée, adresse, accès au domicile, besoins particuliers du bébé, etc.). Nous vous souhaitons une belle expérience et une garde en toute sérénité \!  | MH |
| Historique | Acces aux conversations passees liees aux demandes. | MH |
| Notifications | Alerte email lors d'un nouveau message ou évènement important. | MH |
| Lu/non lu | Etat de lecture pour prioriser les conversations. | MH |

### F. Validation de mission

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Statuts mission | Demande ouverte, attribuee, a venir, en cours, terminee, annulee. | MH |
| Debut de mission | Mecanisme simple de confirmation du demarrage, par code ou action de validation. Payé sur place donc plus besoin de dire que ça a démarré et que c’est fini  | NON |
| Cloture de mission | Validation de fin de mission cote parent avant transfert au professionnel. | MH |
| Fenetre de contestation | Delai ou action permettant de signaler un probleme avant versement definitif. | SH |
| Rappel cadre plateforme | Rappel des conditions d'utilisation au moment des étapes clés. | SH |

### G. Avis et qualite interne

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Retour post-mission | Recueil d'un retour simple apres mission, cote famille et professionnel. Uniquement des étoiles sur 3-4 critères. Pas d’avis rédigés | MH |
| Note interne | Evaluation non publique visible uniquement par l'administration. Plus tard  | SH |
| Suivi qualite | Tableau de suivi permettant d'identifier les comptes problematiques. Plus tard | SH |

### H. Administration

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Tableau de bord admin | Vue d'ensemble: demandes actives, missions, paiements, comptes recents. | MH |
| Gestion utilisateurs | Recherche, consultation, suspension et reactiver un compte. | MH |
| Suivi des paiements | Consultation des paiements, remboursements, transferts et commissions. | MH |
| Gestion des retours | Consultation des retours et notes internes. | SH |
| Gestion contenu vitrine | Mise a jour de certains contenus sans intervention technique. | CH |

### I. Paiement et versement

| Fonctionnalite | Description | Priorite |
| :---- | :---- | :---: |
| Paiement de la mission | La famille regle le montant de la mission a la reservation. NON, uniquement frais de service  | MH |
| Commission plateforme | Prelevement d'une commission definie sur chaque transaction. | MH |
| Transfert au professionnel | Montant professionnel transfere apres validation de la mission, sous reserve des delais Stripe. NON, en direct après la nuit au domicile  | MH |
| Remboursement | Remboursement total ou partiel en cas d'annulation selon les regles definies. Pas de remboursements sauf frais de service quand les pro annulent | MH |
| Recu et historique | Recus et historique des transactions pour les utilisateurs. | SH |
| **Precision paiement**La formulation recommandee est: paiement encaisse a la reservation, puis transfert differe au professionnel apres validation de mission. Un blocage carte de longue duree ou un sequestre juridiquement strict ne doit pas etre promis sans validation prealable du prestataire de paiement et du conseil juridique. NON |  |  |

## Exigences specifiques

* Notifications email sur les evenements cles: inscription, nouvelle reponse, attribution, message, annulation, validation, ~~paiement~~.  
* Standardisation possible des tarifs selon le profil declare du professionnel. Roulette entre 100 et 300€  
* Compte Stripe Connect valide obligatoire pour recevoir des versements. Uniquement frais de service   
* Acceptation des CGU/RGPD et declaration sur l'honneur conservees avec horodatage.  
* ~~Aucun controle documentaire des diplomes/certificats n'est realise dans cette version.~~ Contrôle \! 

# 2\. Flux utilisateurs

Les user stories ci-dessous remplacent le backlog initial pour cette version ~~sans controle documentaire des diplomes professionnels.~~ AVEC

## A. Vitrine et contenu public

| ID | Prio | User story |
| :---- | :---: | :---- |
| A-01 | MH | En tant que visiteur, je veux acceder a une page d'accueil presentant le concept, afin de comprendre rapidement le service. |
| A-02 | MH | En tant que visiteur, je veux voir deux parcours distincts famille et professionnel, afin de m'orienter vers le bon espace. |
| A-03 | MH | En tant que visiteur, je veux consulter une page Qui sommes-nous, afin de connaitre l'histoire et les fondatrices. |
| A-04 | MH | En tant que visiteur, je veux consulter une page Comment ca fonctionne, afin de comprendre le deroulement d'une garde. |
| A-05 | SH | En tant que visiteur, je veux consulter des fiches publiques de professionnels, afin de decouvrir des profils avant inscription. NON uniquement quand ils ont payé l’abonnement  |

## B. Authentification et comptes

| ID | Prio | User story |
| :---- | :---: | :---- |
| B-01 | MH | En tant que parent, je veux creer un compte famille, afin d'acceder a la plateforme. |
| B-02 | MH | En tant que professionnel, je veux creer un compte, afin de proposer mes disponibilites. |
| B-03 | MH | En tant que professionnel, je veux declarer mon profil et mes preferences, afin que les demandes pertinentes me soient proposees. Juste la localisation \! |
| B-04 | MH | En tant que professionnel, je veux creer mon compte de paiement Stripe Connect, afin de recevoir mes versements. NON, tout se fait au domicile après la nuit |
| B-05 | MH | En tant qu'utilisateur, je veux me connecter, me deconnecter et reinitialiser mon mot de passe. |
| B-06 | MH | En tant qu'utilisateur, je veux accepter les CGU et la politique RGPD a l'inscription. |
| B-07 | MH | En tant que professionnel, je veux declarer sur l'honneur l'exactitude des informations fournies et le respect de mes obligations. |

## C. Profils utilisateurs

| ID | Prio | User story |
| :---- | :---: | :---- |
| C-01 | MH | En tant que professionnel, je veux completer ma fiche: profil declare, zone, disponibilites, bio et preferences. Juste pas de préférence pour le moment |
| C-02 | MH | ~~En tant que professionnel, je veux voir le tarif applique a mon profil, afin de connaitre ma remuneration previsionnelle.~~ Pas de tarif prévisionnel \! roulette entre 100 et 300€ la nuit |
| C-03 | MH | ~~En tant que systeme, je veux affecter automatiquement un tarif selon les regles definies par la plateforme.~~ |
| C-04 | MH | En tant que parent, je veux completer mon profil famille, afin de faciliter la mise en relation. |
| C-05 | MH | En tant qu'utilisateur, je veux modifier mes informations, afin de les tenir a jour. |
| C-06 | MH | En tant qu'administrateur, je veux consulter et suspendre un compte si necessaire, AVEC controle documentaire de qualification.  |

## D. Demandes et mise en relation

| ID | Prio | User story |
| :---- | :---: | :---- |
| D-01 | MH | En tant que parent, je veux creer une demande de garde avec date, horaire, enfants, contexte et localisation. |
| D-02 | MH | En tant que parent, je veux publier, modifier ou annuler une demande tant qu'elle n'est pas attribuee. |
| D-03 | MH | En tant que professionnel, je veux consulter les demandes correspondant a mes critères. |
| D-04 | MH | En tant que professionnel, je veux me positionner sur une demande. |
| D-05 | MH | En tant que parent, je veux comparer les professionnels positionnes et en sélectionner un. |
| D-06 | MH | En tant que systeme, je veux fermer la demande une fois attribuée/confirmée. |
| D-07 | MH | En tant que parent, je veux retrouver les professionnels déjà rencontres afin de les recontacter. Historique OUI |

## E. Messagerie

| ID | Prio | User story |
| :---- | :---: | :---- |
| E-01 | MH | En tant qu'utilisateur, je veux echanger des messages autour d'une demande. |
| E-02 | MH | En tant qu'utilisateur, je veux consulter l'historique de mes conversations. OUI mais ils ne savent plus parler après la fin de la garde. Messagerie fermée  |
| E-03 | MH | En tant qu'utilisateur, je veux être notifie d'un nouveau message. Par mail aussi |
| E-04 | MH | En tant qu'utilisateur, je veux voir l'état lu/non lu de mes conversations. |

## F. Validation de mission

| ID | Prio | User story |
| :---- | :---: | :---- |
| F-01 | MH | ~~En tant que parent, je veux confirmer le debut et/ou la fin de mission.~~ NON |
| F-02 | MH | ~~En tant que professionnel, je veux suivre le statut de mes missions~~. NON |
| F-03 | MH | ~~En tant que systeme, je veux declencher le transfert apres validation de la mission, selon le flux Stripe retenu.~~ NON |
| F-04 | SH | ~~En tant que parent, je veux signaler un probleme avant versement definitif.~~ NON |
| F-05 | SH | ~~En tant qu'administrateur, je veux être alerte en cas de contestation.~~ A recevoir dans nos mails problèmes/ demande d’aide si contestation |

## G. Avis et qualite interne

| ID | Prio | User story |
| :---- | :---: | :---- |
| G-01 | MH | En tant que parent, je veux laisser un retour à la fin d'une mission. Etoiles mais pas de commentaires |
| G-02 | MH | En tant que professionnel, je veux laisser un retour sur le deroulement de la mission. Etoiles mais pas de commentaires |
| G-03 | MH | En tant qu'administrateur, je veux consulter les retours collectes. |
| G-04 | SH | En tant qu'administrateur, je veux attribuer une note interne non publique a un utilisateur. Plus tard  |

## H. Administration

| ID | Prio | User story |
| :---- | :---: | :---- |
| H-01 | MH | En tant qu'administrateur, je veux un tableau de bord recapitulatif de l'activite. |
| H-02 | MH | En tant qu'administrateur, je veux rechercher et consulter un utilisateur. |
| H-03 | MH | En tant qu'administrateur, je veux suspendre ou reactiver un compte. |
| H-04 | MH | En tant qu'administrateur, je veux consulter les demandes, missions et modes paiements. |
| H-05 | SH | En tant qu'administrateur, je veux gerer certains contenus de la vitrine. |

## I. Paiement et versement

| ID | Prio | User story |
| :---- | :---: | :---- |
| I-01 | MH | ~~En tant que parent, je veux payer la mission par carte a la reservation~~. NON en direct à domicile  |
| I-02 | MH | En tant que systeme, je veux calculer la commission de la plateforme. |
| I-03 | MH | ~~En tant que systeme, je veux transferer le montant du professionnel apres validation de mission.~~ |
| I-04 | MH | En tant que parent, je veux etre rembourse en cas d'annulation selon les conditions prevues. Uniquement frais de services si annulation du pro  |
| I-05 | SH | En tant qu'utilisateur, je veux consulter mes recus et transactions. NON  |

# 3\. Besoins non fonctionnels

## Performance

* Pages publiques rapides et optimisees.  
* Listes paginees ou chargees progressivement.  
* Temps de réponse acceptable sur mobile.

## Securite

* Mots de passe haches et communications chiffrees HTTPS/TLS.  
* Cloisonnement strict des acces par role.  
* Données bancaires non stockees par la plateforme.  
* Journalisation des actions critiques d'administration et paiement.

## Disponibilite

* Sauvegardes regulieres.  
* Objectif de disponibilite eleve sans SLA contractuel en V1.

## Compatibilite

* Navigateurs recents: Chrome, Firefox, Safari, Edge.  
* Affichage responsive mobile, tablette et ordinateur.

## Localisation

* Interface bilingue FR/EN si retenue au perimetre du devis. Français uniquement, traduction plus tard   
* Architecture permettant l'ajout ulterieur d'autres langues.

## Conformite legale

* Conformite RGPD: consentement, droit d'acces, rectification et suppression.  
* CGU et politique de confidentialite fournies par le client ou ses juristes.  
* Cadre juridique du paiement, des remboursements et de la responsabilite à valider par le client.  
* ~~Absence de controle technique ou documentaire des qualifications professionnelles dans cette version.~~

# 4\. Contraintes

## Contraintes technologiques

* Application web responsive; pas d'application mobile native en V1.  
* Données hebergees en Europe dans la mesure du possible.  
* Paiement via Stripe/Stripe Connect selon faisabilite et validation juridique.  
* Charte graphique et logo fournis par le client.

## Contraintes budgetaires

* Le perimetre MH constitue le socle prioritaire.  
* Les elements SH et CH sont arbitrables selon le budget retenu.  
* Toute fonctionnalite non mentionnee dans le perimetre est exclue sauf avenant.

## Contraintes temporelles

* Planning a confirmer apres validation du perimetre final.  
* Démarrage conditionne a la reception des contenus, de la charte graphique, du logo et des validations juridiques necessaires.

# 5\. Utilisateurs et roles

## Famille

Parent de nouveau-ne ou nourrisson cherchant une garde de nuit en post-partum. La famille publie des demandes, selectionne un professionnel, communique, paie la mission et confirme sa realisation.

## Professionnel

Professionnel ou intervenant inscrit sur la plateforme, avec profil declaratif. Il renseigne ses informations, ses disponibilites et ses preferences, se positionne sur des demandes, communique avec les familles, realise les missions et recoit ses versements apres validation.

## Administrateur

Equipe fondatrice ou gestionnaire de la plateforme. L'administrateur supervise les utilisateurs, demandes, missions, paiements, remboursements, retours et suspensions de comptes.

# 6\. Donnees

## Types de donnees traitees

* Données d'identification: nom, prenom, email, telephone, adresse ou zone.  
* Données de profil: type de profil declare, preferences, disponibilites, bio.  
* Données de demande: dates, horaires, nombre et age des enfants, contexte, localisation.  
* Données de mission: statut, validation, annulation, retours.  
* Données de transaction: montants, commissions, references Stripe, remboursements.  
* Données de consentement: version des CGU acceptee et horodatage.

## Stockage

* Base de donnees relationnelle pour les donnees structurees.  
* Stockage securise des donnees applicatives.  
* Aucune donnée bancaire conservee sur la plateforme.  
* Aucun stockage de documents de diplomes/certificats dans cette version.

## Conformite

* Finalite, minimisation et durees de conservation a definir.  
* Gestion des demandes d'acces/suppression selon RGPD.  
* Responsabilite et obligations professionnelles a cadrer dans les CGU.

# 7\. Reporting et administration

* Suivi des utilisateurs actifs et suspendus.  
* Suivi des demandes ouvertes, attribuees, annulees et terminees.  
* Suivi des paiements, commissions, transferts et remboursements.  
* Consultation des retours post-mission et notes internes.  
* Gestion des contestations selon le flux retenu.

# 8\. Hors perimetre et evolutions futures

## Hors perimetre de cette version

* Controle documentaire des diplomes, certificats ou attestations professionnelles. DANS le périmètre  
* Validation manuelle des qualifications professionnelles a partir de documents justificatifs. DANS le périmètre  
* Verification legale/fiscale automatisee des professionnels. Itsme ?  
* Application mobile native.  
* Publication d'avis publics, sauf decision specifique. C’est-à-dire    
* Statistiques avancees, scoring automatise ou automatisations de moderation avancees.  
* Redaction juridique des CGU, politique de confidentialite ou contrats.

## Evolutions futures identifiees

* Controle documentaire ou validation renforcee des profils professionnels. Maintenant \!  
* Application mobile native.  
* Gardes de jour ou d'apres-midi.  
* Ouverture geographique au-dela de la Belgique.  
* Avis publics sur les fiches professionnels.  
* Administration avancee des commissions, remboursements et regles de matching.

# 9\. Hypotheses de travail

* Le logo, la charte graphique et les contenus de marque sont fournis par le client.  
* Les textes juridiques sont fournis ou valides par les juristes du client.  
* Le modele de paiement final est confirme avant developpement de l'integration Stripe.  
* Le controle documentaire des diplomes n'est pas attendu dans cette version et necessitera un avenant s'il est reintegre. Est attendu 

1) Abonnement des familles souhaité d’emblée 

Exemple :   
Abonnement découverte 1 mois (…€)  
Abonnement parenthèse 3 mois (…€)  
Abonnement sérénité 6 mois (…€)  
Abonnement premium 1 an (…€)

2) Abonnement des pro souhaité à l’année (petit montant) 

3) Cartes cadeaux à offrir souhaitée 

A discuter avec vous 

4) Conditions d’annulation à discuter avec vous   
5) Page d’accueil on voudrait montrer quelques profils pour donner envie aux parents 

