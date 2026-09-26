# Tasks: comptes-auth-cleanups

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] `grep -rn "eq(users.authUserId" src` finds exactly one match, inside the new helper; `currentUser()`, `signIn` and the confirmer route all call `userByAuthId()`.
- [x] `currentUser()` still returns `signed-out`, `unverified`, `no-row`, `suspended` and `ok` exactly as before; `signIn` still returns `compteIndisponible` for an identity with no row and `suspendu` (after signing out) for a suspended one; the confirmer route still redirects to `/connexion?erreur=compte` when the verified identity has no row and still forwards Neon's session cookies.
- [x] Each of the three "no users row" cases still logs one `console.error` line with the `[comptes]` prefix and the `authUserId`.
- [x] `requestPasswordReset` no longer reads the `Origin` header; it passes `${siteUrl}/nouveau-mot-de-passe` as `redirectTo`, and still answers `{ sent: true }` whether or not Neon Auth errors.
- [x] A unit test covers the query helper: bare path when the query is empty, `undefined` dropped, array values repeated, values URL-encoded.
- [x] A unit test (or an extended `routing.test.ts` case) shows `signInWithReturn` given `/espace/famille/recherche?commune=ixelles` yields `/connexion?retour=%2Fespace%2Ffamille%2Frecherche%3Fcommune%3Dixelles`, and the guard's role check reads the pathname without the query.
- [x] Every `src/app/(portail)/espace/**/page.tsx` that reads `searchParams` passes path and query to `requireAccess`; no `/admin` page changes.
- [ ] On the UAT preview: a signed-in family opening `/espace/famille/recherche?commune=<x>` (and any other space page with a query) still gets the page, not a redirect, since the role check ignores the query; requesting a password reset still delivers the reset e-mail, whose link opens `/nouveau-mot-de-passe`.
- [x] The existing auth tests (`src/lib/auth/*.test.ts`) pass unchanged.

## Queue

- [x] Renumber the provisional D-144/D-145 to D-149/D-150 (`decisions.md`, spec) — highest id on `main` and every remote branch was D-148.
- [x] `src/lib/auth/users.ts` `userByAuthId()`; `current-user.ts`, `(auth)/actions.ts` signIn and the confirmer route call it — 5e84f36.
- [x] `requestPasswordReset`: no `headers()` read, `redirectTo` from `siteUrl` — 5e84f36.
- [x] `routing.ts` `pathnameOf()` + `withQuery()`, tests in `routing.test.ts`; `guard.ts` strips the query for the role checks — 5e84f36.
- [x] The 12 `/espace` pages that read `searchParams` pass `withQuery(path, query)` — 5e84f36.
- [x] Tests green on the ready head (advisory quality job on 606f704), DoD 5, 6 and 9 ticked.
