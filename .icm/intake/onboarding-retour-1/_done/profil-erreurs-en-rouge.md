# Stub: A professional sees in red the field that blocks « Continuer »

- feature-slug: profil-erreurs-en-rouge
- epic: onboarding-retour-1
- sequence: 6 of 10
- depends-on: none
- complexity: low
- priority: P2

## Problem

When « Continuer » blocks on a step of the sign-up, the professional does not find why. The
founders want the blocking field marked in red.

## Proposed change

On each step, every field that blocks gets a red border and its message in red under it. The page
scrolls to the first blocking field and gives it focus. A short line above the button says how
many fields block. The same rule applies to the profile edit page and to the family's forms that
share the field components.

## Acceptance criteria

- [ ] On step 2, submitting with an empty profession marks the profession field in red with its message, and the page scrolls to it.
- [ ] Each blocking field on steps 2, 3 and 4 is marked the same way.
- [ ] The line above the button names the number of fields that block.
- [ ] The contrast test in `src/app/contrast.test.ts` passes with the error red.

## Out of scope

- New validation rules.

## Notes

- D-24 keeps red for the confirm dialogs. The feedback adds it for form errors. Use the darkened
  red the dialogs use, held to AA by the contrast test.
- Files: `src/components/ui/` (the field and message components), `src/app/globals.css` if a
  token is needed, `src/app/(portail)/espace/professionnelle/inscription/`,
  `src/content/professionnelle.ts`.
