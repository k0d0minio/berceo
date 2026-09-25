# Decisions: premier-ecran

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

- D-14 — The header shows its full nav from xl (1280 px); below it the menu panel serves. The full row measures 1,130 px against the 1,088 px `max-w-6xl` container, so links take `whitespace-nowrap` and the row's gaps and the header capsules' side padding tighten (to about 1,070 px). Operator, in Define (2026-09-25).
- D-15 — From lg the hero and `PageHeader` photographs fill the text block's height, cover-cropped, over a top-aligned 16:9. Operator, in Define (2026-09-25).
- D-16 — Below 360 px the hero's side gutter narrows to 12 px and its H1 sets at 38 px: « professionnelles » measures 294 px at the DA's 38 px floor against a 288 px column at 320 px with the site's 16 px gutter, so D-6's 38–44 px and "never overflows from 320" could not both hold. Operator, in Build (2026-09-25) — a spec gap; see notes.md → Notes for Release.
