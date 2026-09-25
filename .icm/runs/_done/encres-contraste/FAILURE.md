# Failures: encres-contraste

The run's retrospective — what cost a turn, and the rule that would have prevented it. Two
files share this job and split it cleanly: `error.log` (in the stage's `output/`) is the ledger
of errors a **tool** reported, written verbatim at the moment of the fix with its `- resolved:`
and `- rule:` lines, which `retrospective.sh` reads and counts across runs; **this file** is
what the run as a whole learned — a wrong assumption, a STOP, a skipped step, a gate that
blocked, a plan that had to be rewritten — which no tool ever logged. On close-out the
`## Learned rules` bullets below are copied into `_shared/project-rules.md` → Learned rules
(`run-pack.sh <slug> --sync-rules`, called by `close-out.sh`, the same shape as
`retrospective.sh --apply`), so the next run in this repo starts with them. Keep the rules
general; keep the retrospectives specific; never restate an `error.log` entry here.

## Retrospectives

### 2026-09-25 — the scope's sage ink failed on the sage band

- what happened: the scope proposed a sage ink of « about #48685a », measured only on white and
  pearl; on the light sage band, where D-2 puts the ink heading, the focus ring and the filled
  button, it reaches 2.57:1, under the 3:1 large text needs.
- why: the ink was measured on the surfaces text sits on today, not on every surface the same
  decision moves text onto.
- fixed by: Define, with the operator: one darker sage ink, `#3c584b` (D-9).

### 2026-09-25 — the spec's pair list missed two surfaces

- what happened: Build found the confirmation dialog (white on red 3.40:1, taupe ink on green
  3.84:1) and the translucent pearl block over sage (taupe ink 3.99:1) failing AA; the spec's
  "every declared pair" covered them, but its proposed change did not say how. Build stopped to
  ask for the dialog (D-11) and decided the veil (D-12).
- why: Define listed the surfaces from the homepage and the components the scope named, not
  from every component in `src/components/ui/` that sets its own background.
- fixed by: 2473f09, ab11feb (D-11, D-12).

## Learned rules

- When a spec changes colours platform-wide, Define lists every text and surface pair from every component under `src/components/ui/` that sets its own background (the confirmation dialog, the translucent veil included), and measures each proposed value on every surface the change moves text onto.
