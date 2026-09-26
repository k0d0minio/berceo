# Project: comptes-auth-cleanups

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/comptes-auth-recuperation/comptes-auth-cleanups.md
- scope: none — cut from the comptes-neon-auth release review (2026-09-24); epic breakdown in intake/comptes-auth-recuperation/breakdown.md
- spec: 02_define/output/spec.md
- touches: src/lib/auth/current-user.ts, src/lib/auth/guard.ts, src/lib/auth/routing.ts, src/app/(auth)/actions.ts, src/app/(auth)/verification-email/confirmer/route.ts, src/app/(portail)/espace/**/page.tsx
- complexity: trivial → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No behaviour change for any persona beyond `retour` keeping a space page's query (spec →
  Proposed change).
- The orphaned-identity recovery and the welcome-e-mail retry are the next two stubs of this
  epic — do not start either here (spec → Out of scope).
- `/admin` pages and `src/proxy.ts` are untouched.
- Words and messages come from the catalogue (`src/content/comptes.ts`); none change here.

## Context budget

- Define read the three lookup sites, `guard.ts`, `routing.ts`, `proxy.ts`, `webhook.ts` and the
  list of `requireAccess` callers to settle the two open choices and name the touches; the
  cahier des charges was not needed (no persona-facing behaviour).
