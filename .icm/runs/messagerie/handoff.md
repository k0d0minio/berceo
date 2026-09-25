# Handoff: messagerie

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/44; to change the spec first: `revise messagerie "<what>"`.
2. Then `/pipeline build messagerie`, following `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/44.

## Do not

- Do not tick either gate box.
- Do not start Build before the tick.
- Do not generate the migration while another open run holds one; generate it on the tree as merged.
- Do not subscribe to PR activity on #44 (`.icm/_shared/github.md` → PR events).
