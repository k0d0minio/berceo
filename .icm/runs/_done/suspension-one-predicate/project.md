# Project: suspension-one-predicate

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/back-office-admin-dedup/suspension-one-predicate.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/auth/suspension.ts, src/lib/admin/review.ts, src/lib/reservations/answers.ts, src/lib/reservations/profiles.ts, src/lib/reservations/notices.ts, src/lib/reservations/bookings.ts, src/lib/demandes/requests.ts, src/lib/avis/ratings.ts, src/lib/messagerie/conversations.ts, src/lib/auth/suspension-isolation.test.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No behaviour change: every reader keeps its result set; `notSuspended` emits exactly the SQL it
  emits today (`suspension.test.ts` and `recherche/professionals.test.ts` match the string).
- One enforcement point, the helper in `src/lib/auth/suspension.ts`; no view, no migration (D-169).
- The account's own state stays as read today: `admin/accounts.ts` (the column's only writer),
  `admin/lists.ts`, `admin/rules.ts`, `auth/current-user.ts`, the sign-in action, `db/schema.ts`
  (D-170).

## Context budget

- Define read each suspension site in `ratings.ts`, `answers.ts`, `review.ts`, `profiles.ts`,
  `notices.ts`, `requests.ts`, `bookings.ts`, `conversations.ts`, `accounts.ts`, `current-user.ts`
  and the sign-in action, beyond targeted greps — needed to sort readers from the writer and the
  account's own state, which decides the source test's allowlist.
