# Handoff: reservations-reponse-suspendue

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/54, run `/pipeline build reservations-reponse-suspendue` and follow `plan.md`.

## Blockers

- Vercel preview deploys fail with "Resource provisioning failed" on every branch pushed since 12:11 UTC (see `error.log`); not this diff. Build's ready flip needs a green deploy, so check it before flipping.
- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/54

## Do not

- Do not touch `src/lib/admin/review.ts` (D-146) or the suspension path (D-134).
- Do not touch the conversations: that is `messagerie-profil-non-valide`, the epic's second stub.
- Do not tick either gate box.
- Before Build lands decisions, re-check the next free `D-n` against open runs (`comptes-auth-cleanups` holds D-144/D-145).
