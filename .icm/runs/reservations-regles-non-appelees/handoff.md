# Handoff: reservations-regles-non-appelees

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview https://berceo-git-claude-exciting-maxwell-nebvmn-kodominio.vercel.app
   as a validated professional on `/espace/professionnelle/demandes`: a waiting answer on a
   request ahead shows « Retirer ma disponibilité », withdrawing works, and the list shows the
   same requests in the same order as before.
2. Tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/57, then run
   `/pipeline release reservations-regles-non-appelees`.

## Blockers

- blocked on operator: smoke the preview, then tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/57

## Do not

- Do not tick either gate checkbox, nor the acceptance-criteria boxes in the PR body (their state is in `03_build/output/notes.md`).
- Do not change what any SQL statement decides (D-156).
- Do not reshape `pendingCounts` or `waitingAnswerOf` in `answers.ts`: that is the sibling stub
  `reservations-compte-reponses-une-demande`.
- Do not renumber D-156/D-157 again. The three sibling runs holding D-153 to D-155 must move theirs.
