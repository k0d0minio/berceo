# Handoff: admin-sql-helpers-dedupe

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview of https://github.com/k0d0minio/berceo/pull/55 — the two UAT
   criteria in `02_define/output/spec.md` (« gardes à venir » against
   `/admin/reservations?compte=<id>&etat=en-cours` and the refused deletion; the four journal-writing
   acts each adding their entry on `/admin/journal`).
2. Operator: tick **Ready to merge** in the PR body, then `/pipeline release admin-sql-helpers-dedupe`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/55.

## Do not

- Do not touch the suspension predicates (`suspension-one-predicate` owns them, next in the epic).
- Do not convert the CTE acts to `db.batch` (D-152) or add a migration.
- Do not tick either gate on the PR, nor its acceptance-criteria boxes (status lives in `03_build/output/notes.md`).
