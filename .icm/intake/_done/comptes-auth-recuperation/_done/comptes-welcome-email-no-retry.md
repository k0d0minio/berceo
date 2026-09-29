# Stub: A failed welcome e-mail is never retried

- lane: bug
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: low
- feature-slug: comptes-welcome-email-no-retry
- sequence: 3 of 3
- depends-on: comptes-auth-cleanups
- priority: P2

## Problem

`src/lib/auth/welcome.ts` releases `welcome_sent_at` after a failed send, but
`sendWelcomeIfDue` is only called on the confirmer's first click; later clicks and sign-ins never
call it, so the family never gets the welcome.

## Proposed change

Call `sendWelcomeIfDue` from a later touchpoint (the family space guard), or drop the release.
In the same confirmer (`src/app/(auth)/verification-email/confirmer/route.ts`), the `users` SELECT
after Neon consumed the token is unguarded: a DB error there 500s the route and drops the session
cookies. Guard it. The welcome could also move behind `after()` in the confirmer so the first click does not wait on Resend.

## Prompt

In the berceo repo, read `.icm/intake/comptes-auth-recuperation/comptes-welcome-email-no-retry.md`. `sendWelcomeIfDue` (`src/lib/auth/welcome.ts`) is only called on the verification confirmer's first click, so a failed welcome e-mail is never retried. Add a later retry point (the family space guard) or drop the claim release, and consider sending it after the redirect with `after()`. Run it through `/pipeline bug comptes-welcome-email-no-retry`.
