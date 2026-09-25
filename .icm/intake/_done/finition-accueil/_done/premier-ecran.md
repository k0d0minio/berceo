# Stub: The first screen — header and hero within their boxes

- feature-slug: premier-ecran
- scope: finition-accueil
- personas: parent, professionnel
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: encres-contraste
- sequence: 2 of 3
- complexity: medium
- recommended-model: sonnet

## Problem

The first screen looks cramped. At 1440 px two nav links wrap onto two lines. The 88-character H1 at 60 px in half the page runs 6 lines on desktop and 8 on a tablet. Between 768 and about 900 px, "professionnelles" is wider than its column and slides under the photo. The photo floats mid-height beside a text column twice its size, with white bands above and below it.

## Proposed change

Lay out the header and the hero so the words fit the space they are given, keeping every word. Each nav link stays on one line wherever the full nav shows. The hero's text column gets the width the H1 needs: a wider column, a later two-column breakpoint, or both. The H1 wraps in balanced lines, and the photo sits aligned to the text block. The same rule applies to the inner pages' header (`PageHeader`), which uses the same two-column pattern.

## Acceptance criteria (rough)

- [ ] Every header nav link sits on one line at every width where the full nav shows (1024–1920 px).
- [ ] The hero H1 takes at most 4 lines at 1280 and 1440 px, and never overflows its column from 320 to 1920 px (checked at 320, 390, 768, 820, 1024, 1280, 1440, 1920).
- [ ] The H1 stays within the DA's scale: 56–64 px on desktop, 38–44 px on mobile.
- [ ] The intro line is at most 75 characters a line.
- [ ] No empty band taller than the photo's own margin sits above or below the hero photo at 1024 px and up.
- [ ] On a 390 × 844 phone the first screen still shows the H1, the intro and both doors, as today.
- [ ] The inner pages' header follows the same rule on `/comment-ca-marche`, `/tarifs` and `/faq`.

## Out of scope (this feature)

- Any word, including the H1 (D-5).
- Colours (encres-contraste).
- The bands below the hero (blocs-accueil).

## Notes for Define

- D-4: the fix goes in the shared components. D-5: no word changes. D-6: H1 at most 4 lines at 1280 and 1440, never overflowing from 320 to 1920, within 56–64 / 38–44 px.
- Open: the header between 1024 and 1440 px. Either show the full nav from a wider breakpoint, or tighten it (`whitespace-nowrap`, smaller gaps) so it fits from `lg`.
- `text-wrap: balance` on the H1 is a cheap first step. It does not fix the overflow on its own.
- touches: src/components/shell/public-header.tsx, src/app/(public)/page.tsx (the hero section), src/components/vitrine/page-header.tsx, src/components/vitrine/cta-pair.tsx, src/app/globals.css (only if a type token moves).
