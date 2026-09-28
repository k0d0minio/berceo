# Handoff: reservations-reponse-suspendue

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator smokes the preview https://berceo-git-claude-charming-curie-mqr7d9-kodominio.vercel.app: as a validated professional with a waiting answer, « Modifier ma profession ou mes justificatifs » → the dialog's last sentence, then the answer gone from the family's list and the request editable.
2. After **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/54, run `/pipeline release reservations-reponse-suspendue`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/54

## Do not

- Do not touch `src/lib/admin/review.ts` (D-146) or the suspension path (D-134).
- Do not touch the conversations: that is `messagerie-profil-non-valide`, the epic's second stub.
- Do not tick either gate box.
- The run's Neon branch `run/reservations-reponse-suspendue` holds migration 0013; release it with `db-branch.sh reservations-reponse-suspendue down` after the merge.
