# Spec: The first screen within its boxes

- slug: premier-ecran
- personas: parent, professionnel
- touches: src/components/shell/public-header.tsx, src/app/(public)/page.tsx, src/components/vitrine/page-header.tsx, src/components/vitrine/photo.tsx, src/components/vitrine/cta-pair.tsx, src/app/globals.css (only if a type token moves)
- complexity: standard

## Problem

The first screen of the vitrine looks cramped, measured on uat.berceo.be on 2026-09-25 (scope finition-accueil). At 1440 px "Comment ça marche" and "Qui sommes-nous" wrap onto two lines in the header: the row of wordmark, four links and two capsules needs about 1,180 px and the `max-w-6xl` container gives it 1,088 px at most (960 px at 1024). The hero H1, 88 characters at 60 px, sits in half the row and runs 6 lines at 1440 and 8 at 820; between 768 and about 900 px "professionnelles" is wider than its column and slides under the photo. The photo is centred against a text column twice its height, which leaves white bands above and below it. The inner pages' `PageHeader` uses the same two-column pattern. This is the second of three stubs that bring the homepage to a finished state before the first usable version on uat.berceo.be (Plateforme Berceo V1, before December 2026, for a launch in January 2027): the families and professionals who hear the brand name land on this screen first, before either signs up.

## Proposed change

Colour and words are untouched; only layout and size move, in the shared components so every page that uses them gets the same fix (D-4, D-5).

**The header shows its full nav from 1280 px (xl).** Below 1280 px the menu button and its panel serve, as they do on tablets today, carrying the four pages and both account entries. From 1280 px the wordmark, the four links and the two capsules sit on one row, every link on one line (`whitespace-nowrap`), with the gaps and the capsules' horizontal padding tightened as far as the row needs to fit the page's existing `max-w-6xl` container, so the wordmark stays aligned with the content below. The nav keeps the DA's 18 px and the capsules keep their height and type. (Operator's choice, 2026-09-25: the row cannot fit 960 px at 1024 without shrinking below the DA's sizes.)

**The hero stacks below 1024 px and splits from 1024 px (lg), text first.** Below lg the text block (H1, intro, the two doors, the reassurance line) comes first and the photo follows it at its natural 16:9, as on a phone today; the H1 then has the full content width. From lg the row splits in two with the text column wider than the photo column, sized so the H1 takes at most 4 lines at 1280 and 1440 px (D-6). The H1 keeps the DA's scale, 56–64 px from md and 38–44 px below (D-6); the `--taille-h1` token stays at 60 / 40 px unless 4 lines cannot be reached at 60, in which case it moves to no lower than 56 px. The H1 wraps in balanced lines (`text-wrap: balance`). The intro is held to at most 75 characters a line (DA p. 13).

**The photo fills the text block's height from lg.** Its frame runs from the top to the bottom of the text block beside it, cropped with `object-cover` and keeping its 32 px radius, its object position set so the photograph's subject stays in frame. Below lg it keeps its 16:9 ratio. The image's `sizes` hint follows the new column width. (Operator's choice, 2026-09-25: fill over a top-aligned 16:9.)

**The inner pages' `PageHeader` follows the same rule** on `/comment-ca-marche` and `/tarifs` (which carry a photo): stacked below lg, two columns from lg with the text column wider, the photo filling the text block's height, the H1 balanced, the intro at most 75 characters a line. `/faq` (no photo) gets the balanced H1 and the intro measure.

**The two doors (`CtaPair`)** keep their order, labels and variants; they only wrap within the text column so neither capsule overflows it at any width.

## Acceptance criteria

- [ ] From 1280 to 1920 px the header shows the wordmark, the four links and both capsules on one row, and every link sits on one line (checked at 1280, 1440 and 1920).
- [ ] Below 1280 px the header shows the menu button, and its panel lists the four pages and both account entries (checked at 390, 1024 and 1279).
- [ ] The hero H1 takes at most 4 lines at 1280 and 1440 px.
- [ ] The hero H1 never overflows its column, and no page scrolls horizontally, at 320, 390, 768, 820, 1024, 1280, 1440 and 1920 px on `/`, `/comment-ca-marche`, `/tarifs` and `/faq`.
- [ ] The H1's computed size is 56–64 px from 768 px up and 38–44 px below, on the four pages.
- [ ] The hero's and `PageHeader`'s intro line is at most 75 characters a line at every width checked.
- [ ] At 1024 px and up, the hero photo's top and bottom edges line up with the text block's top and bottom (within 1 px), on `/`, `/comment-ca-marche` and `/tarifs`, with the photograph's subject visible in the crop.
- [ ] Below 1024 px the photo follows the text block at its 16:9 ratio on the same three pages.
- [ ] On a 390 × 844 phone the first screen of `/` still shows the H1, the intro and both doors without scrolling, as today.
- [ ] Neither door's capsule overflows the text column at any width checked.
- [ ] No word, colour or photograph changes: `src/content/` and the colour tokens in `src/app/globals.css` are untouched, and `vitrine.test.ts` and `contrast.test.ts` stay green.

## Out of scope

- Any word, the H1 included; metadata, alt texts, the choice of photographs (D-5).
- Colours (encres-contraste, merged in k0d0minio/berceo#43).
- The bands below the hero: steps, reason cards, Gardiennes, the stripes (blocs-accueil).
- The portal shell and the signed-in spaces' headers.
- The placeholder pages' own layout (qui-sommes-nous and the two legal pages) beyond what the shared header brings.
- An automated layout test in CI: the widths are checked on the preview with a headless browser and recorded in the PR.

## Open questions

- none
