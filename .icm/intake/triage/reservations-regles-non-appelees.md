# Stub: The reservation rules the SQL restates are tested but never called

- lane: chore
- found-by: candidature-et-reservation release review · 2026-09-25
- complexity: low
- priority: P2

## Problem

`isOnHerList`, `canWithdraw`, `acceptTransition`, `declinedOnClose` and `canSendInPriority` in
`src/lib/reservations/rules.ts` are exported and unit-tested, but production never calls them:
the SQL in `src/lib/demandes/requests.ts`, `src/lib/reservations/answers.ts` and `bookings.ts`
restates each rule. The tests can pass while the SQL disagrees.

## Proposed change

Either call each helper where it decides something in the app (a page choosing which buttons to
show, the actions' messages), or delete the unused ones and cover the SQL with a probe-style
integration test against a Neon branch.

## Prompt

In the berceo repo, read `.icm/intake/triage/reservations-regles-non-appelees.md`. For each
uncalled helper in `src/lib/reservations/rules.ts`, wire it where a page or action decides the
same thing, or remove it and its tests. Run it through `/pipeline chore reservations-regles-non-appelees`.
