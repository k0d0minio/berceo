# Build notes: encres-contraste

- commits: 2473f09 (the inks, the contract, the contrast test), ab11feb (the rename, the surfaces and controls, the design system page)
- ci: GREEN on 5d30df8 — the Vercel preview and Quality (advisory) (lint, typecheck, vitest with the contrast test) both passed

## What changed

- `src/app/globals.css`: `--encre-sauge: #3c584b` and `--encre-taupe: #646254` (each `@relecture`), `--color-encre-*`; the shadcn contract's foregrounds, `--destructive` and `--input` on the taupe ink, `--primary` and `--ring` on the sage ink; `::selection` text on the taupe ink; `--rouge-confirmation` `#ed5957` → `#bc312f` (D-11). The five DA values are untouched.
- `src/app/contrast.test.ts` (new): parses `:root` from `globals.css` (comments stripped, `var()` chains followed), 43 text and surface pairs held to 4.5:1 (body) or 3:1 (large, boundary), opacity suffixes and the pearl veil composited, the five DA values and the two inks asserted, and a scan of every `.ts`/`.tsx` under `src/` refusing `text-sauge` and `text-taupe`. Every pair was checked in session by a Python copy of the same arithmetic: 0 failing.
- The rename over 67 files: `text-sauge` → `text-encre-sauge`, `text-taupe` → `text-encre-taupe`, prefixes and opacity suffixes kept.
- `src/components/ui/button.tsx`: the four rows per the spec's table.
- `src/components/ui/card.tsx`: `sauge` and `taupe` tones on the inks with white text and a white focus ring.
- `src/components/ui/striped-section.tsx`: the white block only; the `block` prop and its taupe branch removed (no caller passed it).
- `src/components/vitrine/section.tsx`: the sage band's heading in the sage ink; the band sets no white text.
- `src/components/shell/public-footer.tsx`: the sage-ink footer, white focus ring (`[--ring:var(--blanc)]`).
- `src/components/ui/confirm-dialog.tsx`: the green answer's text on the sage ink (D-11).
- `src/components/ui/translucent-block.tsx`: text on the sage ink (D-12).
- `src/components/ui/input.tsx`: placeholder `/70` → `/90` (4.86:1); fields' focus border on the sage ink, here and in the hand-rolled fields (`request-form`, the two `profile-form`s, `decision-panel`).
- `src/components/ui/tabs.tsx`: the inactive tab at full ink (on pearl no dimmed step passes; the component is used nowhere today).
- `src/components/disponibilites/availability-calendar.tsx`, `professionnelle/steps-header.tsx`, `file-slot.tsx`, `commune-picker.tsx`: white-on-sage fills and control borders on the sage ink; the selected night's outline per D-13. The progress bar's sage fill stays (the step counter says it in text).
- `src/app/(public)/design-system/page.tsx`, `src/content/design-system.ts`: the two ink swatches (`@relecture`), the `blanc` row's hover sample, the taupe row shown on white and labelled « Dans le bloc blanc sur le motif rayé ».
- `.icm/intake/triage/emails-encres-contraste.md`: the e-mail templates repeat the old palette as literals; parked as a tweak.

## Acceptance criteria status

- [x] The contrast test reads `globals.css`, lists the pairs, fails below 4.5 / 3 — written; its run is the advisory quality job's.
- [x] The same test refuses `text-sauge` / `text-taupe` — none left (`grep` in session: 0).
- [x] The inks are `#3c584b` and `#646254`, in `globals.css` only, `@relecture`; the five DA values unchanged; no component, page or content file carries a colour literal.
- [x] The four button rows at rest and on hover per the spec's table; text ≥ 4.5 in both states (in the test).
- [x] Field borders, the `blanc` and `raye` outlines and the focus ring ≥ 3:1; the footer's ring is white.
- [x] Footer, sage band, striped block, card tones as specified.
- [x] No white text on sage, taupe, pearl or butter: calendar, step header, file slot on the sage ink.
- [x] Placeholder and dimmed text ≥ 4.5 composited (placeholder /90; dimmed error /90; inactive tab full ink).
- [x] `/design-system` shows the two ink swatches and the new rows; `/design-system/portail` needed no edit.
- [ ] The preview at 390 and 1440 px on the spec's page list — the operator's smoke, after the flip.

## Notes for Release

- Three spec gaps were decided in Build (decisions.md D-11, D-12, D-13): the confirmation red changed value (the operator's choice), the translucent block's text ink, the selected-night outline. Review them against D-24 and the DA.
- The butter hover's edge is below 3:1 against white and sage by the spec's decision; the test documents it and does not assert it.
- `README.md` → the design system section and `AGENTS.md`'s light-DA line mention the palette; Release should add the two inks there.
- Nothing ran locally: no `node_modules` in the session and the repo's rule is that CI is the source of truth. The test's arithmetic was mirrored in Python; its TypeScript compiles only in the advisory job.

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on f524f16 (ci-status.sh, full gate: Vercel and Quality (advisory)); re-read after the last push
- reviews: code medium (/code-review — no findings) · security security-check.sh --branch --audit: OK · /security-review n/a (no auth, payments, PII or route policy touched) · /production-readiness n/a (no DB, auth, payments or env var touched) · readiness env.sh audit --changed: OK
- parked: none from the reviews (Build parked emails-encres-contraste.md)
- migrations: skip — none of this run's own
- learned: 1 rule, from FAILURE.md, through close-out.sh (no error.log — retrospective.sh SKIP)
- docs: README.md (the design system section: the inks, the test, the button rows) and AGENTS.md (the light-DA standing rule) · announce: deferred to promotion
