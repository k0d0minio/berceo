# Tasks: premier-ecran

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

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

## Queue

- [ ] <task — small enough for one commit; name the file or area>
