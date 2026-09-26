# Build notes: comptes-auth-cleanups

- commits: 5e84f36 feat (lookup, reset, guard and pages, tests); run-pack commits around it; 606f704 ready
- ci: GREEN on 606f704 (full gate: Vercel preview pass; Quality (advisory) pass: ESLint, typecheck, vitest)

## What changed

- `src/lib/auth/users.ts` (new): `userByAuthId()`, the one `users`-by-`auth_user_id` read. It returns the row or null; each caller keeps its own outcome and its own `[comptes]` log line (Build's choice under the spec's point 1: the three messages were already distinct, so the context stays at the call site).
- `src/lib/auth/current-user.ts`, `src/app/(auth)/actions.ts` (`signIn`), `src/app/(auth)/verification-email/confirmer/route.ts`: call it; their `eq` / `db` / `users` imports go where unused.
- `src/app/(auth)/actions.ts` (`requestPasswordReset`): no `headers()` read; `redirectTo` is `${siteUrl}/nouveau-mot-de-passe` (D-149), with a comment that the webhook builds the link.
- `src/lib/auth/routing.ts`: `pathnameOf()` (the path without query or fragment, now also used by `safeReturnPath` and `landingFor`) and `withQuery()` (path + the page's `searchParams`: undefined dropped, arrays repeated, `URLSearchParams` encoding, bare path when empty).
- `src/lib/auth/guard.ts`: `requireAccess(path)` runs both `accessFor` checks on `pathnameOf(path)` and hands the full path to `signInWithReturn` (D-150).
- The 12 `src/app/(portail)/espace/**/page.tsx` that read `searchParams` await it before the guard and pass `withQuery(<path>, <params>)`: famille demandes/[id], demandes/nouvelle, reservations/[id], reservations/[id]/avis, profil, recherche, professionnelles/[id], professionnelles/[id]/priorite; professionnelle (root), demandes, gardes/[id], gardes/[id]/avis. No `/admin` page changed; the two payment route handlers are as they were.
- `src/lib/auth/routing.test.ts`: the helper's cases and the retour string from the spec, plus the role check on a query-carrying space root.

## Acceptance criteria status

Recorded here, not ticked on the PR (Learned rule: a session's ticks are refused as self-approval).

- [x] One `eq(users.authUserId` in `src`, inside `userByAuthId()`; the three callers use it.
- [x] `currentUser()`, `signIn` and the confirmer keep every outcome: same branches, only the SELECT moved.
- [x] The three "no users row" logs are unchanged (`[comptes]` + `authUserId`).
- [x] `requestPasswordReset` reads no `Origin`; `redirectTo` from `siteUrl`; still `{ sent: true }`.
- [x] Query helper unit test — `routing.test.ts`, green in the advisory job.
- [x] `signInWithReturn` with a query + role check on the pathname — `routing.test.ts`, green.
- [x] All 12 `/espace` pages with `searchParams` pass path + query; no `/admin` page touched.
- [ ] UAT smoke (family search with `?commune=`, reset e-mail) — the operator's, on the preview.
- [x] Existing auth tests unchanged and green in the advisory job.

## Notes for Release

- Without `pathnameOf()` in the guard, a query on a space's own root (`/espace/professionnelle?envoye=1`) would miss `within()` and bounce the owner home in a loop; the guard now strips before both `accessFor` calls. The payment return route already passed `?session_id=`, which only worked because its path sits below the space root.
- The way back now also carries one-shot notices (`?publiee=1`, `?erreur=…`) into `retour`; after sign-in the page shows that notice once more. Harmless, but the reviewer may prefer a notice-free retour on those pages; the spec asked for every page.
- D-149 uses `siteUrl` (production) on every environment; `src/lib/site-origin.ts` (`siteOrigin()`, the host the request reached) exists and would point UAT at UAT. The webhook ignores the value, so the spec's choice stands; if the UAT reset smoke shows `[comptes] reset request failed` (Neon refusing a `redirectTo` outside its trusted domains), that helper is the fix.
