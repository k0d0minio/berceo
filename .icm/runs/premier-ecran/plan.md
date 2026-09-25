# Plan: premier-ecran

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The header** — `src/components/shell/public-header.tsx`: the nav and the capsule row move
   from `lg:` to `xl:` (`hidden xl:block`, `hidden xl:flex`), the menu wrapper to `xl:hidden`;
   `whitespace-nowrap` on each link; the nav gap and the row gap tightened (`gap-6` → the
   smallest step that fits) and, only if still short, the header capsules' horizontal padding
   reduced through a `className` on those two buttons (the `Button` variants stay as they are).
   The file's comment rewritten ("Below xl …"). Done when: at 1280 px the row fits the
   `max-w-6xl` container with every link on one line, and at 1024–1279 the menu button shows.
2. **The photo** — `src/components/vitrine/photo.tsx`: accept a fill mode (a prop or a
   `className` the callers pass) that drops `h-auto` for `lg:h-full` and keeps `object-cover`,
   `rounded-carte`, plus an object-position per photo if the subject leaves the crop; the
   `sizes` default follows the new column (about 40vw from lg, 100vw below). Done when: a filled
   photo stretches to its grid cell's height from lg and keeps 16:9 below.
3. **The hero** — `src/app/(public)/page.tsx`: the section grid moves from
   `md:grid-cols-2 md:items-center` to a stacked layout below lg and an unequal two-column grid
   from lg (text column wider, e.g. `lg:grid-cols-[3fr_2fr]`, `lg:items-stretch`), the photo in
   fill mode; the H1 gets `text-balance`; the intro a measure of at most 75 characters (a `max-w`
   in `ch`). The container may widen past `max-w-6xl` only if 4 lines cannot be reached
   otherwise, and then the header container follows. `--taille-h1` moves (never below 56 px, in
   `src/app/globals.css`) only as the last resort. Done when: H1 ≤ 4 lines at 1280 and 1440, no
   overflow at the eight widths, photo edges on the text block's edges from lg.
4. **The inner pages' header** — `src/components/vitrine/page-header.tsx`: the same grid rule as
   the hero when `aside` is set (stacked below lg, unequal columns from lg, stretch), the H1
   balanced, the intro measure; the callers in `comment-ca-marche/page.tsx` and `tarifs/page.tsx`
   pass the photo in fill mode. `cta-pair.tsx` only if a capsule overflows the column (let the
   row wrap, never shrink the label). Done when: the same checks pass on `/comment-ca-marche`,
   `/tarifs` and `/faq`.
5. **Prove it** — `format.sh`/`lint.sh`, the ready flip, CI GREEN, then the preview measured in
   a headless browser (Chromium is preinstalled; `executablePath: '/opt/pw-browsers/chromium'`)
   at 320, 390, 768, 820, 1024, 1279, 1280, 1440 and 1920 px on the four pages: link line
   counts, H1 line count and computed size, intro characters per line (range rects),
   `scrollWidth` vs `clientWidth`, photo vs text block bounding boxes, and the 390 × 844 first
   screen. The measurements go into the PR body's test notes. Done when: every
   definition-of-done line in `tasks.md` is met on the preview.

## As built

- Passes 1–4 landed as planned, with the photo column fixed at 22rem (text 696 px from 1280; the H1 needs 682 px for 4 lines at 60 px, measured before editing). `--taille-h1` and the container did not move.
- Added after the first measurement: the doors' side padding below sm (`cta-pair.tsx`) and, by the operator's choice, the hero's 12 px gutter and 38 px H1 below 360 px (D-16). The 320 px case had not been measured in Define (`FAILURE.md`).
- The hero crop's focal point moved from 20 % to 30 % after the 1024 px screenshot.

## Risks

- The 88-character H1 may not reach 4 lines at 60 px in a text column that still leaves the
  photo a meaningful width inside 1,088 px. Signal: 5 lines at 1280 after pass 3's column split.
  Fallback in this order: widen the text column, drop `--taille-h1` to 56 px, widen the
  container (header included, so the wordmark stays aligned).
- A filled photo becomes a tall portrait crop (the text block runs about 600 px high beside a
  column about 430 px wide); the subject can leave the frame. Signal: the baby's mouth and fist
  (`bebe-endormi`) or the hands and feet (`mains-pieds`) cut on the preview. Fix with
  `object-position` per photo, never another photograph (D-5).
- Tightening the header capsules can drift them from the DA's button rows. Keep `min-h-12`, the
  type and the variant; only horizontal padding moves, and only in the header.
- `blocs-accueil` edits `src/app/(public)/page.tsx` next; keep this run's edit to the hero
  section so its branch merges cleanly.
