# Handoff: suspension-one-predicate

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview (https://berceo-git-claude-hopeful-lovelace-ivr63t-kodominio.vercel.app)
   against criteria 7 and 8 of the spec, then ticks **Ready to merge** on
   https://github.com/k0d0minio/berceo/pull/65.
2. Then `/pipeline release suspension-one-predicate`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/65

## Do not

- Do not tick either gate checkbox.
- Do not add a view or a migration (D-169), nor an `isSuspended()` JavaScript twin (D-170).
- Do not touch the writes and guards in `src/lib/admin/accounts.ts`.
