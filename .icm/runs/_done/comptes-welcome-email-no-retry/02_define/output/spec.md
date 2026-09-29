# Spec: A failed welcome e-mail is sent again from the family's home

- slug: comptes-welcome-email-no-retry
- personas: parent
- touches: src/lib/auth/welcome.ts, src/app/(auth)/verification-email/confirmer/route.ts, src/app/(auth)/verification-email/confirmer/route.test.ts, src/app/(portail)/espace/famille/page.tsx
- complexity: trivial

## Problem

A family's welcome e-mail is sent once, from the verification confirmer's first click
(`src/app/(auth)/verification-email/confirmer/route.ts` → `sendWelcomeIfDue` in
`src/lib/auth/welcome.ts`). When Resend fails, `sendWelcomeIfDue` releases its claim
(`welcome_sent_at` back to null) so the send can be retried, but nothing ever calls it again:
later clicks on the link carry no new session and sign-ins do not ask, so that family never gets
the welcome. The same route reads the `users` row (`userByAuthId`) after Neon Auth has already
consumed the token; that read is unguarded, so a database error 500s the route and drops the
session cookies Neon just issued, leaving a verified family signed out on an error page. The first
click also waits on Resend before it redirects. This belongs to the accounts work (comptes) every
space stands on, and was found in the comptes-neon-auth release review (2026-09-24).

## Proposed change

1. **A retry point on the family's home (D-165).** `/espace/famille` — where the confirmer
   lands a family and where sign-in takes her — asks for the welcome after the response whenever
   the signed-in family's `welcome_sent_at` is null. It reuses `sendWelcomeIfDue` unchanged in
   what it decides: parents only, one conditional-UPDATE claim so concurrent requests send once,
   the claim released on a failed send and logged. So a failed welcome is tried again on each
   later visit to the home until one send succeeds. The page never waits on it and never shows
   anything about it. The link in the e-mail points at the deployment that served the page
   (`siteOrigin()`, read before the deferred work, not inside it).
2. **The confirmer sends after the redirect (D-166).** The first click schedules the welcome
   with `after()` and redirects at once, like every other notification in the repo; the
   redirect, the way back (D-129) and the forwarded session cookies are unchanged.
3. **The confirmer's `users` read is guarded.** If `userByAuthId` throws, the route logs one
   `[comptes]` line with the `authUserId` (no error body), forwards Neon's session cookies and
   redirects to `/connexion?verifie=1`. The sign-in page sends a signed-in visitor on to her space
   once the database answers again (`redirectIfSignedIn`), and the family's welcome goes out from
   the home per point 1. The return cookie is left in place (not cleared) on this path.

## Acceptance criteria

- [ ] A family's first click on the verification link redirects without awaiting the welcome: the confirmer schedules `sendWelcomeIfDue` through `after()` and no longer awaits it in the request.
- [ ] When the confirmer's `users` read throws, the response is a redirect to `/connexion?verifie=1` that still carries every `Set-Cookie` Neon answered with, and one `console.error` line with the `[comptes]` prefix and the `authUserId` is logged; no 500.
- [ ] The existing confirmer behaviours are unchanged and still tested: the way back to a full profile (D-129) and its cookie cleared, a professional to her space, a missing row to `/connexion?erreur=compte`, an invalid or reused token to `/connexion?lien=invalide` / `?verifie=1`.
- [ ] A signed-in family opening `/espace/famille` with `welcome_sent_at` null has the welcome attempted after the response; with `welcome_sent_at` set, nothing is scheduled. The page renders the same either way.
- [ ] A professional opening her space never triggers a welcome attempt (the role rule in `sendWelcomeIfDue` holds on the new path).
- [ ] A unit test covers the new retry path: scheduled for a parent with no `welcome_sent_at`, not scheduled when it is set, not scheduled for a professional, the origin read before the deferred work.
- [ ] Two concurrent attempts for one family still send at most one e-mail (the conditional UPDATE claim is unchanged), and a failed send still releases the claim.
- [ ] On the UAT preview: signing up as a family and clicking the verification link lands in the space signed in and the welcome e-mail arrives, with its link pointing at the UAT address.

## Out of scope

- Dropping the claim release (the stub's alternative): rejected at Define, the retry keeps it (D-165).
- A retry on every family page through `requireAccess`, or on sign-in: rejected at Define, the home is the one touchpoint (D-165).
- A cap on retries or a cut-off date after which the welcome is no longer sent.
- Recovering a sign-up whose `users` row was never written: `comptes-orphaned-auth-identity`, the other stub in this epic.
- Any change to the welcome e-mail's text or template, to Resend's idempotency key, or to the schema.

## Open questions

- none: the retry point and the `after()` move were settled with the operator on 2026-09-29 (D-165, D-166).

Context budget: the cahier des charges the knowledge map names for Define lives in icm-board, not in this checkout; the persona (parent) comes from the stub and `src/lib/auth/welcome.ts`.
