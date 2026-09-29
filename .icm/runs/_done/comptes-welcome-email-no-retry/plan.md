# Plan: comptes-welcome-email-no-retry

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The scheduling helper** — `src/lib/auth/welcome.ts`: beside `sendWelcomeIfDue` (unchanged),
   a small exported function that, for a parent whose `welcomeSentAt` is null, reads the origin
   first and then hands `sendWelcomeIfDue(user, origin)` to `after()` from `next/server`; it does
   nothing for a professional or an already-welcomed family. The origin is a parameter or read
   through `siteOrigin()` (`src/lib/site-origin.ts`) before `after()` — never inside the callback,
   where `headers()` is not available. A new `welcome.test.ts` mocks `next/server`'s `after`,
   `@/db` and `@/lib/email/send` — done when: the four cases of the retry criterion pass
   (parent + null → scheduled, set → not, professional → not, origin read before the callback).
2. **The confirmer** — `src/app/(auth)/verification-email/confirmer/route.ts`: wrap
   `userByAuthId` in try/catch → on throw, one `console.error("[comptes] …", { authUserId })`
   and a redirect to `/connexion?verifie=1` that still gets the forwarded cookies (the existing
   loop at the end); on a row, schedule the welcome through the pass-1 helper with
   `request.nextUrl.origin` instead of awaiting `sendWelcomeIfDue`; update the header comment.
   `route.test.ts`: mock `next/server`'s `after` (keep `NextResponse`/`NextRequest` real via
   `importActual`), assert the welcome is scheduled not awaited, and add the throwing-SELECT case
   (redirect, `Set-Cookie` present, one log line) — done when: the existing D-129 cases and the
   new ones pass.
3. **The family's home** — `src/app/(portail)/espace/famille/page.tsx`: after `requireAccess`,
   call the pass-1 helper with the user (origin from `siteOrigin()`); nothing rendered changes;
   one line in the page's header comment — done when: the page calls the helper once and the
   preview builds.

## Risks

- `after()` from a Server Component page: allowed in Next's App Router, but `headers()` /
  `cookies()` inside the callback throw — the origin must be read before scheduling (pass 1's
  test is the signal; a runtime error in the preview logs is the other).
- `currentUser()` is `cache`d per request: the `user` the home holds is the row read at the
  start of the request, so a welcome claimed moments earlier by the confirmer's `after()` may
  still read null here — harmless, the conditional UPDATE lets only one send.
- Mocking `next/server` in the confirmer test must not replace `NextResponse` / `NextRequest`,
  which the route and test use — partial mock via `importActual`.
