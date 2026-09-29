# Handoff: messagerie-profil-non-valide

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/58, run
   `/pipeline build messagerie-profil-non-valide` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/58.

## Do not

- Do not tick either gate box.
- Do not touch bookings, `retenue` answers or the garde's status: out of scope (D-156).
- Do not add words to `src/content/messagerie.ts` or a schema migration: the closing reuses what exists (D-157, D-158).
