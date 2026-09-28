# Plan: comptes-auth-cleanups

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The lookup** — a server-only `userByAuthId()` in `src/lib/auth/` (its own file or beside
   `current-user.ts`); `currentUser()`, `signIn` (`src/app/(auth)/actions.ts`) and the confirmer
   route (`src/app/(auth)/verification-email/confirmer/route.ts`) call it; the `eq` / `users`
   imports they no longer need go — done when: `grep -rn "eq(users.authUserId" src` shows one
   match and the three "no users row" logs still carry `[comptes]` and `authUserId`.
2. **The reset request** — `requestPasswordReset` in `actions.ts`: drop the `headers()` read
   (and the import if unused — `cookies` stays, `signUp` uses it), pass
   `${siteUrl}/nouveau-mot-de-passe` from `src/app/site.ts`, one comment on why — done when: no
   `get("origin")` left in `src/app/(auth)/`.
3. **The query helper and the guard** — in `src/lib/auth/routing.ts` a pure helper building
   `path` + query from resolved `searchParams` (undefined dropped, arrays repeated, encoded via
   `URLSearchParams`, bare path when empty), with tests in `routing.test.ts`, plus the
   `signInWithReturn` case with a query; `requireAccess` in `guard.ts` strips the query before
   `accessFor` (both calls) and passes the full path to `signInWithReturn` — done when: the new
   tests pass and `accessFor` never sees a `?`.
4. **The callers** — every `src/app/(portail)/espace/**/page.tsx` that reads `searchParams`
   (about 13: famille demandes/[id], demandes/nouvelle, reservations/[id], reservations/[id]/avis,
   profil, recherche, professionnelles/[id], professionnelles/[id]/priorite; professionnelle
   page, demandes, gardes/[id], gardes/[id]/avis) passes `withQuery(path, params)` — or the
   helper's final name — to `requireAccess`, reading `searchParams` before the guard where it
   now reads it after; the two payment route handlers keep what they do; no `/admin` page
   changes — done when: `grep` over those pages shows each guarded call carries the query.

## Risks

- A page that awaits `searchParams` only after `requireAccess` now awaits it first — harmless,
  but keep the order change mechanical; a render regression shows as a red preview build.
- `accessFor` given a path with `?` would misroute a signed-in user (the payment return route
  already passes one, so today's behaviour must be kept exactly) — the stripping test is the
  signal.
- Neon Auth may validate `redirectTo` against its trusted domains: on UAT, `siteUrl`
  (production) may be refused and logged as `[comptes] reset request failed` — the UAT smoke of
  the reset e-mail is the signal; if it fails, `revise` the spec rather than work around it.
