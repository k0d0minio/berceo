# Spec: Auth code cleanups — one users-by-auth-id lookup, the reset redirectTo, the guard's way back

- slug: comptes-auth-cleanups
- personas: parent, professionnel
- touches: src/lib/auth/current-user.ts, src/lib/auth/guard.ts, src/lib/auth/routing.ts, src/app/(auth)/actions.ts, src/app/(auth)/verification-email/confirmer/route.ts, src/app/(portail)/espace/**/page.tsx
- complexity: trivial

## Problem

The accounts seam that joins a Neon Auth identity to its `users` row is written three times —
`currentUser()` (`src/lib/auth/current-user.ts`), `signIn` (`src/app/(auth)/actions.ts`) and the
verification confirmer route — each with its own copy of the SELECT and of the "no users row"
log. The two bugs queued behind this chore in the comptes-auth-recuperation epic (the orphaned
sign-up identity, the welcome e-mail with no retry) both change that lookup, so it must exist
once before they land. Two smaller defects sit on the same seam: `requestPasswordReset` builds
`redirectTo` from the request's `Origin` header — a bare path when the header is absent, and
ignored anyway because the Neon Auth webhook builds the reset link from `siteUrl` — and
`requireAccess` (`src/lib/auth/guard.ts`) sends an unverified or just-expired session to sign-in
with only the bare pathname as `retour`, losing the query a family was on (the proxy, for a
signed-out visitor, already keeps path and query). This advances the accounts work (comptes) the
whole platform stands on.

## Proposed change

A chore — no persona sees a new behaviour except the way back keeping its query.

1. **One lookup.** A single server-only helper `userByAuthId(authUserId)` in `src/lib/auth/`
   returns the `users` row for a Neon Auth id, or `null`. The three call sites use it and keep
   their own outcome (the `no-row` status, the `compteIndisponible` message, the
   `?erreur=compte` redirect). The "no users row" log keeps its `[comptes]` prefix and the
   `authUserId` field; each call site's log line stays distinguishable (the context string may
   move into the helper as a parameter or stay at the call site — Build's choice, one shape for
   all three).
2. **The reset request.** `requestPasswordReset` stops reading the `Origin` header (the
   `headers()` import goes if nothing else uses it) and passes `redirectTo` as
   `${siteUrl}/nouveau-mot-de-passe`, with `siteUrl` from `src/app/site.ts`. A
   one-line comment says the webhook builds the link itself and this value is only what Neon Auth
   is given.
3. **The guard's way back.** `requireAccess(path)` accepts a path that may carry a query (the
   payment return route already passes one): it runs its role and 404 checks on the pathname with
   the query stripped, and hands the full path and query to `signInWithReturn`, which
   `safeReturnPath` already validates. A small helper in `src/lib/auth/routing.ts` builds
   `path + "?" + query` from a page's resolved `searchParams` (dropping `undefined`, repeating
   array values, returning the bare path when the query is empty). Every page under
   `src/app/(portail)/espace/` that reads `searchParams` passes its path through that helper to
   `requireAccess`. `/admin` pages are left as they are: a visitor without an admin session gets
   a 404 before any redirect.

## Acceptance criteria

- [ ] `grep -rn "eq(users.authUserId" src` finds exactly one match, inside the new helper; `currentUser()`, `signIn` and the confirmer route all call `userByAuthId()`.
- [ ] `currentUser()` still returns `signed-out`, `unverified`, `no-row`, `suspended` and `ok` exactly as before; `signIn` still returns `compteIndisponible` for an identity with no row and `suspendu` (after signing out) for a suspended one; the confirmer route still redirects to `/connexion?erreur=compte` when the verified identity has no row and still forwards Neon's session cookies.
- [ ] Each of the three "no users row" cases still logs one `console.error` line with the `[comptes]` prefix and the `authUserId`.
- [ ] `requestPasswordReset` no longer reads the `Origin` header; it passes `${siteUrl}/nouveau-mot-de-passe` as `redirectTo`, and still answers `{ sent: true }` whether or not Neon Auth errors.
- [ ] A unit test covers the query helper: bare path when the query is empty, `undefined` dropped, array values repeated, values URL-encoded.
- [ ] A unit test (or an extended `routing.test.ts` case) shows `signInWithReturn` given `/espace/famille/recherche?commune=ixelles` yields `/connexion?retour=%2Fespace%2Ffamille%2Frecherche%3Fcommune%3Dixelles`, and the guard's role check reads the pathname without the query.
- [ ] Every `src/app/(portail)/espace/**/page.tsx` that reads `searchParams` passes path and query to `requireAccess`; no `/admin` page changes.
- [ ] On the UAT preview: a signed-in family opening `/espace/famille/recherche?commune=<x>` (and any other space page with a query) still gets the page, not a redirect, since the role check ignores the query; requesting a password reset still delivers the reset e-mail, whose link opens `/nouveau-mot-de-passe`.
- [ ] The existing auth tests (`src/lib/auth/*.test.ts`) pass unchanged.

## Out of scope

- Recovering a sign-up whose `users` row was never written — `comptes-orphaned-auth-identity`, next in this epic, built on `userByAuthId()`.
- Guarding the confirmer's `users` SELECT and retrying the welcome e-mail — `comptes-welcome-email-no-retry`.
- The proxy (`src/proxy.ts`): it already keeps path and query for a signed-out visitor.
- `/admin` pages: they 404 before the sign-in redirect is reached.
- Any change to the webhook, the e-mail templates, or `siteUrl` per environment.

## Open questions

- none — the two choices the stub left open were settled with the operator on 2026-09-26: `redirectTo` uses `siteUrl` (not dropped), and the query reaches the guard through its callers (not a proxy header).
