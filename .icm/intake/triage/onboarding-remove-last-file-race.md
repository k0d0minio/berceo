# Stub: Two removals at once can empty a submitted file's document slot

- lane: bug
- found-by: onboarding-orphaned-objects define · 2026-09-29
- complexity: low
- priority: P3

## Problem

`removeFile` (`src/app/(portail)/espace/professionnelle/actions.ts`) keeps a submitted file
complete by refusing to remove the last file of a kind (`dernier`), checked against the count it
read before deleting, with no lock. Two removals at once (two tabs, a double click on two files)
of the last two files of a kind both read two, both pass, and the slot ends empty on a profile
the founders are verifying or have validated. The same read-then-write shape
`onboarding-upload-limit-race` closed on the upload side.

## Proposed change

Hold the rule under the profile's lock, as `recordUpload` (`src/lib/professionnelle/uploads.ts`)
does: lock the profile row, then delete the row only when, read after the lock, another file of
that kind remains (a guarded delete in the same batch). Keep the object-first order
`onboarding-orphaned-objects` sets: only delete the object once the guard says the row may go,
or re-check after.

## Prompt

In the berceo repo, read `.icm/intake/triage/onboarding-remove-last-file-race.md`, then make
`removeFile` in `src/app/(portail)/espace/professionnelle/actions.ts` hold the "last file" rule
under the profile's lock, keeping the object-before-row order. Run it through
`/pipeline bug onboarding-remove-last-file-race`.
