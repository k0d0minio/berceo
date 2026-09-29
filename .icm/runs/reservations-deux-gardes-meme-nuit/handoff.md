# Handoff: reservations-deux-gardes-meme-nuit

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator reads `02_define/output/spec.md` (or the PR's Spec block) and ticks **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/59.
2. Then `build reservations-deux-gardes-meme-nuit`, following `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/59.

## Do not

- Do not tick either gate box.
- Do not add a data fix to the migration (D-158); a duplicate found by the probe is a STOP.
- Do not touch `src/lib/reservations/answers.ts`: the epic's next two stubs own it.
