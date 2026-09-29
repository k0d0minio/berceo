# Stub: Parallel runs race for the same decision ids

- lane: chore
- found-by: template-change · 2026-09-29
- complexity: standard

## Problem

Decision ids (`D-n`) are one repo-wide counter. Every stage picks "highest `D-n` seen + 1" at
the moment it writes, and nothing reserves a number. On 2026-09-28 four berceo Defines
(`reservations-regles-non-appelees`, `gardes-shared-helpers`, `messagerie-profil-non-valide`,
`reservations-deux-gardes-meme-nuit`) all took D-153 onward within two minutes. Each Build then
renumbered to D-156 onward. Two of those merged first (#58, #59, both D-156 to D-158), and
`reservations-regles-non-appelees` renumbered a second time at Release, to D-167/D-168 (PR #57).
By then open branches held ids up to D-166. Seven learned rules in berceo's
`_shared/project-rules.md` already say "re-read every remote branch before numbering", and none of
them stops the race, because every check before the merge can go stale.
A pointer, never a cut: no lane here consumes it.

## Prompt

Template change request — from berceo · 2026-09-29

In the icm-board repo (`~/Apps`), change how the template-owned pipeline numbers decisions. The
files are `_system/template/icm-pipeline/_shared/scope-template.md` (the Decisions table),
`_system/template/icm-pipeline/stages/02_define/CONTEXT.md` (step 5, seeding `decisions.md`),
`_system/template/icm-pipeline/stages/03_build/CONTEXT.md`,
`_system/template/icm-pipeline/stages/04_release/CONTEXT.md`,
`_system/template/icm-pipeline/_shared/run-pack/decisions.md` and
`_system/template/icm-pipeline/scripts/validate-decisions.sh` (in every pipeline repo: the same
paths under `.icm/`, `T` lines of the MANIFEST). Read `_system/contracts/PIPELINE.md` → File-level
ownership first.

What it says today (berceo's copy, `.icm/template-version`: icm-board e7a99bb),
`_shared/scope-template.md`:
> Ids are stable — `D-n` is the trace from this table to the stub's `Notes for Define` to the spec,
> so a decision is never renumbered.

and `_shared/run-pack/decisions.md`:
> - <D-n (the next free id) — the decision, why, which stage made it. …>

What it should say or do: stop using one global sequential counter written by parallel sessions.
Either scope a run's own decisions to the run (for example `D-<slug>-1`, or a `D-n` local to
`decisions.md` that `validate-decisions.sh` resolves as `<slug>#D-n`), keeping the global `D-n`
only for decisions Scope settles, which are numbered in one sitting on `main`. Or add a scripted
reservation (a `next-decision-id.sh` that reads `origin/main` plus every remote branch and records
the claim in one commit to `main`) that Define and Build must call. Keep the rule that an id, once
merged, is never renumbered.

Why: berceo run `reservations-regles-non-appelees` (PR #57) renumbered its decisions twice (at
Build and at Release), and its three sibling runs each renumbered once. Every renumbering rewrites
spec, decisions, handoff, tests and README text. The repo's learned rules on this collision (7 of
them since 2026-09-25) show the manual "re-read every branch" check does not hold.

Then: prove it (the fixture, or a read-only run against projects/berceo on Jamie's machine), ship
it through a PR on a `claude/` branch, and after the merge bring it back with
`_system/scripts/icm-sync.sh --apply projects/berceo` (and the other pipeline repos as
`/icm-check` lists them). Do not edit `projects/berceo/.icm/<path>` in place. Retire
`projects/berceo/.icm/intake/triage/template-change-decision-id-race.md` to `_done/` in the sync
commit.
