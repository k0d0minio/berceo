# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: clear what is left of blocker 3 below (the e-mail verification settings). Neon
   refuses the **link** method while a branch uses its shared e-mail provider, so this needs
   your decision first.
2. Then operator: `build comptes-neon-auth` (re-runs env audit, flips ready, full gate, preview
   URLs).
3. After the smoke: tick **Ready to merge**, then `release comptes-neon-auth`.

## Blockers

1. **`.env.example`**: done (2026-09-24). `NEON_AUTH_BASE_URL` `[production,preview]`,
   `NEON_AUTH_COOKIE_SECRET`, `RESEND_API_KEY` and `EMAIL_FROM` `[production,preview,development]`
   are declared by name, each with its own note. Each key carries a `[targets]` suffix: without
   one, `env.sh` reads the note as empty (two tabs collapse in its `read`) and the Vercel check
   defaults to all three targets. `env.sh audit --changed` → `RESULT: OK (0 warnings)`.
2. **Vercel env**: done (operator). The audit sees `NEON_AUTH_COOKIE_SECRET`, `RESEND_API_KEY`,
   `EMAIL_FROM` on development, preview and production, and `NEON_AUTH_BASE_URL` on preview and
   production.
3. **Neon Auth configuration**: **partly done.**
   - Webhook on `preview/uat` (`br-steep-butterfly-b27l5oo9`): done by API. The GET after the
     PUT reads `{"enabled":true,"webhook_url":"https://uat.berceo.be/api/webhooks/neon-auth","enabled_events":["send.magic_link"],"timeout_seconds":5}`.
     `main` and the PR preview have no webhook (D-36; Vercel SSO), as before:
     `{"enabled":false,"enabled_events":[],"timeout_seconds":5}`.
   - **E-mail verification: not done on any branch.** `PATCH .../auth/email_and_password` with
     `require_email_verification: true`, `send_verification_email_on_sign_up: true`,
     `email_verification_method: "link"`, `auto_sign_in_after_verification: true` answered
     **HTTP 400** on `preview/uat` and on `preview/claude/nifty-turing-dlhore`:
     `INVALID_EMAIL_VERIFICATION_METHOD` — "Verification link is not supported for shared email
     provider". All three branches use `email_provider` `{"type":"shared"}`. Nothing was changed
     partially: switching verification on with OTP would contradict D-30 and send codes the pages
     do not ask for. On `main` the call was not made: the session's permission rules refused a
     production write, so `main` is yours by hand in any case.
   - The three branches still read `{"enabled":true,"email_verification_method":"otp","require_email_verification":false,"auto_sign_in_after_verification":true,"send_verification_email_on_sign_up":false,"send_verification_email_on_sign_in":false,"disable_sign_up":false}`.
   - The decision it needs: link verification requires a custom (`standard`, SMTP) e-mail
     provider on each branch. Resend offers SMTP, which would keep D-28's sender; setting it
     means an SMTP password in Neon, which is yours to enter. Then re-apply the four fields on
     `main`, `preview/uat` and the PR preview (a preview created before `main` changes keeps its
     old copy). Whether Neon still defers to the `send.magic_link` webhook on uat once a
     standard provider is set is not documented on the pages read; check it in the uat smoke.
4. **Resend domain**: done (operator).

Done by Build earlier: Google sign-in removed on `main`, `preview/uat` and this PR's preview;
`https://www.berceo.be` added to `main`'s trusted domains (the integration manages the
previews' and uat's).

## Do not

- Do not tick either gate checkbox.
- Do not write data to Neon `main` (production).
- Do not set `main`'s webhook before `www.berceo.be` serves `/api/webhooks/neon-auth`.
- Do not add a Vercel protection bypass to make webhooks reach PR previews.
- Do not commit an e-mail address, the Resend key or the cookie secret.
