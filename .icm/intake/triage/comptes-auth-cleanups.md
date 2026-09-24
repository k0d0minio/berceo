# Stub: Auth code cleanups — one users-by-auth-id helper, dead reset redirectTo

- lane: chore
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: low

## Problem

The users-row lookup by `auth_user_id` and its "no row" log are written three times
(`src/lib/auth/current-user.ts`, `src/app/(auth)/actions.ts` signIn, the verification
confirmer route). `requestPasswordReset` builds `redirectTo` from the Origin header, which the
webhook ignores and which is a bare path when Origin is absent.

## Proposed change

One `userByAuthId()` helper; drop the Origin read or use the site URL.
