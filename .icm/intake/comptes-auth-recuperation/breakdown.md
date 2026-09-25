# Breakdown: Comptes — auth lookup cleanup and sign-up recovery

## What was understood

Three findings from the comptes-neon-auth release review (2026-09-24) all sit on the same
seam: the `users`-row lookup by Neon Auth's `auth_user_id`, repeated in three call sites
(`src/lib/auth/current-user.ts`, `src/app/(auth)/actions.ts` signIn, the verification
confirmer route), and the two places that seam breaks — a sign-up whose `users` row never
gets written (locking the address out for good) and a confirmer route whose unguarded
`users` SELECT can drop the welcome e-mail along with the session cookies. Grouped because
the sign-up recovery and the welcome-e-mail guard both read or touch the same lookup the
cleanup extracts, so doing the extraction first avoids writing the recovery logic against
code that is about to move.

## Build order

1. **comptes-auth-cleanups** (chore, P2) — extract the one `userByAuthId()` helper, drop
   the dead Origin-header `redirectTo`, fix `requireAccess`'s bare-pathname `retour`. No
   behaviour change; establishes the single lookup the next two stubs build on.
2. **comptes-orphaned-auth-identity** (bug, P1) — recover a sign-up whose `users` row
   failed to write, using `userByAuthId()` to detect the orphaned identity on retry or
   first sign-in.
3. **comptes-welcome-email-no-retry** (bug, P2) — guard the confirmer's `users` SELECT and
   add a later retry point for the welcome e-mail, in the same route the cleanup already
   touched.

Depends-on lines route 2 and 3 through 1; 2 and 3 have no dependency on each other and can
build in either order once 1 lands.
