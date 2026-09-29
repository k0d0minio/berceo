# Handoff: messagerie-profil-non-valide

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview https://berceo-git-claude-gifted-hypatia-k309zu-kodominio.vercel.app
   (a professional with a waiting answer and one booked: reopen her file from her space; the
   waiting answer's conversation shows « Fermée » on both sides with no composer, the booked one
   still takes messages from both).
2. Once **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/58, run
   `/pipeline release messagerie-profil-non-valide`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/58.

## Do not

- Do not tick either gate box, or the acceptance-criteria boxes (their status is in `03_build/output/notes.md`).
- Do not touch bookings, `retenue` answers or the garde's status: out of scope (D-156).
- Do not add words to `src/content/messagerie.ts` or a schema migration (D-157, D-158).
- Do not reuse D-153 to D-155: sibling runs hold them; this run's decisions are D-156 to D-158.
