# Build notes: blocs-accueil

- commits: 8265e0a (the four bands), 1a18f61 (short titles keep 12 px, the full-row card within 75 characters, the stripes' H2 at 26 px on phones; parks a triage stub), then the run files
- ci: GREEN on ace5510, full gate after the ready flip (Vercel pass); Quality (advisory) passed on ace5510. The later commits touch `.icm/` only

## What changed

- `src/components/vitrine/step-list.tsx`: from md each step is a three-row subgrid of the list (`md:row-span-3 md:grid md:grid-rows-subgrid`, list `md:gap-y-3`), so the number capsules, the titles and the paragraphs each share a row; titles `text-balance`. Below md the steps stack as before. Titles are top-aligned: a one-line title leaves space under it while its neighbour wraps, and the paragraphs start together.
- `src/components/vitrine/reason-grid.tsx`: `md:grid-cols-2` (no `lg:grid-cols-3`); an odd last card spans the row (`md:last:odd:col-span-2`); each `<li>` and its `Card` are two-row subgrids with a 12 px row gap, so titles share a row and texts the next, while the grid keeps 24 px between cards; the header sits at the foot of the title row (`md:self-end`) so a shorter title keeps 12 px to its text; the card's own gap drops from 32 to 12 px (`gap-3` through `className`; `card.tsx` untouched); paragraphs `max-w-[55ch]`; titles `text-balance` (D-17).
- `src/app/(public)/page.tsx`: the Gardiennes paragraphs lose `text-intro` and inherit the body size (D-18); the stripes' H2 gets `text-balance` and `max-md:text-[1.625rem]` (D-20).
- `src/components/ui/striped-section.tsx`: the white block is `items-start` with no `text-center` (D-19); below md the section gutter goes from 16 to 12 px and the block padding from 32 to 24 px. The design-system demo follows with no edit.
- `.icm/intake/triage/vitrine-mesures-hors-accueil.md`: parked — `/design-system` scrolls sideways at 320 px (its cards demo) and a `/tarifs` paragraph runs 85 characters a line at 768 px. Both measured the same on the base branch's preview (059da36), so neither is this run's.

## Acceptance criteria status

Measured on the branch preview of 1a18f61 in headless Chromium with the site's own fonts, at 320, 390, 768, 1024, 1440 and 1920 px on `/`, `/comment-ca-marche`, `/tarifs`, `/faq` and `/design-system` (30 page-widths). Raw numbers in `measurements.txt`, probe in `measure.mjs` (`PROXY_CA_SPKI=… node measure.mjs <share-url> [widths…]`).

- [x] Steps aligned — paragraph tops spread 0 px at 768, 1024, 1440 and 1920 on `/` and on both lists of `/comment-ca-marche`.
- [x] Two columns, fifth full-row — `2+2+1` from 768 with the last card the grid's full width, `1+1+1+1+1` below, on both pages; no empty slot.
- [x] Rows aligned, titles — texts' tops spread 0 px per row at every width; at 1440 every title on `/` takes one line (`11111`).
- [x] Title-to-text gap — 12 px at every width on both pages.
- [x] ≤ 75 characters a line on `/` — at most 75 (768, 1440, 1920), 74 (1024), 51 (390), 42 (320); the full-row card 63 on `/` and 74 on `/comment-ca-marche`.
- [x] Centred text — none on `/` at any width; the stripes' block has no centred text (its button label aside, one line).
- [x] Gardiennes — 17 px (16 px below md, the body token); text column 0.71 × the photo at 1440.
- [x] Stripes — H2 2 lines at 390 (26 px there, D-20; 3 lines at 320), paragraph 74 characters a line at 1440.
- [x] Other pages — no sideways scroll on `/comment-ca-marche`, `/tarifs` and `/faq` at any width; the design-system striped demo is left-aligned. `/design-system` scrolls at 320 px on the base too (parked).
- [x] No word or colour changes — `src/content/` and `globals.css` untouched in the diff; `vitrine.test.ts` and `contrast.test.ts` green in Quality (advisory) on ace5510.

## Notes for Release

- **Spec gap, decided by the operator in Build (D-20).** The spec kept the type sizes and asked for a 2-line stripes' H2 at 390 px; at 32 px its shortest two-line split needs 380 px against 318 px. Below md that one heading sets at 26 px. The learned rule from premier-ecran (measure a heading's longest line at the narrowest width in Define) would have caught it.
- **Decision ids renumbered.** Define took D-9 to D-11, which encres-contraste and premier-ecran already held; Build renumbered them D-17 to D-19 (`FAILURE.md`). No criterion text changed.
- Subgrid (`grid-template-rows: subgrid`) is baseline in every current browser; an older browser without it falls back to plain flex columns (titles and texts not row-aligned, nothing broken).
- The measurement probe trusts the session proxy's CA by its key (`--ignore-certificate-errors-spki-list`), since the Chromium in the cloud session does not read the NSS store for it.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on 5f0555d (ci-status.sh, full gate) before the record; re-read after the last push
- reviews: code medium (/code-review against origin/main — no findings: the two-column grid on both five-card pages, the 12 px title-to-text rhythm, the tailwind-merge resolution of the card's gap, the three-step lists, the 26 px phone heading's line height, the striped block's alignment on its two callers) · security security-check.sh --branch --audit: OK (npm audit: no high/critical) · /security-review n/a (no auth, payments, PII or route policy touched) · /production-readiness n/a (no DB, auth, payments or env var touched) · readiness env.sh audit --changed: OK
- parked: vitrine-mesures-hors-accueil.md (from Build: `/design-system` scrolls sideways at 320 px, a `/tarifs` line runs 85 characters at 768 px; both on the base too)
- migrations: skip — none of this run's own
- learned: skip — no error.log (FAILURE.md's rule on numbering decisions follows through close-out.sh)
- docs: no docs impact · announce: deferred to promotion
