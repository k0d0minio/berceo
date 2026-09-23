# Plan: comptes-neon-auth

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Migrations reach every environment**: `package.json` gets a `vercel-build` script
   (`npm run db:migrate && npm run db:verify && next build`). Done when a preview build log shows
   `0000_users` applied to its own Neon branch, and `preview/uat` has `public.users` after the
   first uat build. This lands first because nothing else can be smoked without a table.
2. **Schema and migration**: `src/db/schema.ts` (`auth_user_id`, `first_name`, `last_name`,
   `phone`, `welcome_sent_at`, drop `name`; the `user_consents` table plus its `consent_document`
   enum). Then `npm run db:generate -- --name comptes`, and commit `drizzle/`. Load
   `.icm/skills/database-migration/`. Done when the journal test passes, the SQL is one
   forward-only file, and `check-migrations.sh` gives no conflict.
3. **Neon Auth wiring**: add `@neondatabase/auth`. `src/lib/auth/server.ts` holds
   `createNeonAuth`, the `consentVersions` constant, and a `currentUser()` that joins the session
   to the `users` row. It returns role or "no row", and is the one place pages ask "who is this".
   Add `src/app/api/auth/[...path]/route.ts` and `src/proxy.ts`, matched to `/espace/**`,
   `/admin/**`, `/connexion` and `/inscription-*`, keeping the return path. Role checks run
   server-side in the `(portail)` layouts too, not in the proxy alone, and `/admin` calls
   `notFound()` for non-admins. Done when the unit tests on `currentUser` and the redirect table
   pass.
4. **Words**: `src/content/comptes.ts` and `src/content/emails.ts` hold the guide's lines
   verbatim, with `@relecture Surya` on everything written to its rules. The `portal.ts` additions
   are for the spaces. Done when `grep -rn @relecture src/content` lists every non-verbatim entry
   and no string in a page or template is inline.
5. **Auth pages**: the `(auth)` route group inside the public header and footer. It holds the two
   sign-up forms (one shared form component with a `role` prop), `/connexion`,
   `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` and `/verification-email`. Server actions
   validate (phone → E.164, password 8–128, confirmation, consent), call `auth.signUp.email`,
   then write the `users` row and the two `user_consents` rows in one `db.batch`. A duplicate
   address returns the neutral success message. Error codes from Neon Auth map to catalogue
   messages, never raw text. Done when each form's validation tests pass and the pages render
   with the DA's input and button.
6. **Spaces**: `/espace/famille`, `/espace/professionnelle` (with the pending line) and `/admin`,
   on the portal shell with the existing sign-out dialog wired to `auth.signOut()`. Done when a
   verified test account of each role lands in its own space on the preview.
7. **E-mail**: add `resend` in `src/lib/email/`, with one layout (logotype via an absolute URL,
   HTML plus text) and the three templates. `/api/webhooks/neon-auth` verifies the Ed25519
   detached JWS against `${NEON_AUTH_BASE_URL}/.well-known/jwks.json` (cached, refreshed on
   unknown `kid`), rejects stale or unsigned requests with 401, dedupes on `X-Neon-Event-Id`, and
   sends by `link_type` (`email-verification`, `forget-password`). The welcome e-mail is sent from
   the `/verification-email` landing when the family's e-mail is verified and `welcome_sent_at`
   is null, set atomically. Done when the webhook tests (signature valid, invalid, stale,
   duplicate) and the template snapshot tests pass.
8. **Admin script**: `scripts/grant-admin.ts` plus `npm run admin:grant`. It refuses an unknown
   address and prints the before and after role. Done when the script's test passes against a
   mocked `db`.
9. **Configuration outside the code** (Neon API or MCP, then Vercel): on `main` and
   `preview/uat`, turn on verification required, the link method, auto sign-in, Google off, the
   trusted domains, and the webhook (`send.magic_link` → each environment's
   `/api/webhooks/neon-auth`). Set the four env vars on Vercel (`env.sh add … --vercel`; the key
   and cookie secret are never echoed). `.env.example` names them. Done when `get_neon_auth_config`
   on both branches shows the settings and `env.sh audit --changed` reports no gap.
10. **Docs**: `README.md` (accounts, e-mail, `admin:grant`), the `AGENTS.md` data-model row, and
    `_shared/project-rules.md` (the migrate-at-build act is done; the env surfaces). Done when the
    three read true against the code.

## Risks

- **`NEON_AUTH_BASE_URL` per preview.** Each PR preview gets its own Neon branch, with its own
  auth endpoint. If Vercel's Neon integration does not inject the auth URL per branch, a preview
  would authenticate against another branch's users while writing `users` rows to its own. Signal:
  sign-up succeeds and the next sign-in finds "no row". Check the integration's injected variables
  first. If there is no per-branch value, previews point at `preview/uat`'s auth and database both,
  and the spec's preview smoke is limited accordingly (say so on the PR).
- **Webhook on protected previews.** Vercel SSO blocks Neon's POST, so e-mail flows are not
  testable on a PR preview (Out of scope in the spec). Do not add a protection bypass to make it
  work.
- **No sender yet.** `EMAIL_FROM` is the operator's (Out of scope). Without it, the blocking
  `send.magic_link` webhook fails and sign-up errors on uat. Before flipping ready, confirm with
  the operator that the variable is set, or state plainly on the PR that the e-mail acceptance
  criteria are proven by tests only until it is.
- **`neon-http` has no interactive transactions.** Use `db.batch` for the `users` and
  `user_consents` insert. The auth user is created before the batch, so a failed batch leaves an
  auth identity with no row. `currentUser()`'s "no row" path is the recovery signal (logged).
- **Next 16 `proxy.ts`.** The SDK's `auth.middleware()` is documented for `proxy.ts`. If it
  breaks on 16.3, protect in the layouts and keep the proxy to redirects only.
