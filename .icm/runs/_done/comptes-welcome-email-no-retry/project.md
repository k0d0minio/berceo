# Project: comptes-welcome-email-no-retry

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/comptes-auth-recuperation/comptes-welcome-email-no-retry.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/auth/welcome.ts, src/app/(auth)/verification-email/confirmer/route.ts, src/app/(auth)/verification-email/confirmer/route.test.ts, src/app/(portail)/espace/famille/page.tsx
- complexity: trivial → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- `sendWelcomeIfDue`'s decisions stay as they are: parents only, the conditional-UPDATE claim, the release on a failed send (D-165).
- The only new retry point is `/espace/famille` (D-165) — not `requireAccess`, not sign-in.
- The confirmer's redirects, the way back (D-129) and the forwarded session cookies are unchanged on every existing path.
- No schema change, no template change, no retry cap.

## Context budget

- Define read `welcome.ts`, the confirmer route and its test, `guard.ts`, `current-user.ts`, `users.ts`, `site-origin.ts` and the family home to fix `touches:`; the cahier des charges the knowledge map names lives in icm-board, not this checkout.
