# Handoff jam-582

## Cause

The public layout does not read the session. Three links of the family and professional spaces opened a public page, which shows the public header as signed out.

## Links at fault

1. The footer of each space (family and professional): « CGU » went to `/conditions-generales`, « Politique de confidentialité » went to `/confidentialite`. JAM-301 added this footer.
2. The family's home: « Consultation sommeil avec Alix et Jordane » went to `/consultation-sommeil`. The link shows only where `SLEEP_CONSULTATION_URL` is set.
3. The family's search without a subscription: each teaser card went to `/professionnelles/<slug>`.

The charter link of the family's home was correct already (JAM-301, `/espace/famille/charte`). The logo and the menu of a space go to the space's home. No guard and no server action sends a user to `/`.

## Correction

- The footer links to `/espace/famille/…` or `/espace/professionnelle/…` (`legalPath`, `src/lib/legal/paths.ts`). The pages are in `src/app/(portail)/espace/legal-page.tsx`. The founders' back-office keeps the public pages.
- The family's home links to `/espace/famille/consultation-sommeil`: the same words and calendar, in the signed-in shell. After a booking, the one button goes to her space.
- The teaser card links to `/espace/famille/professionnelles/<id>`. Without a subscription, that page shows the public teaser (no photo, no rate) and the invitation line. Before, it showed the invitation line only.

## Conversation title (AC-2)

No change. The title is the H1 of the page. `.font-display` writes it in capitals (`src/app/globals.css`): « CONVERSATION AVEC ALIX, SAGE-FEMME » for the family. The text stays « Conversation avec Alix, Sage-femme » (JAM-345, decision of J, 2026-11-20).

## Reproduction (AC-3)

The local dev server could not render a page in this session: the sandbox has no network, so the Google font and Neon did not answer (HTTP 500). No seed account for `local/bursts` is written in the repo. The fault is shown from the code: `src/app/(public)/layout.tsx` always renders `PublicHeader`, whose logo and « Accueil » go to `/`. On localhost, each new page of a space sent a signed-out visitor to `/connexion` with the way back (HTTP 307).

## Next action

The operator tests on the preview with a family account and a professional account.

## How to test

Sign in as a family and click « CGU » and « Politique de confidentialité » at the bottom of the page: the menu of your space stays. Without a subscription, search your commune and open a card: the profile and the invitation show in your space. Do the footer check again as a professional.

## Blockers

- none

## Do not touch

- none
