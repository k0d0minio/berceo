# Tasks: blocs-accueil

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] At 768, 1024 and 1440 px, the three steps' paragraphs start on the same line (their top edges within 1 px) on `/` and in both step lists on `/comment-ca-marche`.
- [x] From 768 px, the reason cards run in two columns and, with five cards, the fifth spans the full row. No empty grid slot is visible at 390, 768, 1024 or 1440 px on `/` and `/comment-ca-marche`.
- [x] Within each row of reason cards, the texts start on the same line (within 1 px) at 768, 1024 and 1440 px, and at 1440 px no reason-card title on `/` wraps or every title in a row wraps alike.
- [x] The gap between a reason card's title and its text is at most 16 px at every width checked.
- [x] No paragraph on `/` runs over 75 characters a line at 390, 768, 1024 or 1440 px, the full-width fifth card included.
- [x] No text on `/` is centred over more than three lines at any of 320, 390, 768, 1024, 1440 and 1920 px (DA p. 13), and the stripes' block has no centred text at all.
- [x] Both Gardiennes paragraphs render at the body size, and at 1440 px the Gardiennes text column is no taller than 1.3 times its photo.
- [x] The stripes' H2 takes at most 2 lines at 390 px, and the block's paragraph runs 60–75 characters a line at 1440 px.
- [x] `/comment-ca-marche`, `/tarifs` and `/faq` render the shared blocks with no overflow, no horizontal scroll and no overlap at 390 and 1440 px, and the design-system page's striped demo renders left-aligned.
- [ ] No word, colour or photograph changes: `src/content/` and the colour tokens in `src/app/globals.css` are untouched, and `vitrine.test.ts` and `contrast.test.ts` stay green.

## Queue

- [x] Steps share three rows from md (`step-list.tsx`) — 8265e0a
- [x] Reason cards in two columns, odd last card full-row, rows shared, 12 px title-to-text (`reason-grid.tsx`) — 8265e0a, 1a18f61
- [x] Gardiennes paragraphs at body size (`page.tsx`) — 8265e0a
- [x] Stripes' block left-aligned, tighter on phones (`striped-section.tsx`), its H2 at 26 px below md (D-20, `page.tsx`) — 8265e0a, 1a18f61
- [x] Measure the preview at 320–1920 px on five pages (`03_build/output/measure.mjs`, `measurements.txt`) — 1a18f61
- [ ] Merge main, flip ready, settle the full gate
