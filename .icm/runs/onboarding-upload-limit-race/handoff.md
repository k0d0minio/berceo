# Handoff: onboarding-upload-limit-race

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** in the body of
   https://github.com/k0d0minio/berceo/pull/53; then `build onboarding-upload-limit-race`.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/53

## Do not

- Do not start Build before the tick; never tick it yourself.
- Do not touch `removeDocuments` / `removeFile` (onboarding-orphaned-objects) or the photo's
  replacement step (onboarding-double-photo-race).
- Do not run the proof against UAT's or production's database.
