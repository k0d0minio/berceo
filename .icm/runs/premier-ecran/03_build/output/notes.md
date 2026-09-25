# Build notes: premier-ecran

- commits: 7022ee1 (header, photo fill mode, hero, PageHeader) · 94ab1f2 (doors at 320 px) · f928743 (hero H1 at 320 px, D-16) · bb5c8ab (hero crop focal point) · 56ce34d (merge of main, #45)
- ci: GREEN on 56ce34d (draft tier: Vercel pass, Quality (advisory) pass); full gate settled after the ready flip, below

## What changed

- `src/components/shell/public-header.tsx`: the nav and the capsules show from xl (1280 px), the menu below it (D-14). Links take `whitespace-nowrap`; the row gap and the nav gap go from 24 to 16 px, and the header capsules' side padding from 28 to 20 px, so the measured 1,130 px row fits the 1,088 px container (about 1,060 px now).
- `src/components/vitrine/photo.tsx`: a `fillHeight` mode. From lg the image stretches to its grid row (`lg:h-full lg:self-stretch`) and `object-cover` crops it; below lg it keeps 16:9. Its default `sizes` becomes `(min-width: 64rem) 62rem, 100vw`, because the cover-cropped picture is drawn wider than its 22rem column.
- `src/app/(public)/page.tsx` (hero section only): stacked below lg; from lg `minmax(0,1fr) | 22rem`, so the text column is 696 px from 1280 px (the H1 needs 682 px for 4 lines at 60 px, measured). H1 `text-balance`; intro `max-w-xl`. Below 360 px the gutter narrows to 12 px and the H1 sets at 38 px (D-16). The photo uses `fillHeight` with `lg:object-[30%_50%]` so the mouth and the fist stay in the portrait crop.
- `src/components/vitrine/page-header.tsx`: the same grid when an aside is set, H1 balanced, intro `max-w-xl`; `/comment-ca-marche` and `/tarifs` pass `fillHeight`.
- `src/components/vitrine/cta-pair.tsx`: below sm both doors' side padding drops to 20 px, so « Trouver votre gardienne de la nuit » (293 px at 28 px padding) fits the 288 px column at 320 px.
- `--taille-h1` did not move: 60 px reaches 4 lines. No container widened.

## Acceptance criteria status

Measured on the branch preview (56ce34d) in headless Chromium with the site's own fonts, at 320, 340, 359, 360, 390, 768, 820, 1024, 1279, 1280, 1440 and 1920 px on `/`, `/comment-ca-marche`, `/tarifs` and `/faq`: 48 page-widths, 0 failures. Raw numbers in `measurements.txt`, probe in `measure.mjs` (`node measure.mjs <share-url> [widths…]`).

- [x] Header on one row from 1280 to 1920, every link on one line — links 1 line each at 1280, 1440 and 1920; the wordmark, nav and capsules share a vertical centre.
- [x] Below 1280 the menu button shows and its panel lists the four pages and both entries — checked at every width below 1280, panel opened: all 6 items.
- [x] Hero H1 at most 4 lines at 1280 and 1440 — 4 lines (column 696 px).
- [x] H1 never overflows, no horizontal scroll, at every width checked on the four pages — `scrollWidth` equals `clientWidth` everywhere, 320 included (after 94ab1f2 and f928743).
- [x] H1 56–64 px from 768 and 38–44 px below — 60 px from 768; 40 px below, 38 px on the hero below 360 px.
- [x] Intro at most 75 characters a line — at most 63 (hero 60, `PageHeader` 61–63).
- [x] From 1024 the photo's top and bottom line up with the text block, subject in the crop — edges equal to the pixel on the three pages; screenshots checked at 1024 and 1280 (hero: mouth whole, fist lower left; mains-pieds and ours-berceau centred).
- [x] Below 1024 the photo follows the text at 16:9 — ratio 1.777–1.778 on the three pages.
- [x] At 390 × 844 the first screen of `/` shows the H1, the intro and both doors — the doors' bottom edge at 618 px.
- [x] Neither door overflows the text column — at every width.
- [x] No word, colour or photograph changes — `git diff origin/main...HEAD -- src/content` is empty; no colour token moved; `vitrine.test.ts` and `contrast.test.ts` untouched, and the advisory job ran them green on 56ce34d.

The boxes in the PR body stay unticked: a session ticking them is refused as self-approval (Learned rules). This list is the record.

## Notes for Release

- **Spec gap, decided by the operator in Build (D-16).** D-6's 38–44 px and "never overflows from 320 px" could not both hold: « professionnelles » is 294 px even at 38 px, against 288 px at 320 px with the 16 px gutter. Below 360 px only, the hero's gutter narrows to 12 px and its H1 sets at 38 px, so on those screens the H1 starts 4 px left of the wordmark. There are 2 px to spare, so re-measure when Comodo replaces Fraunces (`measure.mjs`).
- The 320 px overflow (the family door, then the H1) was also live on uat.berceo.be before this run. The run fixes it; it did not cause it.
- The hero crop is a portrait (352 × 474 at 1280, 352 × 633 at 1024). Its focal point is set at the call site, not in `src/content/photos.ts`, because the spec keeps the content catalogue untouched.
- The header capsules' 20 px side padding applies only in the header (a `className`), not in the `Button` variants.
- `blocs-accueil` edits `src/app/(public)/page.tsx` next. This run touched only the hero `<section>`.
