# Handoff: verification-back-office

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads the spec (`02_define/output/spec.md`, or the Spec block of https://github.com/k0d0minio/berceo/pull/39) and ticks **Spec approved** in the PR body.
2. Then `/pipeline build verification-back-office`, following `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/39.

## Do not

- Do not start Build before the Spec approved box is ticked, and never tick it.
- Do not add a contact address to any e-mail (D-51); do not add a new profile state for held student files (D-52).
- Do not write production's Neon project or Vercel Production variables (`CRON_SECRET` in Production is the operator's).
