# Plan: encres-contraste

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The test first** — `src/app/contrast.test.ts`: parse `:root` of `src/app/globals.css`
   (resolve `var(--x)` chains), a WCAG relative-luminance helper, alpha compositing for `/NN`
   suffixes, the pair table from the spec (text · surface · size class · state), the DA-values
   assertion, and the `text-sauge`/`text-taupe` ban over `src/**/*.{ts,tsx}` (the test file
   itself excluded). Done when: it runs and fails on `main`'s tokens for the reasons the scope
   measured (taupe on white 1.98, white on sage 2.41).
2. **The tokens** — `src/app/globals.css`: `--encre-sauge: #3c584b` and `--encre-taupe: #646254`
   in `:root` with a `@relecture` comment, `--color-encre-*` in `@theme inline`, the shadcn
   contract remapped (foregrounds, `--destructive`, `--input` → taupe ink; `--primary`, `--ring`
   → sage ink), `::selection` text → taupe ink, the header comment's "applied literally" line
   rewritten to say the inks carry text (D-1 overrides socle D-9). Done when: the pair-table rows
   that only read tokens pass.
3. **The mechanical rename** — `text-taupe` → `text-encre-taupe`, `text-sauge` → `text-encre-sauge`
   over `src/`, prefixes and opacity suffixes kept (one `sed -E` with word boundaries; check that
   `text-taupe/70` and `hover:text-sauge` came through). Done when: the ban check passes and
   `git grep -nE 'text-(sauge|taupe)\b'` returns nothing.
4. **The surfaces and controls** — `button.tsx` (the four rows per the spec's table), `card.tsx`
   (tones), `striped-section.tsx` (white block only, drop the `block` prop and its taupe branch),
   `section.tsx` (sauge band: ink heading, no `text-blanc`), `public-footer.tsx` (sage-ink band,
   white focus ring on it), `input.tsx` and the hand-rolled fields (`focus-visible:border-sauge`
   → ink), `steps-header.tsx`, `availability-calendar.tsx`, `file-slot.tsx` (white-on-sage and
   control borders/outlines → inks), the placeholder and inactive-tab opacity raised to the
   lowest step that passes. Done when: the whole pair table passes and
   `git grep -nE 'bg-(sauge|taupe)[^"]*text-blanc|border-(sauge|taupe)|outline-(sauge|taupe)'`
   leaves only decorative uses the spec keeps (the progress bar's fill).
5. **The design system page** — `src/content/design-system.ts` (two swatches, `@relecture`),
   `src/app/(public)/design-system/page.tsx` (swatch classes, the hand-written hover samples,
   the striped sample's `taupe` row inside a white block). Done when: `vitrine.test.ts` and the
   content tests pass.
6. **Prove it** — `format.sh`/`lint.sh`, the ready flip, CI GREEN, then the preview at 390 and
   1440 px on the spec's page list. Done when: every definition-of-done line in `tasks.md` is
   ticked.

## Risks

- A Tailwind v4 opacity suffix on a `var()`-based colour compiles to `color-mix`; the test must
  composite the same way (alpha over the surface in sRGB) or it will pass a pair the browser
  renders lighter. Signal: a dimmed label that looks fainter on the preview than its ratio says.
- The rename touches 67 files; a `sed` without word boundaries would also rewrite a future
  `text-taupe-…` token. Signal: a diff line that changes anything but the utility name.
- Removing `StripedSection`'s `block` prop breaks any caller passing it. Signal: typecheck red —
  today only the default is used (`/` and `/design-system`).
- The butter hover's edge is under 3:1 by decision; a reviewer may flag it. The spec settles it;
  do not "fix" it by changing the row's shape.
