# Handoff: reservations-regles-non-appelees

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/57, run
   `/pipeline build reservations-regles-non-appelees` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/57

## Do not

- Do not tick either gate checkbox.
- Do not change what any SQL statement decides (D-156): extract and test only.
- Do not add a Neon-branch or live-database test.
- Do not reshape `pendingCounts` or `waitingAnswerOf` in `answers.ts`: that is the sibling stub
  `reservations-compte-reponses-une-demande`.
