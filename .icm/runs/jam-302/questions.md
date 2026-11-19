### Q1. Comment la famille paie-t-elle les frais de service de 3 % d'une demande régulière ?
- type: single
- options: Un seul Checkout pour le total de toutes les nuits | Un Checkout par nuit
- default: Un seul Checkout pour le total de toutes les nuits.
- answer: _waiting_

### Q2. Que se passe-t-il quand un côté annule une seule nuit d'une réservation régulière confirmée ?
- type: single
- options: Les règles de garde existantes s'appliquent nuit par nuit | L'annulation d'une nuit annule toute la réservation
- default: Les règles de garde existantes s'appliquent nuit par nuit. Le remboursement porte sur la part des frais de cette nuit.
- answer: _waiting_

### Q3. Que faire des demandes déjà publiées nuit par nuit sur l'UAT ?
- type: single
- options: Les laisser telles quelles | Les regrouper en une demande régulière | Les annuler
- default: Les laisser telles quelles. Elles gardent le comportement nuit par nuit jusqu'à leur fin.
- answer: _waiting_

### Q4. La règle « modifier seulement avant la première réponse » s'applique-t-elle aussi à une nuit ponctuelle ?
- type: single
- options: Oui, à toutes les demandes | Non, seulement aux demandes régulières
- default: Oui, à toutes les demandes. Le retour du 12 novembre décrit le cycle de vie d'une demande, pas seulement d'une demande régulière.
- answer: _waiting_

### Q5. Une professionnelle qui a déjà une garde confirmée une des nuits peut-elle répondre à la demande régulière ?
- type: single
- options: Non, elle ne voit pas le bouton de réponse | Oui, et la famille voit le conflit
- default: Non. Elle accepte toutes les nuits ou aucune (JAM-306 traite l'horaire adapté). Si elle est réservée ailleurs une de ces nuits après sa réponse, sa réponse est retirée.
- answer: _waiting_
