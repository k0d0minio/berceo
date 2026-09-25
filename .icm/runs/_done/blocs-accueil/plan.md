# Plan: blocs-accueil

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The steps** — `src/components/vitrine/step-list.tsx`: from md each `<li>` becomes a
   three-row subgrid of the `<ol>` (`md:grid md:grid-rows-subgrid md:row-span-3`, the `<ol>`
   keeps `md:grid-cols-3` and its column gap; the row gap inside a step stays about 12 px, so
   set `gap-y` on the `<ol>` from md and keep `gap-8` between stacked steps below md); the H3
   gets `text-balance`. The number capsule, the H3 size and the paragraph stay. The file's
   comment says why (the paragraphs start together whatever the titles wrap). Done when: at
   768, 1024 and 1440 the three paragraphs' tops are within 1 px on `/` and on both lists of
   `/comment-ca-marche`.
2. **The reason cards** — `src/components/vitrine/reason-grid.tsx`: the `<ul>` goes to
   `md:grid-cols-2` (drop `lg:grid-cols-3`); an odd last `<li>` spans both columns
   (`md:[&>li:last-child:nth-child(odd)]:col-span-2`), and that card's paragraph gets a measure
   of at most 75 characters (`max-w-[65ch]` or similar on the `<p>`, measured). Row alignment:
   each `<li>` spans two rows of a subgrid (`md:grid-rows-subgrid md:row-span-2`) and the
   `Card` inside becomes the subgrid too (or the Card is dropped to a `grid` with
   `grid-rows-subgrid`), so titles share a row and texts share the next. The title-to-text gap
   is set to at most 16 px through the Card's `className` (e.g. `gap-3` / override
   `--card-spacing` only for the vertical gap, keeping the 32 px padding). `card.tsx` is edited
   only if its `gap-(--card-spacing)` cannot be overridden from the caller. H3 gets
   `text-balance`. Done when: two columns from md, the fifth card full-row on `/` and
   `/comment-ca-marche`, texts aligned per row, the gap ≤ 16 px.
3. **The Gardiennes band** — `src/app/(public)/page.tsx`: the two paragraphs drop `text-intro`
   (inherit the body size, `text-corps`). The band's grid, the photo and the `VitrineSection`
   call stay. `section.tsx` is not touched unless a band-level rule turns out necessary. Done
   when: at 1440 the text column's height is ≤ 1.3 × the photo's, lines about 60–65
   characters.
4. **The stripes** — `src/components/ui/striped-section.tsx`: the block goes from
   `items-center text-center` to `items-start text-left`; its `max-w-2xl` stays (576 px of
   content at md, about 68 characters at 17 px); below md the block's padding goes from `p-8`
   to `p-6` and, only if the H2 still takes 3 lines at 390, the section's gutter from `px-4` to
   `px-3`. The comment is rewritten (the DA's three-line rule, the 280-character paragraph).
   In `page.tsx`, the stripes' H2 gets `text-balance`. The design-system demo follows without
   an edit. Done when: at 390 the H2 is ≤ 2 lines, at 1440 the paragraph runs 60–75 characters
   a line, nothing in the block is centred.
5. **Prove it** — `format.sh`/`lint.sh`, the ready flip, CI GREEN, then the preview measured
   in a headless browser (Chromium is preinstalled; `executablePath:
   '/opt/pw-browsers/chromium'`) at 320, 390, 768, 1024, 1440 and 1920 px on `/`,
   `/comment-ca-marche`, `/tarifs`, `/faq` and `/design-system`: step paragraph tops, reason
   card grid placement and per-row text tops, title-to-text gaps, characters per line of every
   `<p>` on `/` (range rects), centred elements' line counts, the Gardiennes column vs photo
   height, the stripes' H2 line count, `scrollWidth` vs `clientWidth`. The measurements go in
   the PR body's test notes. Done when: every acceptance criterion reads true from the table.

## Risks

- Subgrid with a nested `Card`: the card's own flex layout may break the row sharing; the
  signal is texts still starting at different heights in a row. Fall back to the `<li>` as the
  grid item and the card body as `grid grid-rows-subgrid row-span-2`, or a `min-h` of two title
  lines only as a last resort.
- `/comment-ca-marche` uses `StepList` on a white band and `ReasonGrid` on sage: a change that
  looks right on `/` can break there. The signal is overlap or a misaligned row at 390 or 1440.
- The stripes' H2 at 390: 36 characters at 32 px Fraunces is borderline at about 294 px of
  content; if tightening the padding and gutter is not enough, stop and say so before touching
  the H2 token (out of scope).
- `contrast.test.ts` and `vitrine.test.ts` must stay green: no colour class or word moves.
