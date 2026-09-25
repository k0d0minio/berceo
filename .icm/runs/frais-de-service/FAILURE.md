# Failures: frais-de-service

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

### 2026-09-25 — Define numbered D-87 to D-94 over ids a sibling run had taken the same day

- what happened: Build's check of every open branch found `messagerie` (branch `claude/tender-albattani-vje2w4`, defined the same day) using D-87 to D-91 for its own decisions; this run's Define had read only `main` and the archive before numbering D-87 to D-94.
- why: Define skipped the learned rule « read the highest `D-n` on `main` and on every open run's branch »; the sibling's branch existed when this run was defined.
- fixed by: nothing renumbered yet — neither run has merged. Build numbered its own decisions from D-95, clear of both; whichever of the two merges second renumbers its colliding ids (Notes for Release).

## Learned rules

- Before Define numbers a decision, list every remote branch (`git branch -r`) and grep each for its highest `D-n`; a same-day sibling's branch counts even before it has a PR.
