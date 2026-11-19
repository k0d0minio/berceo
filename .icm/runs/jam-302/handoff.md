# Handoff jam-302

## Next action

L'opérateur teste la preview de #134, puis coche Ready to merge et dit `release JAM-302`. La release de production demande `migrate-production.yml` avant `promote.sh run` (`.icm/local/database.md`).

## How to test

Une famille publie des nuits régulières : une seule demande apparaît. Une professionnelle de la zone répond une fois pour toutes les nuits. La famille accepte, paie un seul Checkout de 3 % du total, et chaque nuit devient une garde confirmée avec cette professionnelle.

## Criteria

- Critère 5 (règles : frais du total, toutes les nuits ou aucune, conflit avec une garde) : rempli par CI vert (`splitShare`, `splitTakes`, `seriesAnswerState`, `groupForProfessional`).
- Critère 6 (pas de modification après la première réponse) : le code refuse côté serveur (`neverAnswered` dans `updateRequest`, `answersEver` sur les pages). CI vert. Pas de test de base de données dédié.
- Critère 8 (texte du formulaire, `@relecture`) : rempli par CI vert (`vitrine.test.ts`).
- Critère 9 (migration) : rempli. CI applique toutes les migrations depuis zéro.
- Critères 1, 2, 3, 4, 7, 10 : `verify: operator`, sur la preview.

## Choices to check

- Q1 : un seul Checkout, une ligne `payments` par nuit sur la même session Stripe. Le crédit Berceo est réparti sur les nuits.
- La conversation d'une demande régulière est sur la réponse de la dernière nuit : elle reste ouverte jusqu'à la fin de la dernière nuit. Si la garde de la dernière nuit est annulée, la conversation se ferme.
- Une demande régulière n'est jamais republiée, envoyée en priorité après sa publication, ni annulée nuit par nuit avant la réservation.
- Le profil complet d'une professionnelle n'offre pas « Accepter et réserver » pour une demande régulière : la famille réserve depuis la page de la demande.
- Le refus d'une professionnelle non retenue part une fois par demande régulière, avec la première nuit dans l'e-mail.
- Un remboursement fait dans le tableau de bord Stripe sur une session de plusieurs nuits n'est pas enregistré automatiquement : il est journalisé, les fondatrices le traitent à la main.

## Blockers

- Ready to merge n'est pas coché.

## Do not touch

- JAM-303 suit ce ticket sur le même formulaire et le même modèle. Ne pas commencer JAM-303 avant le merge de ce ticket.
