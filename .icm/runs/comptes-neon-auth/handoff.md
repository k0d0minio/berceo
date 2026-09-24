# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: the release on 2026-09-24 stopped on a security finding (stop class 2): sign-up
   trusted the role argument from the client, so anyone could sign up as admin. Fixed in
   c63bef7 (`isSignUpRole()` + tests) with four small review fixes; full gate GREEN on c63bef7.
   Re-smoke the preview (sign up as a family, verify, land in /espace/famille), keep **Ready to
   merge** ticked if it passes, then `release comptes-neon-auth`. Release re-runs the reviews on
   the new head.
2. The Neon settings below are runtime configuration, fixed in the console, no rebuild.

## Blockers

The PR is open (flipped 2026-09-24). Env audit OK, Vercel values set, Resend domain sending
(DKIM and SPF verified). Neon Auth, read by API on 2026-09-24:

| Branch | E-mail provider | Method | Required | Send on sign-up | Webhook |
|---|---|---|---|---|---|
| `main` | Resend SMTP | link | yes | **no** | off (D-36) |
| `preview/uat` | Resend SMTP | link | yes | **no** | `send.magic_link` → uat.berceo.be |
| `preview/claude/nifty-turing-dlhore` | Resend SMTP | **otp** | yes | **no** | off |

1. **`send_verification_email_on_sign_up` is false on all three branches.** Sign-up
   (`src/app/(auth)/actions.ts`) relies on Neon to send the first verification e-mail; with this
   off, a new account gets none until "renvoyer" is used, and criterion 2 fails. The console's
   "Verify at Sign-up" switch set `require_email_verification`, not this field; it may only be
   settable by API: `PATCH /projects/tiny-cell-08223046/branches/<id>/auth/email_and_password`
   `{"send_verification_email_on_sign_up": true}`. This session's permission rules refuse Neon
   writes, so it is the operator's (or a session allowed to PATCH `…/auth/*`).
2. **The PR preview's method is `otp`**; the pages expect a link (D-30). Set it to `link` on
   `br-withered-dust-b2e7eht6`.
3. **`uat.berceo.be` does not resolve** (triage `uat-address-dns`, someone else's act). Until
   it does, the uat webhook cannot deliver, so no verification or reset e-mail leaves uat. Does
   not block the PR preview smoke; blocks the founders' test on uat.

Also: the sender is `mail.jamienisbet.com`, a stand-in; D-28 expects a Berceo domain before launch.

## Do not

- Do not tick either gate checkbox.
- Do not write data to Neon `main` (production).
- Do not set `main`'s webhook before `www.berceo.be` serves `/api/webhooks/neon-auth`.
- Do not add a Vercel protection bypass to make webhooks reach PR previews.
- Do not commit an e-mail address, the Resend key or the cookie secret.
