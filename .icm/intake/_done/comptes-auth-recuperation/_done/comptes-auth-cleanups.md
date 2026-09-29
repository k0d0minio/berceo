# Stub: Auth code cleanups — one users-by-auth-id helper, dead reset redirectTo

- lane: chore
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: low
- feature-slug: comptes-auth-cleanups
- sequence: 1 of 3
- depends-on: none
- priority: P2

## Problem

The users-row lookup by `auth_user_id` and its "no row" log are written three times
(`src/lib/auth/current-user.ts`, `src/app/(auth)/actions.ts` signIn, the verification
confirmer route). `requestPasswordReset` builds `redirectTo` from the Origin header, which the
webhook ignores and which is a bare path when Origin is absent.

## Proposed change

One `userByAuthId()` helper; drop the Origin read or use the site URL; `requireAccess`
(`src/lib/auth/guard.ts`) still builds `retour` from the bare pathname, so pass path + query.

## Prompt

In the berceo repo, read `.icm/intake/comptes-auth-recuperation/comptes-auth-cleanups.md`. Extract one `userByAuthId()` helper for the three duplicated `users`-by-`auth_user_id` lookups, drop the Origin-header `redirectTo` in `requestPasswordReset`, and pass the full path plus query into `requireAccess`'s sign-in redirect (`src/lib/auth/guard.ts`) as the proxy already does. Run it through `/pipeline chore comptes-auth-cleanups`.
