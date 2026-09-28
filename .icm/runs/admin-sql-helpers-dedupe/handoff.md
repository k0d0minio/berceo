# Handoff: admin-sql-helpers-dedupe

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md`, tick **Spec approved** in the body of
   https://github.com/k0d0minio/berceo/pull/55, then run `/pipeline build admin-sql-helpers-dedupe`.
2. Build: execute `plan.md` pass by pass, on branch `claude/practical-ritchie-q4k9hh`.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/55.

## Do not

- Do not touch the suspension predicates (`suspension-one-predicate` owns them, next in the epic).
- Do not convert the CTE acts to `db.batch` (D-152) or add a migration.
- Do not tick either gate on the PR.
