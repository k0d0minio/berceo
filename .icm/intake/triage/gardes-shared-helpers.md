# Stub: Share the garde's helpers instead of copying them

- lane: chore
- found-by: cycle-de-garde-et-annulation release review · 2026-09-25
- complexity: low

## Problem

The cycle-de-garde-et-annulation run copied helpers that already existed:

- `hasNightEnded` and `otherSide` in `src/lib/gardes/rules.ts` repeat `src/lib/messagerie/rules.ts`;
  the conversation's closing (D-89) and the garde's « Terminée » and address visibility (D-110)
  must end at the same moment, and now live in two copies.
- `gardeNotice` in `src/lib/gardes/gardes.ts` repeats `bookingNotice` in
  `src/lib/reservations/notices.ts` (same aliases and joins) plus two columns.
- The cron bearer check `authorised()` is copied in `src/app/api/cron/demandes-digest/route.ts` and
  `src/app/api/cron/gardes-rappel/route.ts`; `checkedId()` in both gardes actions files.

## Proposed change

Move `hasNightEnded` into `src/lib/demandes/rules.ts` beside `hasNightStarted` and `endTime` and
import it from both modules (and one `otherSide`); let `bookingNotice` carry the cancellation
columns and drop `gardeNotice`; one `isCronAuthorised` in `src/lib/`. No behaviour change; the
existing tests hold.

## Prompt

In the berceo repo, read `.icm/intake/triage/gardes-shared-helpers.md` and remove the three duplications it lists without changing behaviour: `hasNightEnded`/`otherSide` into one home (`src/lib/demandes/rules.ts`), `gardeNotice` folded into `bookingNotice` (`src/lib/reservations/notices.ts`), and one cron bearer check shared by both `src/app/api/cron/*/route.ts`. Run it through `/pipeline chore gardes-shared-helpers`.
