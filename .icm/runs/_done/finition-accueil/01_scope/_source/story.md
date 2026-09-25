<!-- Source: Jamie Nisbet (the operator), 2026-09-25, via chat (a Claude Code session prompt).
     Recorded as received. Never edited — what was settled on top of it lives in scope.md.
     Also recorded here, by link plus description: the one item of .icm/raw/ that had not been
     processed (the image bank below), and the pages of the already-processed art direction the
     request is measured against. -->

## 2026-09-25 — the request

the homepage lacks a bit of polish. The design system is good but there are some text blocks that are too large for where they are so are creating weird constraint boxes that look off. And then the overall contrast of the design system colors offers poor legibility. Overall the content and the structure of the design is good on this homepage but we need to polish it a little further. Do some research and cut an intake batch about it. If the content in raw has not been processed let's process it and fold it into this research base

## Raw content folded in (by link plus description)

- `.icm/raw/Banque d_image/1.png`, `4.png`, `5.png`, `8.png` — the DA's image bank, four PNGs
  (about 1.8–2.1 MB each, 1672 × 941). Photographs with no text: a sleeping newborn's mouth and fist
  on linen (1), a worn teddy bear in a dark wooden crib (4), a seated baby holding a foot (5), a
  newborn's hand gripping an adult finger (8). They are the originals of the four WebP files the
  site already ships in `public/photos/` (`bebe-endormi`, `ours-berceau`, `mains-pieds`,
  `main-doigt`; vitrine-publique, V-3). `process-raw.sh --dry-run` skips all four (no OCR tool,
  and nothing to read): they are recorded here, not extracted.
- Every other asset that reached `.icm/raw/` was processed on 2026-09-23 and scoped into
  `plateforme-v1` (`.icm/processed/manifest.json`; the six pointer stubs are in
  `.icm/intake/triage/_done/`). No pointer stub is open.

## Reference pages this request is measured against (already processed, quoted not re-recorded)

- `.icm/processed/2026-09-23-direction-artistique-web.txt` — Surya's web art direction. Page 13,
  « Lisibilité »: « Limiter les lignes à environ 60–75 caractères », « Éviter de centrer les
  textes de plus de trois lignes », « Conserver un corps minimum de 16 px », « Garantir un
  contraste suffisant », « Placer les textes dans un bloc uni sur le motif rayé ». Page 12, the
  type scale (H1 56–64 px desktop, 38–44 px mobile; H3 26–30 / 22–26 px). Page 24, cards:
  « contraste lisible ». Pages 17–18, the palette: sauge #8BAF9F, taupe #bab9ad, perle #e0ded8,
  beurre #FEF5B5, blanc #FFFFFF; the taupe block and the white block on the stripes.
- The homepage as deployed on https://uat.berceo.be/ on 2026-09-25 (commit e6e8ecd), measured at
  1440, 820 and 390 px wide in a headless browser.
