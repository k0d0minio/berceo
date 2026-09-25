# Stub: One place that says what a suspended account hides from

- lane: chore
- found-by: back-office-admin release review · 2026-09-25
- complexity: medium
- priority: P3

## Problem

Suspension (back-office-admin, D-134) is held out of about twelve readers in eight modules, written
three ways: `notSuspended()` from `src/lib/auth/suspension.ts`, the same `not exists (select 1 from
users su …)` copied as raw SQL (`src/lib/avis/ratings.ts` `raterActive`,
`src/lib/reservations/answers.ts` `answerRequest`, `src/lib/admin/review.ts` `decide`), and
`isNull(users.suspendedAt)` where `users` is already joined (`reservations/profiles.ts`,
`reservations/notices.ts`, `demandes/requests.ts`, `admin/review.ts` `loadQueue`). Every reader works
today, but a change to the rule (an expiry, a different treatment of deleted accounts) reaches only
the readers that call the helper, and the next reader of validated professionals may forget it; the
release review found `loadQueue` had.

## Proposed change

Pick one enforcement point and move every reader onto it: either every reader calls
`notSuspended(<user id column>)` (and a source test fails on `suspended_at` named anywhere else), or
a view (`visible_professionals`, `active_users`) the readers select from. Keep the behaviour
identical; the recherche and suspension tests hold it.

## Prompt

In the berceo repo, read `.icm/intake/triage/suspension-one-predicate.md`, `src/lib/auth/suspension.ts`
and every file that names `suspended_at` or `suspendedAt` under `src/lib/`. Move each reader onto one
enforcement point, add a source test that refuses the rule written anywhere else, and run it through
`/pipeline chore suspension-one-predicate`.
