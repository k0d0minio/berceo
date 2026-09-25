# Stub: Legible ink on every surface

- feature-slug: encres-contraste
- scope: finition-accueil
- personas: parent, professionnel, admin
- initiative: Plateforme Berceo V1 / objective: a first usable version on uat.berceo.be before December 2026, for a launch in January 2027
- depends-on: none
- sequence: 1 of 3
- complexity: medium
- recommended-model: sonnet

## Problem

Every text colour in the DA's palette fails WCAG AA on the surface it sits on. Body text is taupe on white at 1.98:1, the steps are taupe on pearl at 1.47:1, and headings, buttons and the footer are at 2.4:1 at best. Families reading at night on a phone can barely see the page, and the platform promised AA in plateforme-v1.

## Proposed change

Add two ink tones to the tokens, darkened from sage and taupe on the same hue, and use them for text on white and pearl. Filled buttons and the footer move to a deep sage carrying white text. The light sage band keeps its colour, with an ink heading and white cards. The block on the stripes becomes the white block with ink text. Outlines, field borders and the focus ring reach 3:1. The five DA colours stay as surfaces, borders and accents. Because the change sits on the tokens, it reaches the vitrine, the sign-in pages and the signed-in spaces at once.

## Acceptance criteria (rough)

- [ ] A unit test lists every text and surface pair the platform declares and fails below 4.5:1 for body text and 3:1 for text at 24 px or more (18.66 px bold).
- [ ] The four button rows pass AA in both the default and the hover state.
- [ ] Button outlines, field borders and the focus ring reach 3:1 against what surrounds them.
- [ ] The five DA hex values are unchanged, and the ink tones are declared in `src/app/globals.css` only (no colour literal anywhere else, as today).
- [ ] `/design-system` shows the ink tones, and `/design-system/portail` renders with them.
- [ ] Checked on the preview at 390 and 1440 px: `/`, `/comment-ca-marche`, `/tarifs`, `/faq`, a sign-in page, and one page of each signed-in space.

## Out of scope (this feature)

- Any layout or size change (premier-ecran, blocs-accueil).
- Any word change.
- Redesigning the portal: it receives the tokens and is checked, nothing more.

## Notes for Define

- D-1: sage ink about #48685a (6.2:1 on white, 4.6:1 on pearl), taupe ink about #636254 (6.2:1, 4.6:1). This overrides socle D-9 (literal text colours).
- D-2: deep sage with white for the filled buttons and the footer, ink heading and white cards on the light sage band, the white block on the stripes.
- D-3: platform-wide, on the tokens. The portal is checked, not redesigned.
- Open: the exact hexes, fixed by the contrast test and flagged `@relecture` for Surya, not blocking.
- Open: the hover states. Butter with sage text is 2.17:1 today; propose ink text on butter.
- Open: the "Trouver une professionnelle" button on the light sage band, deep sage filled or white with ink.
- About 57 files name `text-taupe` or `text-sauge` today (199 uses). Define decides between remapping the shadcn contract (`--foreground` and friends) plus new `encre` utilities, and a sweep. The fewer component edits, the smaller the later stubs' merges.
- touches: src/app/globals.css, src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/striped-section.tsx, src/components/vitrine/section.tsx, src/components/shell/public-footer.tsx, src/components/shell/public-header.tsx, src/app/(public)/design-system/**, a new contrast test, and every component that names a text colour.
