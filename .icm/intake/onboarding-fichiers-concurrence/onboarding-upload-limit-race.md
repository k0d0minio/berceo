# Stub: Two parallel uploads can pass the three-files-per-document limit

- lane: bug
- found-by: onboarding-professionnelle release · 2026-09-24
- complexity: standard
- feature-slug: onboarding-upload-limit-race
- sequence: 1 of 3
- depends-on: none
- priority: P2

## Problem

`requestUpload` and `confirmUpload` (`src/app/(portail)/espace/professionnelle/actions.ts`) check
the three-files-per-document limit against a count read before the insert, with no lock or
constraint. A professional with two diplomas who uploads from two tabs, or twice in quick
succession, can end up with four `diplome` rows; the file slot then shows the slot over its limit.
Harmless to the founders' review, but the rule the spec states is not held by the database.

## Proposed change

Hold the limit where the insert happens: insert the row with a guarded statement (an
`INSERT … SELECT … WHERE (SELECT count(*) …) < 3` in one statement, or a per-profile advisory lock
around the count and the insert), and discard the uploaded object when the guard refuses. A test on
the pure part; the statement proven on a run branch.

## Prompt

In the berceo repo, read `.icm/intake/onboarding-fichiers-concurrence/onboarding-upload-limit-race.md`
and the epic's `breakdown.md`, then make
`confirmUpload` in `src/app/(portail)/espace/professionnelle/actions.ts` hold the
three-files-per-document limit atomically (one guarded insert, or an advisory lock), deleting the
uploaded object when it refuses. Run it through `/pipeline bug onboarding-upload-limit-race`.
