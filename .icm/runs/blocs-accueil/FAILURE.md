# Failures: blocs-accueil

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

### 2026-09-25 — Define numbered its decisions D-9 to D-11, ids the scope's earlier runs had taken

- what happened: Build found `encres-contraste` (D-9 to D-13) and `premier-ecran` (D-14 to D-16), both archived in `.icm/runs/_done/`, already using the ids this run's Define took for its three layout decisions.
- why: Define read only the scope's Decisions table (D-1 to D-8) and skipped the learned rule on reading the highest `D-n` elsewhere before numbering; the sibling runs' ids live in their own `decisions.md`, not in `scope.md`.
- fixed by: Build renumbered them D-17, D-18 and D-19 in `spec.md` and `decisions.md` (no criterion or body text changed, so the PR body and the Spec approved gate are unaffected).

## Learned rules

- Before Define numbers a decision, grep `.icm/runs/*/decisions.md` and `.icm/runs/_done/*/decisions.md` for the scope's highest `D-n`; the earlier runs of the same scope number theirs after `scope.md`'s table.
