# Stub: A replaced photo whose object delete fails stays in the bucket with no row

- lane: bug
- found-by: onboarding-orphaned-objects release · 2026-09-29
- complexity: standard
- priority: P2

## Problem

Since `onboarding-double-photo-race` (#60), `recordUpload` (`src/lib/professionnelle/uploads.ts`)
deletes every other photo row of the profile inside the locked recording statement and hands back
their storage keys; `confirmUpload` (`src/app/(portail)/espace/professionnelle/actions.ts`) then
deletes those objects after the commit and only logs a failure. When that object delete fails
(the store unreachable, a credential rotated), the old photo stays in the private bucket with no
row pointing at it: the 30-day purge (D-41, D-55) and the account deletion (D-137) start from the
rows and never find it. `onboarding-orphaned-objects` made every other removal object-first; the
photo replacement kept #60's row-first order because the two merged at the same time.

## Proposed change

Keep #60's one-photo-under-lock result and make its object side safe. Either the locked statement
returns the other photo rows without deleting them, and `removeFiles`
(`src/lib/professionnelle/removals.ts`) then deletes their objects and, only for those that went,
their rows (two photo rows can then coexist until the next upload, which the pages must tolerate
by picking the newest); or a failed object delete re-inserts nothing but records the key where
the purge reads it. Test with injected storage, as `removals.test.ts` does.

## Prompt

In the berceo repo, read `.icm/intake/triage/onboarding-replaced-photo-orphan.md`, then make the
photo replacement in `confirmUpload` / `recordUpload` never leave an old photo's object in the
bucket without a row, keeping one photo per profile under concurrent uploads. Run it through
`/pipeline bug onboarding-replaced-photo-orphan`.
