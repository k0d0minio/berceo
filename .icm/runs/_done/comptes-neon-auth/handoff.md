# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

Merged into `uat` and archived; nothing to pick up in this run. It rides the UAT batch to
production (`uat status`, then `uat approve` on the client's sign-off).

Carried outside the run:
- `uat.berceo.be` does not resolve (triage `uat-address-dns`); until it does, the uat webhook
  cannot deliver, so no verification or reset e-mail leaves uat.
- Neon Auth: `send_verification_email_on_sign_up` is false on main, preview/uat and the PR
  preview, and the PR preview's method is otp. Runtime configuration, the operator's.
- `main`'s webhook (`https://www.berceo.be/api/webhooks/neon-auth`, `send.magic_link`) is set at
  the promotion, once www serves the route (D-36).
- Four review findings parked in `.icm/intake/triage/comptes-*`.

## Blockers

None for this run.

## Do not

- Do not write data to Neon `main` (production).
- Do not set `main`'s webhook before `www.berceo.be` serves `/api/webhooks/neon-auth`.
- Do not add a Vercel protection bypass to make webhooks reach PR previews.
- Do not commit an e-mail address, the Resend key or the cookie secret.
