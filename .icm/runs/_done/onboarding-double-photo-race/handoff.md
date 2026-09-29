# Handoff: onboarding-double-photo-race

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Merged and archived; nothing to pick up. The batch reaches production with the next
   promotion (`promote status`).

## Blockers

- none

## Do not

- When k0d0minio/berceo#61 (`onboarding-orphaned-objects`) meets this change on `main`, do not
  reintroduce a `removeDocuments` call on the photo path: the replacement lives in `recordUpload`.
