# Spec: berceo · a regular request is published once and answered by one professional

- ticket: JAM-302
- touches: src/db/schema.ts, drizzle/, src/lib/demandes/, src/lib/reservations/, src/lib/paiements/, src/lib/gardes/, src/lib/messagerie/, src/components/reservations/, src/app/(portail)/espace/famille/demandes/, src/app/(portail)/espace/professionnelle/demandes/, src/app/(portail)/espace/famille/reservations/, src/app/api/webhooks/stripe/, src/content/demandes.ts, src/content/emails.ts
- complexity: complex

## Problem

Retour du 12 novembre (round 2) : quand une famille coche « Nuits régulières », le formulaire dit « Chaque nuit devient une demande et les professionnelles répondent nuit par nuit. » (`src/content/demandes.ts`). Les fondatrices veulent une demande régulière publiée une fois, avec **une seule professionnelle** qui y répond. La famille ne doit pas recevoir quatre personnes différentes.

Le même retour fixe le cycle de vie : modifier seulement tant qu'aucune professionnelle n'a répondu ; annuler tant qu'aucune réservation n'est confirmée, et les professionnelles qui ont répondu sont prévenues ; après la confirmation, les conditions d'annulation de la garde s'appliquent ; pour changer une demande après des réponses, la famille l'annule et en fait une nouvelle.

Règle remplacée (décision de Jamie du 2026-11-18 : la demande du client gagne) : la spec demande-nuits-regulieres, « une demande par nuit, chaque nuit garde ses réponses et sa réservation » (commentaire de `seriesId` dans `src/db/schema.ts`, `src/lib/demandes/series.ts`).

## Proposed change

**Pour la famille.** Elle coche « Nuits régulières », choisit ses nuits et publie. Elle voit une seule demande dans « Mes demandes », avec toutes ses nuits. Le texte du formulaire ne dit plus que chaque nuit devient une demande. Tant qu'aucune professionnelle n'a répondu, elle peut modifier la demande. Après la première réponse, le bouton de modification disparaît, et une phrase lui dit d'annuler et de publier une nouvelle demande. Elle peut annuler la demande entière tant qu'aucune réservation n'est confirmée. Chaque professionnelle qui a répondu reçoit alors un message.

**Pour la professionnelle.** Elle voit la demande régulière une fois dans sa liste et dans le récapitulatif quotidien, avec toutes ses nuits. Elle répond à la demande entière (« Je suis disponible ») : toutes les nuits ou aucune. Si elle a déjà une garde confirmée une de ces nuits, elle ne peut pas répondre (Q5).

**L'acceptation.** La famille retient une réponse. Elle paie les frais de service de 3 % du total des nuits en un seul Checkout (Q1), un crédit Berceo compris. Le paiement confirme toutes les nuits avec cette professionnelle. Les autres réponses deviennent « non retenues ». Une seule conversation existe entre la famille et la professionnelle.

**Après la confirmation.** Chaque nuit reste une garde avec ses règles actuelles : rappel de la veille, annulation, absence, avis (Q2). Annuler une nuit rembourse la part des frais de cette nuit selon le tableau existant.

**Le modèle.** La migration ajoute une demande régulière comme un objet qui porte le statut, les réponses et le paiement. Les nuits restent des lignes qui portent la date et la garde. Build choisit la forme exacte des tables. La règle « une demande ouverte ou attribuée par nuit et par famille » reste vraie.

**La release.** Le ticket a une migration. La promotion en production demande `migrate-production.yml` avant `promote.sh run` (`.icm/local/database.md`).

## Acceptance criteria

- [ ] Une famille publie une demande régulière de plusieurs nuits. « Mes demandes » la montre comme une seule demande avec toutes ses nuits. (verify: operator)
- [ ] La liste de la professionnelle et le récapitulatif quotidien montrent cette demande une fois, avec toutes ses nuits. (verify: operator)
- [ ] La professionnelle répond une fois à la demande entière. Elle ne peut pas répondre à une seule nuit. (verify: operator)
- [ ] La famille retient une réponse et paie un seul Checkout de 3 % du total des nuits. Toutes les nuits deviennent des gardes confirmées avec cette professionnelle, et les autres réponses sont « non retenues ». (verify: operator)
- [ ] Les règles de calcul (montant des frais du total, réponse toutes les nuits ou aucune, conflit avec une garde confirmée) ont des tests unitaires qui passent. (verify: CI)
- [ ] Après la première réponse, la famille ne peut plus modifier la demande. Le bouton disparaît et l'action côté serveur refuse la modification. (verify: CI)
- [ ] La famille annule la demande avant une réservation confirmée. Chaque professionnelle qui a répondu reçoit un message. (verify: operator)
- [ ] Le formulaire ne dit plus « Chaque nuit devient une demande ». Chaque nouveau texte porte `@relecture Surya` et passe `src/content/vitrine.test.ts`. (verify: CI)
- [ ] La migration est dans `drizzle/` et s'applique sur la base de la preview sans erreur. (verify: CI)
- [ ] Les demandes déjà publiées nuit par nuit sur l'UAT s'affichent et fonctionnent comme avant (Q3). (verify: operator)

## Out of scope

- JAM-303 (le formulaire de demande) : il suit ce ticket, sur le même formulaire et le même modèle. Ce ticket ne change dans le formulaire que la phrase sur les nuits régulières.
- JAM-306 (un horaire adapté) : une professionnelle qui ne peut pas faire toutes les nuits exactement. Ce ticket accepte toutes les nuits ou aucune.
- La migration de production elle-même : c'est un acte de la release (`migrate-production.yml`).
- Le regroupement ou l'annulation des demandes déjà publiées nuit par nuit (défaut de Q3).
- Un changement des règles d'annulation, d'absence ou d'avis d'une garde.
- Toute écriture dans Linear.

## Open questions

- none

## Answers

- Q1 : un seul Checkout pour le total de toutes les nuits. Le formulaire disait « Un Checkout par nuit ». Jamie a corrigé dans le chat le 2026-11-19 : « One Checkout, all nights ».
- Q2 : les règles de garde existantes s'appliquent nuit par nuit.
- Q3 : les demandes déjà publiées nuit par nuit restent telles quelles.
- Q4 : la règle « modifier seulement avant la première réponse » s'applique à toutes les demandes.
- Q5 : une professionnelle qui a une garde confirmée une des nuits ne voit pas le bouton de réponse.
