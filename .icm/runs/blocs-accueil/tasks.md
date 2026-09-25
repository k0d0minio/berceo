# Tasks: blocs-accueil

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

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

## Queue

- [ ] <task — small enough for one commit; name the file or area>
