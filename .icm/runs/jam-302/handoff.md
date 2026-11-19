# Handoff jam-302

## Next action

L'opérateur répond aux questions Q1 à Q5 sur la carte du HUD ou dans le corps de la pull request #134. Puis il dit `new JAM-302`. La session lance `questions.sh JAM-302`, met les réponses dans `spec.md` et lance `new-run.sh JAM-302 --refresh-body`. Puis l'opérateur coche Spec approved sur #134 et dit `build JAM-302`.

## How to test

Sur la preview, une famille publie des nuits régulières, une professionnelle répond une fois, la famille paie un seul Checkout. Toutes les nuits apparaissent comme gardes confirmées avec cette professionnelle.

## Blockers

- Cinq questions attendent une réponse (Q1 à Q5, corps de #134).
- Spec approved n'est pas coché. Build ne commence pas avant.
- La release demande `migrate-production.yml` avant `promote.sh run` (`.icm/local/database.md`).

## Do not touch

- JAM-303 suit ce ticket sur le même formulaire et le même modèle. Ne pas commencer JAM-303 avant le merge de ce ticket.
