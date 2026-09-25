# Handoff: premier-ecran

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads the spec (`02_define/output/spec.md`) and ticks **Spec approved** in the
   body of https://github.com/k0d0minio/berceo/pull/46; a change goes through
   `revise premier-ecran "<what>"`.
2. Then `/pipeline build premier-ecran` — executes `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/46

## Do not

- Do not start Build before the Spec approved tick; never tick it.
- Do not change any word in `src/content/` or any colour token (D-5, encres-contraste).
- Do not touch the bands below the hero in `src/app/(public)/page.tsx` — blocs-accueil owns them.
