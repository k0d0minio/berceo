# Handoff: demande-de-garde

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` (or the Spec block of
   https://github.com/k0d0minio/berceo/pull/40); a change goes through `revise demande-de-garde "<what>"`.
2. Once **Spec approved** is ticked on PR #40: `/pipeline build demande-de-garde`, following `plan.md`.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/40

## Do not

- Do not tick either gate checkbox; do not start Build before the tick.
- Do not generate this run's migration while another run's migration is unmerged (verification-back-office).
- Do not add a code shortcut to make a professional `valide` for testing; set it on the preview's Neon branch.
- Do not use Vercel Cron for the digest: it does not run on the `uat` custom environment.
