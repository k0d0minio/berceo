# Stub: A failed welcome e-mail is never retried

- lane: bug
- found-by: comptes-neon-auth release review · 2026-09-24
- complexity: low

## Problem

`src/lib/auth/welcome.ts` releases `welcome_sent_at` after a failed send, but
`sendWelcomeIfDue` is only called on the confirmer's first click; later clicks and sign-ins never
call it, so the family never gets the welcome.

## Proposed change

Call `sendWelcomeIfDue` from a later touchpoint (the family space guard), or drop the release.
It could also move behind `after()` in the confirmer so the first click does not wait on Resend.
