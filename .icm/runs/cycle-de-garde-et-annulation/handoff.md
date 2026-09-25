# Handoff: cycle-de-garde-et-annulation

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` (or the PR's Spec block on
   https://github.com/k0d0minio/berceo/pull/48) and ticks **Spec approved** in the PR body; a
   change goes through `revise cycle-de-garde-et-annulation "<what>"`.
2. Then `/pipeline build cycle-de-garde-et-annulation`, executing `plan.md` pass by pass (the
   spec is `complex`: Build on `opus`).

## Blockers

- blocked on operator: tick **Spec approved** in the body of PR #48.

## Do not

- Do not start Build before the Spec approved tick; never tick it.
- Do not touch `vercel.json` (the reminder runs from GitHub Actions, D-108).
- Do not add a refund on a family's cancellation or on an absence (D-2, D-106).
- Do not open a second PR for this run; the branch is `claude/quirky-sagan-yfikdh`.
