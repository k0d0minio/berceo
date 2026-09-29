# Handoff: onboarding-double-photo-race

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md`, tick **Spec approved** in the body of
   https://github.com/k0d0minio/berceo/pull/60, then run `/pipeline build onboarding-double-photo-race`.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/60

## Do not

- Do not start Build before the tick; do not tick it.
- Do not touch `removeDocuments` / `removeFile` ordering — `onboarding-orphaned-objects` owns it.
- Do not add a migration or index (run D-1).
