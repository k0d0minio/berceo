# Project: gardes-refund-failure-unflagged

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/gardes-annulation-suivi/gardes-refund-failure-unflagged.md
- scope: none
- spec: 02_define/output/spec.md
- touches: src/lib/paiements/payments.ts, src/lib/paiements/rules.ts, src/lib/paiements/rules.test.ts, src/components/admin/payments-table.tsx, src/components/admin/refund-button.tsx, src/app/(portail)/admin/paiements/page.tsx, src/app/(portail)/admin/page.tsx, src/content/admin.ts
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- `src/lib/paiements/payments.ts` stays the only reader of `payments`; the « à rembourser »
  predicate lives there once and every reader uses it (D-162, D-133).
- No schema change, no migration, no automatic retry, no change to the refund's reason (D-163).
- Every new word in `src/content/admin.ts` with `@relecture`; red and green only in the
  confirmation dialog (D-24); no insurance wording (D-8).

## Context budget

- Define read the admin payments page, table, refund button and action, `payments.ts`' refund and list reads, and the overview page to fix exact behaviour; no wider codebase read.
