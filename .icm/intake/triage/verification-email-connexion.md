# Stub: The confirmation link signs the user in and sends a family to her Checkout

- lane: bug
- found-by: the UAT review of 2026-10-29, three sign-ups on uat.berceo.be · 2026-10-29
- complexity: medium
- priority: P1

## Problem

The link in « Confirmez votre adresse e-mail » lands on `/connexion?verifie=1` for a family, a
professional and a founder. The route `src/app/(auth)/verification-email/confirmer/route.ts`
expects a `user.id` and a `session_token` cookie in Neon Auth's answer to `verify-email`, and
sends the user to sign-in when either is missing. Neon Auth's config on the UAT branch has
`auto_sign_in_after_verification: true`. A family who picked a plan never reaches
`/espace/famille/abonnement/commencer` from the link. Her welcome e-mail leaves only on her
first visit of her home (D-165). She can still sign in and finish her subscription from her
home, so nothing is lost, but the path the stub `abonnements-inscription-famille` promised is
not the one she walks.

## Proposed change

Investigate what Neon Auth's `GET /verify-email` answers on UAT through the `/api/auth` proxy:
the status, the body and the cookies. Make the route read that answer, so the first click signs
the user in, sends a family with a plan to her Checkout and schedules her welcome e-mail. Keep
the second click and the expired link on sign-in.

## Acceptance criteria

- [ ] The first click of the link signs the user in and opens her space.
- [ ] A family who picked a plan at sign-up lands on the Stripe Checkout of that plan.
- [ ] The welcome e-mail leaves after the first click, once.
- [ ] A second click, and an expired or forged token, land on sign-in with their message.

## Notes

- `route.test.ts` passes with a mocked answer. The fault sits between the route and Neon Auth's
  real answer, so the investigation reads the UAT runtime logs or logs the upstream answer once.
- Files: `src/app/(auth)/verification-email/confirmer/route.ts`, `src/lib/auth/retour.ts`.
