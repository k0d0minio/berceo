# Decisions: blocs-accueil

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-1 — Text on white and pearl uses two ink tones, darkened from sage and taupe on the same hue, at 4.5:1 or more on both surfaces: sage ink about #48685a, taupe ink about #636254.
- D-2 — White text on sage and taupe is fixed three ways. Filled buttons and the footer move to a deep sage (the sage ink) with white text. The light sage band keeps its colour, with an ink heading and white cards. The block on the stripes becomes the white block the DA allows, with ink text.
- D-3 — The change is made on the tokens, so it reaches the whole platform: the vitrine, the sign-in pages and the signed-in spaces. The portal is checked for regressions, not redesigned.
- D-4 — The layout fixes go into the shared vitrine components (header, hero and page header, step list, reason cards, sections, striped band), so every page that uses them gets the same polish. The homepage is the reference.
- D-5 — No word changes. The H1 and every text stay as written, and the fixes are layout, size and colour only.
- D-6 — The hero H1 takes at most 4 lines at 1280 and 1440 px, and never overflows its column anywhere from 320 to 1920 px. It stays within the DA's scale (56–64 px desktop, 38–44 px mobile).
- D-7 — The image bank is recorded in this scope's source. A separate chore stub is parked to take the four PNGs (7.7 MB) out of git, since the WebPs are what ship.
- D-8 — The scope and batch land directly on main.

## Made in this run

- D-17 — The reason cards run in two columns from md; an odd last card spans the full row, its paragraph held to 75 characters a line. Operator's choice in Define, 2026-09-25, over three-plus-two and centred layouts: titles get room for one line at the DA's H3 size.
- D-18 — Both Gardiennes paragraphs drop to body size. Operator's choice in Define, 2026-09-25, over an intro-size first paragraph: body size lands in the DA's 60–75 characters a line beside the photo.
- D-19 — The stripes' white block aligns left, H2, paragraph and button together. Define, 2026-09-25: the 280-character paragraph cannot fit three lines at 75 characters, so centring cannot meet the DA's rule; the operator chose one alignment for the whole block.
- D-20 — Below md the stripes' H2 sets at 26 px (a class on that heading, not a token): at 32 px Fraunces its shortest two-line split (« Vous êtes professionnelle ») is 380 px, and a 390 px phone's block gives 318 px even with the gutter at 12 px and the padding at 24 px. Operator's choice in Build, 2026-09-25, over accepting 3 lines on phones. A spec gap: Define should have measured it (Out of scope said the type sizes stay).
