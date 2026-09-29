# Build notes: comptes-welcome-email-no-retry

- commits: 5b1e43c fix (welcome scheduler, confirmer guard, home retry, tests) · merge of `origin/main` · ready push
- ci: draft GREEN on 5b1e43c (cheap tier); full verdict on the post-flip head — see `status.md`

## What changed

- `src/lib/auth/welcome.ts`: `scheduleWelcomeIfDue(user, siteUrl)` — for a parent whose `welcomeSentAt` is null, hands `sendWelcomeIfDue` to `after()`; nothing otherwise. `sendWelcomeIfDue` is unchanged (role rule, conditional-UPDATE claim, release on a failed send).
- `src/app/(auth)/verification-email/confirmer/route.ts`: the `users` read is in a try/catch — a throw logs `[comptes] users read failed after verification` with `authUserId` and the error's name only, and redirects to `/connexion?verifie=1` with Neon's `Set-Cookie`s forwarded (the return cookie is left in place). The welcome is scheduled with `request.nextUrl.origin`, no longer awaited.
- `src/app/(portail)/espace/famille/page.tsx`: after `requireAccess`, `scheduleWelcomeIfDue(user, await siteOrigin())` — the origin is read in the request, before the deferred work.
- `src/lib/auth/welcome.test.ts` (new): the scheduler's four cases and the claim's three (lost claim sends nothing, failed send releases, success keeps it).
- `src/app/(auth)/verification-email/confirmer/route.test.ts`: the welcome now mocked as `scheduleWelcomeIfDue`; added the missing-row, invalid-token, second-click and no-token landings, the scheduling assertions, and the failed-read case (307 to `?verifie=1`, session cookie present, one `[comptes]` log line).

## Acceptance criteria status

- [x] First click redirects without awaiting the welcome — the route calls `scheduleWelcomeIfDue` (synchronous, `after()` inside); `route.test.ts` asserts it is called with the row and the origin.
- [x] Failed `users` read → `/connexion?verifie=1` with every `Set-Cookie`, one `[comptes]` line with `authUserId`, no 500 — `route.test.ts` "a failed users read…".
- [x] Existing confirmer behaviours unchanged and tested — the D-129 cases kept; `erreur=compte`, `lien=invalide` (bad token, no token) and `verifie=1` (no new session) added.
- [x] `/espace/famille` with `welcome_sent_at` null schedules the welcome after the response; set → nothing — the page calls the scheduler, whose rule `welcome.test.ts` covers; nothing rendered changed.
- [x] A professional never triggers an attempt — the scheduler's role check (tested), and the call sits only on the family home.
- [x] Unit test of the retry path — `welcome.test.ts` → `scheduleWelcomeIfDue`.
- [x] Concurrent attempts send at most once, a failed send releases the claim — `sendWelcomeIfDue` unchanged; `welcome.test.ts` → "sendWelcomeIfDue's claim".
- [ ] UAT preview: sign up as a family, click the verification link, land signed in, the welcome arrives with a UAT link — the operator's smoke.

## Notes for Release

- The tests were written, not run in the session (blocked locally by design); the advisory quality job on the ready head is their first run.
- `welcome.test.ts` mocks `next/server` wholesale (`welcome.ts` imports only `after` from it); the route test mocks `@/lib/auth/welcome` instead, so it needs no `next/server` mock.
- The home calls `siteOrigin()` (a `headers()` read) on every visit, due or not: free on a `force-dynamic` page, and it keeps `headers()` out of the `after()` callback.
- README → Accounts and e-mail still says the confirmer "sends a family's welcome e-mail"; Release may want to add the home's retry there.
