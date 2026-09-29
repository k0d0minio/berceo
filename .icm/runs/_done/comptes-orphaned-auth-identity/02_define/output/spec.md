# Spec: A sign-up whose users row fails to write no longer locks the address out

- slug: comptes-orphaned-auth-identity
- personas: parent, professionnel
- touches: src/app/(auth)/actions.ts, src/lib/auth/users.ts, src/lib/auth/, src/app/(auth)/connexion/page.tsx, src/content/comptes.ts
- complexity: standard

## Problem

A sign-up is two writes in two systems: Neon Auth creates the identity, then `signUp`
(`src/app/(auth)/actions.ts`) writes the `users` row and its two consent rows in one Drizzle
batch. When that batch fails, the identity stays with no row behind it. A retry of the form gets
`USER_ALREADY_EXISTS` and is redirected to `/verification-email` without writing anything; once
the address is verified, every sign-in answers « compteIndisponible » and the verification link
lands on `/connexion?erreur=compte`. Nothing backfills or cleans up, so the address is locked out
for good, for a family or a professional, on the accounts seam every space stands on (comptes).
The epic's cleanup (`comptes-auth-cleanups`, merged in #52) made `userByAuthId()` the one lookup
this recovery builds on.

## Proposed change

An identity with no `users` row (an *orphan*) opens nothing, holds nothing and cannot be finished
in place: its role and phone were never stored anywhere but the failed batch. So the recovery
removes it and lets the person sign up again, never rebuilds a row from partial facts.

1. **The batch fails (D-159).** When the `users` + consents batch throws after Neon Auth created
   the identity, `signUp` deletes that identity at once, where Neon Auth keeps it
   (`neon_auth."user"` by id, the statement the account deletion in `src/lib/admin/accounts.ts`
   already uses, its sessions and accounts going with it), and answers « generique » with the
   typed values kept, as today. The verification e-mail Neon already sent then leads to « lien
   invalide ». If that delete fails too, it is logged with the `[comptes]` prefix and the
   `authUserId`, and the retry path below recovers the address.
2. **A retry finds an orphan (D-160).** When Neon Auth answers `existe`, `signUp` looks up the
   identity for that address in `neon_auth."user"` (e-mail compared lower-cased). If it has a
   `users` row (a real account), nothing changes: the redirect to `/verification-email` that reads
   exactly like a new sign-up (D-34). If it has none, the orphan is deleted and the sign-up runs
   once more with the form just submitted: new identity, new password, the row and consents from
   this form, a fresh verification e-mail, the way back cookie, the redirect to
   `/verification-email`. An identity younger than five minutes is never taken for an orphan: its
   own sign-up may still be writing its row, so the form answers `inscriptionEnCours` (retry in a
   few minutes) and deletes nothing (D-172, added at Release). A second failure of Neon
   Auth or of the batch follows the ordinary paths
   (point 1 included); there is no second retry. The outcome a visitor sees is the same whether
   the address was an orphan or a real account, so the form still says nothing about which
   addresses exist.
3. **Every delete is guarded.** The orphan delete (points 1 and 2) removes the identity only if
   no `users` row carries its id, in the same statement (`… and not exists (select 1 from users
   where auth_user_id = …)`), so a row written in between is never cut from its identity. It
   lives beside `userByAuthId()` in `src/lib/auth/users.ts` (or one module next to it): the only
   place the accounts code reads or deletes a `neon_auth` identity by e-mail.
4. **Sign-in or the verification link meets an orphan (D-171).** `signIn`, when the password is
   right but the identity has no row, ends the session it just opened (as it does for a suspended
   account) and answers a new catalogue line, `inscriptionIncomplete`, telling the person their
   sign-up did not go through and to create their account again with the same address. The
   `/connexion` notice for a `no-row` session and for `?erreur=compte` (the confirmer's redirect)
   shows the same line. The sign-in page's existing sign-up links are the way on; the retry path
   (point 2) then replaces the orphan. `compteIndisponible` leaves the catalogue if nothing else
   reads it. The line follows Surya's guide (vouvoiement, no `!`, `…` or `—`) and carries
   `@relecture`.
5. **Tests, one per path.** The sign-up and sign-in decisions are exercised without Neon, the
   database or Resend (the deps-injection shape `webhook.ts` already uses, or equivalent): batch
   fails → identity deleted; batch fails and the delete fails → logged, « generique »; `existe`
   with an orphan → orphan deleted, sign-up redone, row written, `/verification-email`; `existe`
   with a real account → nothing deleted, `/verification-email`; `existe` with an orphan whose
   second sign-up fails → « generique », no loop; sign-in with no row → session ended,
   `inscriptionIncomplete`.

## Acceptance criteria

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

## Out of scope

- Rebuilding a missing row at sign-in from data stored on the Neon identity (role and phone in its `name`): declined (D-171).
- A backfill or sweep of orphans already in a database: the retry path recovers each one the moment its owner tries again.
- The confirmer route (`src/app/(auth)/verification-email/confirmer/route.ts`): it keeps redirecting a verified orphan to `/connexion?erreur=compte`; guarding its `users` SELECT and the welcome e-mail retry are `comptes-welcome-email-no-retry`.
- The Neon Auth webhook and the e-mail templates.
- Making the two writes one transaction: Neon Auth's identity and the app's rows cannot share one.

## Open questions

- none — the three choices the stub left open were settled with the operator in Define on 2026-09-29: delete the identity when the batch fails (D-159), replace an orphan on a retry rather than writing a row onto it (D-160), and ask an orphan that signs in to sign up again rather than rebuilding its row (D-171). Ids renumbered at Build and again at Release: the provisional D-161 collided with sibling branches and is D-171.
