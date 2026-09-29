# Project: comptes-orphaned-auth-identity

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/comptes-auth-recuperation/comptes-orphaned-auth-identity.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/app/(auth)/actions.ts, src/lib/auth/users.ts, src/lib/auth/, src/app/(auth)/connexion/page.tsx, src/content/comptes.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- The form never says whether an address exists (D-34): an orphan replaced and a real account
  both end on `/verification-email`.
- No row is ever rebuilt from partial facts; an orphan is removed, never completed (D-160, D-171).
- A `neon_auth` identity is deleted only when no `users` row carries its id, in the same statement.
- The confirmer route is `comptes-welcome-email-no-retry`'s; this run does not touch it.
- Every new word follows Surya's guide (D-19) and carries `@relecture`.

## Context budget

- Define read `src/app/(auth)/actions.ts`, `src/lib/auth/{users,current-user,server,webhook,consent,errors}.ts`,
  the confirmer route, `/connexion`, `src/lib/admin/accounts.ts` (the existing `neon_auth` delete) and the
  `users` schema, to know what an orphan still carries and whether `neon_auth` is writable from the app.
