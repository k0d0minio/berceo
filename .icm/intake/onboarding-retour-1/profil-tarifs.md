# Stub: A professional sets her night rate from 130 € and her rate for an extra hour

- feature-slug: profil-tarifs
- epic: onboarding-retour-1
- sequence: 3 of 7
- depends-on: none
- complexity: medium
- priority: P1

## Problem

The night rate must sit between 100 and 300 € (D-4). The founders want a minimum and no maximum.
The answers set the floor at 130 € and Jamie confirmed it on 2026-10-23. A night can run past
11 hours, and the professional must price the extra hour.

## Proposed change

« Mon tarif de nuit » accepts any whole amount from 130 €, with no ceiling. A new required field
« Mon tarif par heure supplémentaire » accepts any whole amount from 1 €. Both show on her
profile, her public page, the answer card and the booking, where the family reads the night rate
for 11 hours and the hourly rate for each extra hour. The database check moves to the floor. The
vitrine's words that name 100 € and 300 € change to « à partir de 130 € ».

## Acceptance criteria

- [ ] A rate of 129 € is refused at the field, 130 € and 450 € are accepted.
- [ ] The hourly rate is required to complete step 2 and shows on her profile and her public page.
- [ ] The booking page of both sides shows the night rate and the hourly rate.
- [ ] No page of the vitrine says « 100 € » or « 300 € » any more, and `src/content/vitrine.test.ts` allows 130 €.
- [ ] The migration changes the check and adds the hourly rate column, and existing rates under 130 € are raised to 130 €.

## Out of scope

- The extra hours on the request (`demande-retour-1/demande-heures-supplementaires`).
- A suggested rate or a rate per profession (D-4 keeps no automatic tariff).

## Notes

- Questions, with a default each:
  1. Existing rates under 130 €. Default: raised to 130 € by the migration. UAT holds test data.
  2. Is the hourly rate required? Default: yes, since a request can carry extra hours.
- `tarifs-abonnements` in `vitrine-retour-1` also edits `src/content/vitrine.test.ts`. The stub
  that ships second adapts to the first.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/professionnelle/rules.ts` (`RATE_MIN`,
  `RATE_MAX` removed), `src/app/(portail)/espace/professionnelle/inscription/profil/page.tsx`,
  `src/lib/recherche/professionals.ts`, `src/components/recherche/`,
  `src/components/reservations/`, `src/content/professionnelle.ts`, `src/content/tarifs.ts`,
  `src/content/faq.ts`, `src/content/vitrine.test.ts`.
