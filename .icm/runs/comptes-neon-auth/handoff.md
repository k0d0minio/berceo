# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: clear the four blockers below (each is yours: a value, a setting, or a file this
   session may not write).
2. Then `build comptes-neon-auth`: it re-runs `env.sh audit --changed` (→ OK), flips PR #22
   ready, pushes, settles the full gate, and hands you the preview URLs to smoke.
3. After the smoke: tick **Ready to merge**, then `release comptes-neon-auth`.

## Blockers

1. **`.env.example`**: this session's settings deny `.env*` writes. Append and commit on
   `claude/nifty-turing-dlhore`:

   ```
   # Neon Auth (accounts, D-13). The auth URL of the Neon branch this environment's
   # database lives on (the Vercel-Neon integration injects it on Vercel).
   NEON_AUTH_BASE_URL=
   # Signs the session cache cookie, 32+ characters: openssl rand -base64 32
   NEON_AUTH_COOKIE_SECRET=

   # Transactional e-mail (Resend). The sender is the operator's (D-28): a domain verified
   # on Resend with SPF and DKIM at Infomaniak.
   RESEND_API_KEY=
   EMAIL_FROM=
   ```

2. **Vercel env (project `berceo`, Preview and Production)**: `NEON_AUTH_COOKIE_SECRET`
   (mandatory: without it every account page throws), `RESEND_API_KEY`, `EMAIL_FROM`.
   `NEON_AUTH_BASE_URL` is already injected per branch by the integration. Until a domain is
   verified on Resend, `EMAIL_FROM` can be a Resend test sender for the preview smoke only.
3. **Neon Console → Auth → Configuration, per branch** (the MCP cannot set these; exporting
   `NEON_API_KEY` in the session would let the next Build do it by API):
   - `preview/uat`: e-mail verification required, verify on sign-up, method **link**,
     auto sign-in after verification on; Webhooks enabled, URL
     `https://uat.berceo.be/api/webhooks/neon-auth`, event `send.magic_link`, timeout 5 s.
   - `main`: the same e-mail settings, **no webhook yet**. PR previews copy `main`'s config when
     they are created, and `www.berceo.be` has no webhook route until the first promotion; its
     webhook (`https://www.berceo.be/api/webhooks/neon-auth`) is set at promotion.
   - `preview/claude/nifty-turing-dlhore` (this PR's preview): the same e-mail settings, so the
     smoke exercises verification (Neon's own e-mail and link on a preview; ours on uat).
4. **Resend domain** (D-28, spec Out of scope): before the founders test on uat.

Done by Build: Google sign-in removed on `main`, `preview/uat` and this PR's preview;
`https://www.berceo.be` added to `main`'s trusted domains (the integration manages the
previews' and uat's).

## Do not

- Do not tick either gate checkbox.
- Do not write data to Neon `main` (production).
- Do not set `main`'s webhook before `www.berceo.be` serves `/api/webhooks/neon-auth`.
- Do not add a Vercel protection bypass to make webhooks reach PR previews.
- Do not commit an e-mail address, the Resend key or the cookie secret.
