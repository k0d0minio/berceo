# Stub: A professional writes her complementary trainings in her own words

- feature-slug: profil-formations-sans-experience
- epic: onboarding-retour-1
- sequence: 2 of 10
- depends-on: none
- complexity: low
- priority: P1

## Problem

Step 2 offers « Mes spécialisations » as a fixed list of six, and « Mon expérience » as four
bands. The founders want « Formations complémentaires » as a free field, because hundreds of
trainings exist, and no experience field, because it says everything and nothing.

## Proposed change

« Formations complémentaires » replaces « Mes spécialisations »: one optional text field, 300
characters at most, shown on her profile, on her public page and on the answer card where the
specialisations showed. « Mon expérience » leaves the form, the profile page, the public teaser,
the search card and the answer card. The schema drops the experience column and replaces the
specialisations array by one text column.

## Acceptance criteria

- [ ] Step 2 shows « Formations complémentaires » as a text field and no experience field.
- [ ] A profile saved with 300 characters of trainings shows them on her page, her public page and the answer card.
- [ ] No page, card or e-mail shows an experience band any more.
- [ ] The migration replaces the two columns, and existing profiles keep their other fields.
- [ ] `src/content/professionnelle.test.ts` and `recherche.test.ts` pass with the new words.

## Out of scope

- A list of suggested trainings.
- The rate and the zone (other stubs).

## Notes

- Existing `specialisations` values on UAT are test data. The migration drops them.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/professionnelle/rules.ts`,
  `src/app/(portail)/espace/professionnelle/inscription/profil/page.tsx`, `profil/page.tsx`,
  `src/lib/recherche/professionals.ts` (the column whitelist), `src/components/recherche/`,
  `src/components/reservations/`, `src/content/professionnelle.ts`, `src/content/recherche.ts`.
