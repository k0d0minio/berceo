# Stub: Two vitrine layout overruns outside the homepage

- lane: bug
- found-by: blocs-accueil build measurement · 2026-09-25
- complexity: low
- priority: P2

## Problem

Measured on the blocs-accueil preview and on the preview of the base it branched from (same results on both, so neither comes from that run), in headless Chromium with the site's fonts:

- `/design-system` scrolls sideways at 320 px: `scrollWidth` 375. The overflow is the cards demo ("Carte sur fond blanc", "Dormir pour prendre soin de soi…"), whose right edge sits at 375 px. The page is noindex, but it is the reference for every token and component.
- `/tarifs` has a paragraph that runs 85 characters a line at 768 px, over the DA's 75 (« Limiter les lignes à environ 60–75 caractères », DA p. 13). At 1024 px and up it is 62.

## Proposed change

Let the design-system cards demo wrap or stack below 375 px so the page doesn't scroll sideways at 320. Give the `/tarifs` paragraph a measure (`max-w-[55ch]` or similar) that keeps it to 75 characters at 768. No word changes.

## Prompt

In the berceo repo, read `.icm/intake/triage/vitrine-mesures-hors-accueil.md`. Fix the sideways scroll on `/design-system` at 320 px (the cards demo in `src/app/(public)/design-system/page.tsx`) and hold the `/tarifs` paragraph that runs 85 characters a line at 768 px to at most 75 (`src/app/(public)/tarifs/page.tsx`). Change no word. Measure both at 320, 390, 768 and 1440 px on the preview with `.icm/runs/_done/blocs-accueil/03_build/output/measure.mjs`. Run it through `/pipeline bug vitrine-mesures-hors-accueil`.
