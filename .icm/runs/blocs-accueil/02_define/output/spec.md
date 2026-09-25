# Spec: The homepage's bands — blocks that fit their boxes

- slug: blocs-accueil
- personas: parent, professionnel
- touches: src/app/(public)/page.tsx, src/components/vitrine/step-list.tsx, src/components/vitrine/reason-grid.tsx, src/components/ui/striped-section.tsx, src/components/vitrine/section.tsx (only if a band-level rule lands there), src/components/ui/card.tsx (only if the reason cards' rhythm cannot be set from reason-grid.tsx)
- complexity: standard

## Problem

Below the fold, the homepage's text blocks don't fit their containers. This was measured on uat.berceo.be on 2026-09-25 (scope finition-accueil). In « Comment ça marche », « Choisissez votre professionnelle » wraps at 28 px and the other two step titles don't, so the three paragraphs start at different heights. In « Pourquoi Berceo ? », 28 px bold titles sit in 283 px-wide cards: four titles out of five wrap, the gap between title and text is wide (the card's 32 px spacing), and the fifth card leaves an empty slot in a three-column grid. In « Qui sont les Gardiennes de la nuit ? », two paragraphs at intro size (21 px) make 9 lines beside the photo at 1440 and 12 at 390. On the stripes, the professionals' paragraph is centred over 4 lines at 1440 and 7 at 390, but the DA allows at most three (« Éviter de centrer les textes de plus de trois lignes », p. 13), and its H2 takes 3 lines at 390. These are the last pieces of the homepage polish for the first usable version on uat.berceo.be (Plateforme Berceo V1, before December 2026, for a launch in January 2027). Families and professionals read these bands on their first visit, before either signs up.

## Proposed change

No word, band, colour or photograph changes (D-5). Only layout, size and alignment move. The fixes go into the shared components (step list, reason grid, striped band) so every page that uses them gets the same result (D-4). The homepage is the reference. The yardstick is the DA's reading rules (p. 13): lines of 60–75 characters where the column allows, never over 75, and nothing centred over three lines.

**The steps align (`StepList`).** From 768 px (md), where the list runs in three columns, the steps share their rows. The number capsules sit on one line, the titles on the next row, and the paragraphs start on the same line whatever the titles' wrapping (for example with CSS subgrid, three rows per step). The H3 keeps the DA's size (`text-h3`, 28 px desktop / 24 px mobile, inside the DA's 26–30 / 22–26 px) and wraps in balanced lines. Below md the steps stack as today. This applies to the homepage and to both step lists on `/comment-ca-marche`.

**The reason cards (`ReasonGrid`) run in two columns, and an odd last card spans both.** Below 768 px, one column as today. From md, two columns. With five cards (« Pourquoi Berceo ? » on `/`, « Ce que garantit Berceo » on `/comment-ca-marche`), the fifth card spans the full row, so no slot is left empty at any width. Its paragraph is held to at most 75 characters a line. The operator chose this on 2026-09-25 over three-plus-two and centred layouts: at about 530 px a card, the titles have room for one line at the DA's H3 size. Within each row of cards, titles and texts share their rows, so if one title wraps, the texts in that row still start on the same line. The title-to-text gap tightens to at most 16 px, set from `reason-grid.tsx` (`card.tsx`'s shared default spacing stays as it is unless it cannot be overridden from there). Titles stay `text-h3`, bold, and wrap in balanced lines. The card, the DA's white card on sage, keeps its surface, its corners and its padding.

**The Gardiennes text drops to body size.** Both paragraphs move from `text-intro` to the body size (`text-corps`, 17 px from md). At 1440 the text column is about 520 px, which gives about 60–65 characters a line and 8 lines or so, beside a 16:9 photo about 293 px tall. The operator chose this on 2026-09-25 over keeping the first paragraph as an intro-size lead. The two-column split from md, the photo and the band stay as they are.

**The stripes' block is left-aligned (`StripedSection`).** The paragraph is about 280 characters, which is at least 4 lines at 75 characters a line. Narrowing the block can't bring it to three lines, so centring can't satisfy the DA's rule. The whole white block (H2, paragraph, button) aligns left: the operator chose one alignment for the whole block on 2026-09-25, over a centred H2 and button around a left paragraph. The block keeps its width so its paragraph runs at 60–75 characters a line at desktop. The block's inner padding and/or the stripes' side gutter tighten below md so the H2 (unchanged size, balanced wrap) takes at most 2 lines at 390 px. The stripes, the white block, its 32 px corners and the taupe-ink text stay. The design-system page's demo of the component picks up the same alignment.

**`/tarifs` and `/faq`** use `VitrineSection` only. They change only if a band-level rule lands in `section.tsx`, and they are checked for regressions either way.

## Acceptance criteria

- [ ] At 768, 1024 and 1440 px, the three steps' paragraphs start on the same line (their top edges within 1 px) on `/` and in both step lists on `/comment-ca-marche`.
- [ ] From 768 px, the reason cards run in two columns and, with five cards, the fifth spans the full row. No empty grid slot is visible at 390, 768, 1024 or 1440 px on `/` and `/comment-ca-marche`.
- [ ] Within each row of reason cards, the texts start on the same line (within 1 px) at 768, 1024 and 1440 px, and at 1440 px no reason-card title on `/` wraps or every title in a row wraps alike.
- [ ] The gap between a reason card's title and its text is at most 16 px at every width checked.
- [ ] No paragraph on `/` runs over 75 characters a line at 390, 768, 1024 or 1440 px, the full-width fifth card included.
- [ ] No text on `/` is centred over more than three lines at any of 320, 390, 768, 1024, 1440 and 1920 px (DA p. 13), and the stripes' block has no centred text at all.
- [ ] Both Gardiennes paragraphs render at the body size, and at 1440 px the Gardiennes text column is no taller than 1.3 times its photo.
- [ ] The stripes' H2 takes at most 2 lines at 390 px, and the block's paragraph runs 60–75 characters a line at 1440 px.
- [ ] `/comment-ca-marche`, `/tarifs` and `/faq` render the shared blocks with no overflow, no horizontal scroll and no overlap at 390 and 1440 px, and the design-system page's striped demo renders left-aligned.
- [ ] No word, colour or photograph changes: `src/content/` and the colour tokens in `src/app/globals.css` are untouched, and `vitrine.test.ts` and `contrast.test.ts` stay green.

## Out of scope

- Any word, including a sixth reason card, and metadata, alt texts and the choice of photographs (D-5).
- Colours (encres-contraste, merged in k0d0minio/berceo#43), the header and the hero (premier-ecran, merged in k0d0minio/berceo#46).
- The type tokens' values (`--taille-*`): every band fits at the DA's existing sizes.
- The placeholder pages' own layout (qui-sommes-nous and the two legal pages), beyond what the shared blocks bring.
- The signed-in spaces, and `card.tsx`'s default rhythm for the portal's cards.
- An automated layout test in CI. The widths are checked on the preview with a headless browser, and the measurements are recorded in the PR.

## Open questions

- none
