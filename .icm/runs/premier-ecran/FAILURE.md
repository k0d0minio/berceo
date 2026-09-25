# Failures: premier-ecran

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

### 2026-09-25 — two acceptance criteria could not both hold at 320 px

- what happened: Build's preview measurement showed `/` scrolling sideways at 320 px. The hero H1's longest word, « professionnelles », is 309 px at 40 px and 294 px at the DA's 38 px floor, against a 288 px column (320 px less the 16 px gutters). The spec asked for 38–44 px on mobile and no overflow from 320 px (D-6), which cannot both be true with the site's gutters. The same overflow is live on uat.berceo.be.
- why: Define estimated the header row and the H1's line count at desktop widths from character counts, and never measured the longest word against the narrowest width the criteria name.
- fixed by: the operator's choice in Build (D-16): below 360 px the hero gutter narrows to 12 px and the H1 sets at 38 px (f928743).

### 2026-09-25 — Define committed `status.md` empty

- what happened: Build's preamble found `status.md` with no content.
- why: a one-line Python edit opened the file for writing before reading it, which truncated it; `run-pack.sh --check` only tests presence.
- fixed by: `status.md` rewritten at Build start.

## Learned rules

- When a spec names a narrowest width and a type floor for a heading, Define measures the heading's longest word at that floor against the column that width leaves (after gutters), and settles the conflict before approval.
