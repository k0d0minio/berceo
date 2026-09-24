# Stub: A sign-up whose users row fails to write locks the address out for good

- lane: bug
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: medium

## Problem

`src/app/(auth)/actions.ts` signUp: Neon Auth creates the identity, then `db.batch` (users +
consents) fails. A retry gets USER_ALREADY_EXISTS and redirects without writing the row; the
verified user then hits `compteIndisponible` on every sign-in. Nothing backfills or cleans up.

## Proposed change

Recover in place: on "existe", or on a signed-in identity with no row, write the missing row from
what is known (or delete the Neon identity when the batch fails), with a test for each path.

## Prompt

In the berceo repo, read `.icm/intake/triage/comptes-orphaned-auth-identity.md`. In `src/app/(auth)/actions.ts` signUp, a Neon Auth identity can exist without its `users` row when the Drizzle batch fails, and the address is then locked out. Make it recoverable (write the missing row on a retry or on the first sign-in, or remove the Neon identity when the batch fails), with a test per path. Run it through `/pipeline bug comptes-orphaned-auth-identity`.
