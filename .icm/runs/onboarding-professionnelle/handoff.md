# Handoff: onboarding-professionnelle

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** on
   https://github.com/k0d0minio/berceo/pull/35 (or asks for `revise onboarding-professionnelle "<what>"`).
2. Then `/pipeline build onboarding-professionnelle`, following `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/35.

## Do not

- Do not start Build before the Spec approved box is ticked; never tick it.
- Do not write to the production Neon project (`tiny-cell-08223046`): its bucket, credential and
  Vercel Production variables are the operator's before promotion (D41).
- Do not build the founders' review, the refusal purge or any family-facing profile view: stubs 5,
  7, 8, 15 own them.
