# Tasks: comptes-auth-cleanups

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `grep -rn "eq(users.authUserId" src` finds exactly one match, inside the new helper; `currentUser()`, `signIn` and the confirmer route all call `userByAuthId()`.
- [ ] `currentUser()` still returns `signed-out`, `unverified`, `no-row`, `suspended` and `ok` exactly as before; `signIn` still returns `compteIndisponible` for an identity with no row and `suspendu` (after signing out) for a suspended one; the confirmer route still redirects to `/connexion?erreur=compte` when the verified identity has no row and still forwards Neon's session cookies.
- [ ] Each of the three "no users row" cases still logs one `console.error` line with the `[comptes]` prefix and the `authUserId`.
- [ ] `requestPasswordReset` no longer reads the `Origin` header; it passes `${siteUrl}/nouveau-mot-de-passe` as `redirectTo`, and still answers `{ sent: true }` whether or not Neon Auth errors.
- [ ] A unit test covers the query helper: bare path when the query is empty, `undefined` dropped, array values repeated, values URL-encoded.
- [ ] A unit test (or an extended `routing.test.ts` case) shows `signInWithReturn` given `/espace/famille/recherche?commune=ixelles` yields `/connexion?retour=%2Fespace%2Ffamille%2Frecherche%3Fcommune%3Dixelles`, and the guard's role check reads the pathname without the query.
- [ ] Every `src/app/(portail)/espace/**/page.tsx` that reads `searchParams` passes path and query to `requireAccess`; no `/admin` page changes.
- [ ] On the UAT preview: a signed-in family opening `/espace/famille/recherche?commune=<x>` (and any other space page with a query) still gets the page, not a redirect, since the role check ignores the query; requesting a password reset still delivers the reset e-mail, whose link opens `/nouveau-mot-de-passe`.
- [ ] The existing auth tests (`src/lib/auth/*.test.ts`) pass unchanged.

## Queue

- [ ] <task — small enough for one commit; name the file or area>
