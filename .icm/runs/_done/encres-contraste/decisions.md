# Decisions: encres-contraste

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

- D-9 — One sage ink, `#3c584b`, everywhere, deeper than the scope's « about #48685a »: #48685a
  reaches only 2.57:1 on the light sage band, where the ink heading, the focus ring and the
  filled button sit; `#3c584b` reaches 3.25:1 there and 7.81:1 on white. Define, the operator's
  choice (2026-09-25).
- D-10 — The "Trouver une professionnelle" button on the light sage band stays on the `sauge`
  row: deep sage filled, white text. Define, the operator's choice (2026-09-25).
- D-11 — The confirmation dialog passes AA too: `--rouge-confirmation` darkens on its own hue
  from `#ed5957` to `#bc312f` (white on it 3.40 → 5.80:1), and the green answer's text is the
  sage ink (4.88:1; the taupe ink was 3.84). D-24's rule is unchanged, only the red's value.
  Build, the operator's choice (2026-09-25) — a spec gap: the spec's pair list covered it, its
  proposed change did not.
- D-12 — The translucent block's text is the sage ink, not the taupe ink: the pearl veil lets
  its backdrop through, and over the sage band the taupe ink is 3.99:1 where the sage ink is
  5.07:1. Build — a spec gap (the veil was not in the spec's list of surfaces).
- D-13 — The calendar's selected-night outline is butter on a marked (sage-ink) night and the
  taupe ink on an unmarked (butter) one, so the outline reads against the cell it sits on.
  Build, within the spec's "the selected night's outline takes the inks".
