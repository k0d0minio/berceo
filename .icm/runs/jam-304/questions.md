### Q1. La formule une nuit est-elle un paiement unique ou un paiement récurrent ?
- type: single
- options: paiement unique pour une réservation | abonnement récurrent | autre
- default: un paiement unique de 14,75 EUR (Checkout en mode `payment`), qui ouvre l'accès pour une réservation. Question ouverte avec la cliente jusqu'à l'appel du 20 nov. 2026 : la réponse de cet appel remplace ce défaut.
- answer: paiement unique pour une réservation

### Q2. Qu'ouvre la formule une nuit dans `familyMay` ?
- type: single
- options: comme la plus petite formule, pour une réservation | moins que la plus petite formule | autre
- default: les mêmes actions que la plus petite formule (Découverte), pour une réservation. Après la réservation, l'accès se ferme à la fin de la garde réservée. `ecrire` reste ouvert sur la conversation de la réservation, comme aujourd'hui.
- answer: comme la plus petite formule, pour une réservation

### Q3. Qui crée les codes promo ?
- type: single
- options: les fondatrices dans le tableau de bord Stripe | un écran de codes dans Berceo
- default: les fondatrices, dans le tableau de bord Stripe. Berceo n'a pas d'écran de codes. Le Checkout accepte les codes (`allow_promotion_codes`).
- answer: un écran de codes dans Berceo

### Q4. Quand finit une formule une nuit payée sans réservation ?
- type: single
- options: elle reste ouverte jusqu'à une réservation | elle finit après un délai que Jamie donne
- default: elle reste ouverte jusqu'à une réservation, sans date de fin. Le ticket ne donne pas de délai, et la session n'invente pas de terme commercial.
- answer: elle reste ouverte jusqu'à une réservation
