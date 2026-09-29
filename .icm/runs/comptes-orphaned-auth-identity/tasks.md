# Tasks: comptes-orphaned-auth-identity

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] When the `users` + consents batch fails, `signUp` deletes the identity it just created (by id, guarded by the absence of a `users` row) and returns « generique » with the typed values; a unit test shows the delete is called with that id.
- [ ] When that delete also throws, one `console.error` line with the `[comptes]` prefix and the `authUserId` is logged and the form still returns « generique »; a unit test covers it.
- [ ] When Neon Auth answers `existe` for an address whose identity has no `users` row, the orphan is deleted, the sign-up runs once more with the submitted form, the `users` row and its two consent rows are written for the new identity, and the visitor lands on `/verification-email`; a unit test covers it.
- [ ] When Neon Auth answers `existe` for an address that has a `users` row, nothing is deleted and the visitor lands on `/verification-email` exactly as today; a unit test covers it.
- [ ] When the second sign-up after replacing an orphan fails, the form returns « generique » (or the password field error Neon gave) and no third attempt is made; a unit test covers it.
- [ ] Every delete of a `neon_auth` identity added by this run carries, in the same statement, the condition that no `users` row has its id; the identity lookup by e-mail and the delete live in one module under `src/lib/auth/`.
- [ ] `signIn` with a right password and no `users` row signs the new session out and returns `inscriptionIncomplete`; a unit test covers it. `/connexion` shows the same line for a `no-row` session and for `?erreur=compte`.
- [ ] `inscriptionIncomplete` exists in `src/content/comptes.ts` with `@relecture`, and `src/content/vitrine.test.ts` passes; `compteIndisponible` is gone if nothing reads it.
- [ ] The existing auth tests (`src/lib/auth/*.test.ts`) pass unchanged.
- [ ] On the UAT preview: create an account, delete its `users` and `user_consents` rows on the preview's Neon branch, then (a) sign in with it → the new line, no space opens; (b) sign up again with the same address and a new password → `/verification-email`, a fresh verification e-mail whose link opens the right space, and the old password no longer signs in.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
