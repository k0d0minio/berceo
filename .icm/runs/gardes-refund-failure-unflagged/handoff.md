# Handoff: gardes-refund-failure-unflagged

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** on https://github.com/k0d0minio/berceo/pull/63.
2. Then `build gardes-refund-failure-unflagged` on branch `claude/adoring-dijkstra-o6099q`, following `plan.md`.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/63.

## Do not

- Do not start Build before the tick; never tick it.
- Do not touch `src/lib/gardes/` (`refundOnCancellation` stays as is) or the other two stubs of `gardes-annulation-suivi`.
- Do not add a column or a migration: the booking carries the facts (D-162).
