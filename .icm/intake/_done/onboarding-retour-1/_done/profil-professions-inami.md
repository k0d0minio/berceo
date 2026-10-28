# Stub: A student names her year, and no midwife is blocked by the INAMI number

- feature-slug: profil-professions-inami
- epic: onboarding-retour-1
- sequence: 1 of 10
- depends-on: none
- complexity: medium
- priority: P1

## Problem

The profession list has one entry « Étudiante sage-femme (3e ou 4e année) ». The founders want
two: third year and fourth year. The INAMI number is required for midwives and nurses, and the
step blocks without it. Not every midwife has one, so it must never block.

## Proposed change

The profession list offers « Étudiante sage-femme, 3e année » and « Étudiante sage-femme, 4e
année » in place of the one entry. Both stay gated by the students switch (D-7) and both ask for
the attendance certificate. Midwives, nurses and childcare workers upload their diploma, as
today. The INAMI field stays on step 3 for midwives and nurses, labelled as optional, and an
empty field no longer blocks the step. A filled field keeps the eleven-digit check. The founders'
queue shows the year of a student and « INAMI non renseigné » when empty.

## Acceptance criteria

- [ ] The profession list shows five entries, the two student years last, and the switch hides both when students are not admitted.
- [ ] A midwife submits her file with the INAMI field empty and her file reaches `en_attente`.
- [ ] A filled INAMI field with other than eleven digits is refused at the field.
- [ ] Each student year asks for the attendance certificate, the three professions for the diploma.
- [ ] The migration renames the old value to the third year and adds the fourth year.
- [ ] `src/lib/professionnelle/rules.test.ts` covers the two years and the optional INAMI.

## Out of scope

- Any other document, and the identity check (D-5).

## Notes

- Question, with a default: existing `etudiante_sage_femme` rows. Default: migrate to
  `etudiante_sage_femme_3e` and let the founders correct the year in the queue.
- Drizzle adds enum values and cannot drop one. Decided at Spec approved (2026-10-28): rename the old value to `etudiante_sage_femme_3e` and add `etudiante_sage_femme_4e`. Postgres refuses a new enum value in the transaction that adds it, so an UPDATE cannot follow an ADD VALUE in one run.
- `REQUIREMENTS[profession].inami` becomes `"optional"` for midwives and nurses and `false` for
  the others. The field label gets « (facultatif) ».
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/professionnelle/rules.ts`,
  `src/app/(portail)/espace/professionnelle/inscription/`, `src/lib/admin/review.ts`,
  `src/content/professionnelle.ts`, `src/content/admin.ts`, the public card in
  `src/components/recherche/`.
