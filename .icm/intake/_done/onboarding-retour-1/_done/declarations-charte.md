# Stub: A professional accepts the charter and the new declarations

- feature-slug: declarations-charte
- epic: onboarding-retour-1
- sequence: 4 of 10
- depends-on: none
- complexity: medium
- priority: P1

## Problem

Step 4 holds five declarations under the wording of the cahier des charges. The founders want the
criminal-record sentence to start with « Je déclare et certifie », a sixth declaration on a change
of situation, and the « Charte des professionnelles Berceo » (17 commitments and « L'engagement
Berceo ») read and accepted with its own checkbox.

## Proposed change

The criminal-record declaration reads « Je déclare et certifie que mon extrait de casier
judiciaire destiné aux activités avec des mineurs est vierge. » A sixth declaration reads « Je
m'engage à avertir directement Berceo de tout changement de ma situation qui m'empêcherait de
travailler sur la plateforme. » The charter is shown in full on step 4, in its 17 numbered
sections and « L'engagement Berceo », followed by the checkbox « J'ai lu et compris la Charte des
professionnelles Berceo et je m'engage à la respecter. » The charter is also a public page,
`/charte-des-professionnelles`. The declarations get a new wording version. A professional whose
declarations carry the old version is sent to step 4 at her next sign-in, re-accepts, and her
profile keeps its state.

## Acceptance criteria

- [ ] Step 4 shows the six declarations and the charter, and the file cannot be sent without the seven checkboxes.
- [ ] The two sentences read as written above, and the charter text matches the founders' document word for word, except the punctuation named in Notes.
- [ ] `/charte-des-professionnelles` shows the charter in full.
- [ ] A validated professional with the old wording version is sent to step 4 at sign-in, accepts, and stays `valide`.
- [ ] Each acceptance is stored with the new version and a timestamp.
- [ ] The migration adds the enum values.

## Out of scope

- The parents' button (`charte-cote-parents`).
- A signed PDF of the charter.

## Notes

- Questions, with a default each:
  1. Re-acceptance by validated professionals. Default: yes, at the next sign-in, before her
     space opens.
  2. Is the public page indexed? Default: yes, with a title and a meta description within the
     limits.
- The charter has em dashes and ellipses nowhere, but it has « ' » apostrophes in two forms and
  one « (e) ». Keep the founders' text. Tag the whole block `@relecture Surya — texte des
  fondatrices`.
- `DECLARATIONS_VERSION` becomes `feedback-2026-10-23`. Two new values in the `declaration` enum:
  `changement_de_situation`, `charte`.
- Files: `src/db/schema.ts`, `drizzle/`, `src/lib/professionnelle/rules.ts`,
  `src/lib/auth/` (the redirect at sign-in), `src/app/(portail)/espace/professionnelle/inscription/declarations/page.tsx`,
  `src/app/(public)/charte-des-professionnelles/`, `src/content/professionnelle.ts`, a new
  `src/content/charte.ts`, `src/app/sitemap.ts`.
