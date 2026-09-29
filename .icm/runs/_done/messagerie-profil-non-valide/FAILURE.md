# Failures: messagerie-profil-non-valide

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

### 2026-09-29 — Define numbered D-153 to D-155 without reading the open branches

- what happened: three sibling runs defined on 2026-09-28 (`reservations-regles-non-appelees`, `gardes-shared-helpers`, `reservations-deux-gardes-meme-nuit`) had already taken D-153 to D-155 on their own branches; Define read only `main` and the working tree.
- why: the learned rule « list every remote branch and grep each for its highest `D-n` » was not applied in Define (the project rules are Build's input, not Define's).
- fixed by: Build renumbered this run's decisions to D-156, D-157, D-158 in `spec.md`, `decisions.md`, `plan.md`, `project.md` and `handoff.md` before the first code edit; ids only, no requirement changed, so the PR body (which cites none) and the Spec approved gate stand.

## Learned rules

- none new: the existing rule on reading every remote branch before numbering a decision covers it.
