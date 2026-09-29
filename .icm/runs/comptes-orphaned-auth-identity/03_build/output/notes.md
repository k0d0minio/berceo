# Build notes: comptes-orphaned-auth-identity

- commits: a33f9c3 the recovery (users.ts, actions.ts, connexion notice, catalogue, tests); 0b44de3 the run files; 73f31ee merge of `main` (no overlap); 9e9552e ready
- ci: GREEN on 9e9552e — full gate (Vercel preview pass) and Quality (advisory) pass

## What changed

- `src/lib/auth/users.ts`: `identityByEmail(email)` (the `neon_auth."user"` row for an address, lower-cased, and whether a `users` row carries it) and `deleteOrphanIdentity(authUserId)` (one `DELETE … WHERE id = … AND NOT EXISTS (users row) RETURNING id`). The only reads and deletes of a `neon_auth` identity the accounts code makes; the admin deletion's own statement in `src/lib/admin/accounts.ts` is untouched.
- `src/app/(auth)/actions.ts` `signUp`: a failed batch deletes the identity just created (D-159), logging `[comptes] orphan identity not removed after a failed sign-up` with the `authUserId` if that delete throws. On `existe`, `replaceOrphan(email)`: an orphan is deleted and `signUp.email` runs once more (D-160); a real account (or no identity found, or a delete that found a row in between) redirects to `/verification-email` as before (D-34). The second attempt's failures take the ordinary paths, so a second `existe` is « generique », and a second batch failure deletes the new identity. A lookup or delete that throws on the retry path answers « generique ».
- `signIn`: no row → `getAuth().signOut()`, then `inscriptionIncomplete` (D-171). `FormMessage` swaps `compteIndisponible` for it.
- `src/app/(auth)/connexion/page.tsx`: the `no-row` / `?erreur=compte` notice reads the new line.
- `src/content/comptes.ts`: `compteIndisponible` (no reader left) replaced by `inscriptionIncomplete`, « Votre inscription n'a pas abouti. Créez à nouveau votre compte avec la même adresse e-mail. », `@relecture`.
- `src/app/(auth)/actions.test.ts`: new, one test per path, Neon Auth / the database / the orphan helpers mocked at their module boundary.

## Acceptance criteria status

- [x] Batch fails → identity deleted by id (guarded in SQL), « generique » with values — test "deletes the identity it just created".
- [x] Delete also throws → one `[comptes]` line with `authUserId`, « generique » — test "logs a [comptes] line".
- [x] `existe` + orphan → deleted, signed up again, row + two consents for the new id, `/verification-email` — test "replaces an orphan".
- [x] `existe` + real account → nothing deleted, `/verification-email` — test "leaves a real account alone".
- [x] Second sign-up fails → « generique » (or Neon's password field error), no third attempt — two tests.
- [x] Every added `neon_auth` delete carries the `not exists` guard in the same statement; lookup and delete live in `src/lib/auth/users.ts`.
- [x] `signIn` no row → signed out, `inscriptionIncomplete` — test; `/connexion` shows it for `no-row` and `?erreur=compte`.
- [x] `inscriptionIncomplete` in the catalogue with `@relecture`; `compteIndisponible` gone (no reader); `vitrine.test.ts` green in the advisory job on 9e9552e.
- [x] Existing auth tests unchanged — no file under `src/lib/auth/*.test.ts` was edited; green in the advisory job on 9e9552e.
- [ ] UAT smoke — the operator's, on the preview: create an account, delete its `users` and `user_consents` rows on the preview's Neon branch, then (a) sign in → the new line, no space; (b) sign up again with the same address and a new password → `/verification-email`, a fresh e-mail whose link opens the right space, the old password refused.

## Notes for Release

- The retry path deletes an orphan on an unauthenticated form submission. That is deliberate (D-160): an orphan opens nothing, and the outcome equals signing up a free address. Reviewers should check the delete can never hit an identity with a row (the `not exists` guard is in the DELETE itself).
- A lookup or delete that throws on the retry path answers « generique » rather than the neutral redirect; it reveals only that the database failed, not whether the address has an account.
- `neon_auth` column names and the cascade to `account` / `session` were confirmed on `uat-berceo` with a read-only `information_schema` query (2026-09-29).
- Decision ids renumbered: the provisional D-161 became D-165 at Build, then D-171 at Release (`comptes-welcome-email-no-retry` merged D-165 first); Release's own decision is D-172.
- Context budget: Build also read `vitest.config.mts`, the confirmer and admin action tests (the mocking pattern) and `src/components/auth/messages.ts` (how a `FormMessage` finds its words).

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on 4e4cd21 at the start (full gate); re-read after the last push before the merge
- reviews: code medium (/code-review: 1 finding, in-ticket — an in-flight sign-up taken for an orphan; fixed in b2c694f and this record's commit with a five-minute grace and `inscriptionEnCours` (D-172); the fix re-reviewed twice, clean the second time) · security security-check.sh --branch --audit: OK (npm audit clean) + /security-review — no findings (the delete's same-statement guard, parameterised SQL, no account a row carries reachable from the retry) · readiness env.sh audit --changed: OK · /production-readiness n/a — not shipped in this repo's skills
- parked: none
- migrations: skip — none of this run's own
- learned: skip — no error.log; 2 rules from FAILURE.md via close-out (in-flight vs orphaned records; renumbering ids after the merge of `main`)
- docs: README.md → Accounts and e-mail (a sign-up that fails half-way) · announce: deferred to promotion
- context budget: Release also read `src/lib/admin/accounts.ts` and the merged sibling's decisions to renumber
- note: the UAT smoke the operator ran for **Ready to merge** predates D-172; the grace only changes a retry within five minutes of an orphan's creation, so step (b) of the smoke (a retry after deleting the rows by hand) passes only once the account is five minutes old.

