# Scope: finition-accueil

- story: 01_scope/\_source/story.md — the source as received, never edited
- author/source: Jamie Nisbet (operator), chat prompt; the DA's image bank from `.icm/raw/`
- personas: parent, professionnel, admin
- agreed: 2026-09-25
- complexity: medium
- recommended-model: sonnet
- stubs: 3 (.icm/intake/finition-accueil/)
- canonical: this file, until Define writes spec.md

---

## The story

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

---

## Assumptions

What the research found, measured on uat.berceo.be on 2026-09-25 at 1440, 820 and 390 px wide.

**Contrast.** No text colour in the palette reaches the WCAG AA minimum (4.5:1 for body text, 3:1 for large text) on any surface it is used on:

| Text on surface | Ratio | Where on the homepage |
| --- | --- | --- |
| taupe on white | 1.98:1 | the intro, the Gardiennes paragraphs, the card texts |
| taupe on pearl | 1.47:1 | the three steps' titles and texts |
| sage on white | 2.41:1 | the H1, the H2s, the reassurance line, the nav, the outlined buttons |
| sage on pearl | 1.79:1 | the "Comment ça marche" H2 and links |
| white on sage | 2.41:1 | the "Pourquoi Berceo ?" H2, the footer, the filled buttons |
| white on taupe | 1.98:1 | the professionals' block on the stripes |
| sage on butter | 2.17:1 | the filled button's hover |

- The socle's spec knew this: the DA's colours were applied literally by decision (socle D-9), with the contrast "to raise with Surya". plateforme-v1's scope still says "the build targets WCAG 2.1 AA contrast". This scope settles that tension. [D-1, D-2]
- The DA asks for it too: « Garantir un contraste suffisant » (p. 13) and « contraste lisible » (p. 24).
- AA also asks 3:1 for what identifies a control: a button's outline, a field's border, the focus ring. Today they are sage (2.41:1) or taupe (1.98:1) on white. The same fix covers them.
- Same-hue ink tones exist that pass: sage darkened to about #48685a gives 6.2:1 on white and 4.6:1 on pearl. Taupe darkened to about #636254 gives 6.2:1 and 4.6:1. White on #48685a gives 6.2:1.

**Text blocks too large for their box.** The DA's own reading rules are the yardstick: lines of 60–75 characters, no centred text over three lines, H3 at 26–30 px on desktop.

- Hero H1: 88 characters at 60 px in half the page. It runs 6 lines at 1440 and 8 at 820. Between 768 and about 900 px, "professionnelles" is wider than its column and runs under the photo. The photo is centred against a text column twice its height, which leaves white bands above and below it.
- Header: at 1440, "Comment ça marche" and "Qui sommes-nous" wrap onto two lines each.
- Steps ("Comment ça marche"): "Choisissez votre professionnelle" wraps at 28 px and the other titles do not, so the three paragraphs start at different heights.
- Reason cards ("Pourquoi Berceo ?"): 28 px bold titles in 283 px-wide cards. Four of five wrap to two lines. The gap between title and text is wide. Five cards in a three-column grid leave one empty slot.
- Gardiennes: two paragraphs at intro size (21 px) make 9 lines beside a 16:9 photo at 1440, and 12 lines at 390.
- Striped band: the paragraph is centred over 4 lines at 1440 and 7 at 390, against the DA's three-line rule. The H2 takes 3 lines at 390.
- These blocks are shared components. The step list and the header also serve /comment-ca-marche, /tarifs and /faq. [D-4]

**Raw content.** The six text documents in `.icm/raw/` were processed on 2026-09-23 and folded into plateforme-v1. The four image-bank PNGs are the only thing left. They hold no text, and their WebP versions already ship. [D-7]

## Decisions

| ID | Decision | Why / context | Changes |
| --- | --- | --- | --- |
| D-1 | Text on white and pearl uses two ink tones, darkened from sage and taupe on the same hue, at 4.5:1 or more on both surfaces: sage ink about #48685a, taupe ink about #636254. | The palette's own colours cannot carry text legibly. Same-hue inks keep the DA's look. | Overrides socle D-9 ("the DA is applied literally, including text and button colours"). |
| D-2 | White text on sage and taupe is fixed three ways. Filled buttons and the footer move to a deep sage (the sage ink) with white text. The light sage band keeps its colour, with an ink heading and white cards. The block on the stripes becomes the white block the DA allows, with ink text. | Keeps the light sage band and the stripes as the brand's surfaces, and gives every white text a surface it can be read on. | Overrides the socle's taupe-block default for text blocks on the stripes. The DA's four button rows keep their shape, and their colours change. |
| D-3 | The change is made on the tokens, so it reaches the whole platform: the vitrine, the sign-in pages and the signed-in spaces. The portal is checked for regressions, not redesigned. | One set of colours, and the portal has the same taupe body text. | No change to the source. |
| D-4 | The layout fixes go into the shared vitrine components (header, hero and page header, step list, reason cards, sections, striped band), so every page that uses them gets the same polish. The homepage is the reference. | The oversized blocks come from those components. A homepage-only fork would leave the other pages as they are. | Widens "homepage" to the vitrine's shared blocks. |
| D-5 | No word changes. The H1 and every text stay as written, and the fixes are layout, size and colour only. | "The content and the structure of the design is good." | No change to the source. |
| D-6 | The hero H1 takes at most 4 lines at 1280 and 1440 px, and never overflows its column anywhere from 320 to 1920 px. It stays within the DA's scale (56–64 px desktop, 38–44 px mobile). | The DA's type scale holds. The column and the breakpoints give. | No change to the source. |
| D-7 | The image bank is recorded in this scope's source. A separate chore stub is parked to take the four PNGs (7.7 MB) out of git, since the WebPs are what ship. | "If the content in raw has not been processed, process it." OCR has nothing to read, and heavy binaries do not belong in git (AGENTS.md). | No change to the source. |
| D-8 | The scope and batch land directly on main. | The Scope contract and AGENTS.md's ticket-only rule. | No change to the source. |

## Out of scope

- Any word: copy, metadata, alt texts and the choice of photographs stay as they are. [D-5]
- Changing the five DA colours themselves. They stay as surfaces, borders and accents, and only text and filled-control colours move. [D-1]
- Comodo's rule « Utiliser uniquement en majuscule » (DA p. 13). The Fraunces stand-in is set in sentence case, and that waits for Surya's Comodo files.
- Redesigning the signed-in spaces. They receive the new tokens and are checked, nothing more. [D-3]
- New sections, new components, motion, a dark theme.
- The placeholder pages' own layout (qui-sommes-nous and the two legal pages), beyond what the shared blocks bring.
- Moving the image-bank PNGs out of git. That is its own chore. [D-7]

## Open for Define

- The exact ink hexes. The values above are close. Define fixes them with a contrast test over every declared text and surface pair, and flags them `@relecture` for Surya without blocking the build. → encres-contraste
- The buttons' hover states under the new colours. Today the butter hover carries sage text at 2.17:1. Propose ink text on butter. → encres-contraste
- The "Trouver une professionnelle" button on the light sage band: deep sage filled, or white with ink text? → encres-contraste
- The header between 1024 and 1440 px: show the full nav from a wider breakpoint, or tighten the nav so every link stays on one line. → premier-ecran
- Five reason cards: three plus two centred, two columns, or a layout with no empty slot. No sixth card, because no new words (D-5). → blocs-accueil
- The Gardiennes paragraphs: both at body size, or only the first at intro size. → blocs-accueil
