# Project: reservations-regles-non-appelees

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/reservations-revue-candidature/reservations-regles-non-appelees.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/reservations/rules.ts, src/lib/reservations/rules.test.ts, src/lib/reservations/answers.ts, src/lib/reservations/bookings.ts, src/lib/reservations/*.test.ts, src/lib/demandes/requests.ts, src/lib/demandes/*.test.ts, src/app/(portail)/espace/professionnelle/demandes/page.tsx, README.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- No rule changes: every SQL statement decides exactly what it decides today; this run extracts
  and tests them (D-153).
- No Neon-branch or live-database test; statement tests only (`.toSQL()`, no DB).
- `answerRefusal`, `acceptRefusal`, `canRepublish`, `hasAddress`, `isPriorityFor` stay untouched.
- `answers.ts` is also the sibling stub `reservations-compte-reponses-une-demande`'s file: add
  builders, don't reshape `pendingCounts` or `waitingAnswerOf`.
- CI is the source of truth: never run build, lint, typecheck or dev locally.

## Context budget

- Define read the code the five helpers restate (rules.ts, requests.ts, answers.ts, bookings.ts,
  the professional's list page, the priority page) and `reopening.test.ts` for the statement-test
  style; the knowledge map was not loaded (a refactor that changes no rule).
