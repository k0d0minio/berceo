# Plan: comptes-orphaned-auth-identity

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The orphan primitives** — beside `userByAuthId()` in `src/lib/auth/users.ts` (or one
   sibling module): `identityByEmail(email)` → `{ authUserId, hasRow }` or null, reading
   `neon_auth."user"` (lower-cased e-mail) left-joined to `users`; `deleteOrphanIdentity(authUserId)`
   → boolean, one `db.execute` of `delete from neon_auth."user" where id::text = $1 and not
   exists (select 1 from users where auth_user_id = $1)`, the same `id::text` shape
   `src/lib/admin/accounts.ts` uses — done when: the only `neon_auth` reads and deletes the
   accounts code adds are in that module, and each delete carries the `not exists` guard.
2. **The sign-up decision** — in `signUp` itself (rewritten at Build: no extraction; the
   action is tested through module-boundary mocks, the `src/app/(portail)/admin/actions.test.ts`
   pattern, which the spec allows as "equivalent"): batch failure → `deleteOrphanIdentity(id)`
   (log `[comptes]` + `authUserId` if that throws); `existe` → `replaceOrphan(email)`; orphan
   deleted → one more `signUp.email`, whose own failures take the ordinary paths; real account or
   no identity → `/verification-email` — done when: the sign-up cases of
   `src/app/(auth)/actions.test.ts` pass.
3. **Sign-in and the notice** — `signIn`: no row → `getAuth().signOut()` then
   `inscriptionIncomplete` (a `FormMessage` key); the sign-in decision tested the same way (or
   its no-row branch extracted); `/connexion` maps `no-row` and `?erreur=compte` to the new line;
   `src/content/comptes.ts` gains `inscriptionIncomplete` with `@relecture`, and loses
   `compteIndisponible` if `grep` shows no reader — done when: the sign-in test passes and
   `vitrine.test.ts` stays green.
4. **Proof on UAT** — the spec's last criterion, on the preview after the ready flip — done
   when: both halves (sign-in shows the line; a new sign-up on the same address verifies and
   opens the space; the old password is refused) are recorded in `notes.md`.

## Risks

- Closed at Build (2026-09-29, read-only `information_schema` query on `uat-berceo`):
  `neon_auth."user"` has `email`; `account_userId_fkey` and `session_userId_fkey` are
  `ON DELETE CASCADE`, so the password and sessions go with the identity.
- Neon Auth may keep its own cache of the address (rate limit, pending verification) so the
  second `signUp.email` right after the delete answers `existe` again; the no-loop rule turns
  that into « generique », and the UAT smoke is the signal.
- The two sign-ups in one request double the Neon Auth calls on a retry; acceptable, as the path
  is rare.
