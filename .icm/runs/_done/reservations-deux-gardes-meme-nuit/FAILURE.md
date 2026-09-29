# Failures: reservations-deux-gardes-meme-nuit

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

### 2026-09-28 — Define numbered its decisions D-153–D-155, already taken by three sibling runs

- what happened: at Build's start, a scan of every remote branch found `reservations-regles-non-appelees`, `gardes-shared-helpers` and `messagerie-profil-non-valide` using D-153 to D-155, all defined within the same two minutes.
- why: Define read only `main` and the archive for the highest `D-n`; it skipped the learned rule that asks for every remote branch, re-read right before the commit.
- fixed by: Build renumbered this run's three decisions to D-156, D-157 and D-158 in the spec and the run files (the PR body carries no ids, so the approved spec's text is otherwise unchanged).

## Learned rules

