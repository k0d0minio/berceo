# Handoff: onboarding-upload-limit-race

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** in the body of
   https://github.com/k0d0minio/berceo/pull/53; then `build onboarding-upload-limit-race`.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/53
- blocked on operator: the Vercel check fails on every new head ("Resource provisioning failed",
  ~1 s, no build log) — also on #52 and #54. The Neon non-production project
  (`dawn-scene-70949411`, `uat-berceo`) holds 10 branches, the plan's limit: `main` and nine
  `preview/claude/*` branches of long-merged work, all created 2026-09-26 11:02. The Neon–Vercel
  integration cannot create this PR's preview branch. Deleting the stale preview branches
  (Neon console, or with the operator's go-ahead) clears it; `ci-status.sh` reads RED until then,
  and Build step 9 cannot flip on a RED.

## Do not

- Do not start Build before the tick; never tick it yourself.
- Do not touch `removeDocuments` / `removeFile` (onboarding-orphaned-objects) or the photo's
  replacement step (onboarding-double-photo-race).
- Do not run the proof against UAT's or production's database.
