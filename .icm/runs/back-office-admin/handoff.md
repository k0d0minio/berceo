# Handoff: back-office-admin

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/51, run `build back-office-admin` (complex spec: open the session on `opus`).
2. Build follows `plan.md` pass by pass; the schema pass first (`.icm/skills/database-migration/`).

## Blockers

- blocked on operator: read the spec and tick **Spec approved** in the body of PR #51.

## Do not

- Do not tick either gate checkbox.
- Do not start Build before the tick.
- Do not hard-delete a `users` row, cancel a confirmed garde on suspension, or touch the journal trigger (D-134, D-136, D-54).
- Do not re-run `new-run.sh`: changes to the spec go through `revise back-office-admin "<what>"`.
