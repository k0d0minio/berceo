# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: clear the two Neon settings under Blockers (runtime configuration, no rebuild).
2. Operator: smoke the PR preview against the acceptance criteria; the full-gate verdict and the
   preview URL are in the Build stop message and on PR #22.
3. Tick **Ready to merge**, then `release comptes-neon-auth`.

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
