# Handoff: gardes-shared-helpers

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** on https://github.com/k0d0minio/berceo/pull/56. Then run `/pipeline build gardes-shared-helpers` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/56

## Do not

- Do not start Build before the tick.
- Do not move `care_requests` reads out of `gardes.ts` or `reservations/bookings.ts`, because `care-requests-read-ownership` owns that.
- Do not touch `checkedId()` (D-155) or the SQL clocks in `admin/lists.ts` and `avis/ratings.ts`.
- Do not weaken or delete a test assertion to make a move compile.
