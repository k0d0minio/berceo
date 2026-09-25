# Tasks: encres-contraste

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `src/app/contrast.test.ts` reads the values from `src/app/globals.css`, lists every text and surface pair above, and fails below 4.5:1 for body text and below 3:1 for text at 24 px or more (18.66 px bold) and for a control's boundary; it passes on this branch.
- [ ] The same test fails if any file under `src/` names `text-sauge` or `text-taupe`, with any variant prefix or opacity suffix; none does.
- [ ] `--encre-sauge` is `#3c584b` and `--encre-taupe` is `#646254`, declared in `src/app/globals.css` only, each flagged `@relecture` for Surya; the five DA values (`#ffffff`, `#8baf9f`, `#bab9ad`, `#e0ded8`, `#fef5b5`) are unchanged, and no component, page or content file carries a colour literal (the test alone names the five DA values, to assert them).
- [ ] The four button rows (`blanc`, `raye`, `sauge`, `taupe`) show the resting and hover colours of the table above, and their text passes 4.5:1 in both states.
- [ ] Field borders, the resting outlines of the `blanc` and `raye` rows, and the focus ring reach 3:1 against their surface; on the footer the focus ring is white.
- [ ] The footer is the sage ink with white text; the light sage band's H2 is the sage ink and the band sets no white text; the block on the stripes is white with taupe-ink text and `StripedSection` has no taupe block option; the card's `sauge` and `taupe` tones are the inks with white text.
- [ ] No page shows white text on sage, taupe, pearl or butter: the availability calendar's marked night, the step header's done step and the file slot's hover use the sage ink.
- [ ] Placeholder and dimmed text pass 4.5:1 composited on their surface.
- [ ] `/design-system` shows the two ink swatches and the new button rows; `/design-system/portail` renders with the new tokens.
- [ ] Checked on the preview at 390 and 1440 px: `/`, `/comment-ca-marche`, `/tarifs`, `/faq`, a sign-in page, and one page of each signed-in space (famille, professionnelle, admin) show ink text, no white text on a light surface, and no layout change.

## Queue

- [x] The contrast test and the tokens (`src/app/contrast.test.ts`, `src/app/globals.css`) — 2473f09
- [x] The rename, the surfaces and controls, the design system page, the e-mail stub parked — ab11feb
- [ ] The ready flip and the full verdict (`ci-status.sh`), then the preview smoke at 390 and 1440 px
