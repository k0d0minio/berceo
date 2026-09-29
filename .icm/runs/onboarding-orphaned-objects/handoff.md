# Handoff: onboarding-orphaned-objects

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/61, run
   `/pipeline build onboarding-orphaned-objects` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/61

## Do not

- Do not touch the photo's single-slot logic in `confirmUpload` beyond the removal order: that is
  `onboarding-double-photo-race` (2 of 3).
- Do not change `src/lib/admin/purge.ts` or `src/lib/admin/accounts.ts`: they already delete
  objects first.
- Do not fix the "last file" race in `removeFile` here: it is parked as
  `.icm/intake/triage/onboarding-remove-last-file-race.md`.
- Never tick a gate.
