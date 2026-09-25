# Handoff: blocs-accueil

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the preview (https://berceo-git-claude-magical-babbage-sqwory-kodominio.vercel.app): `/` at phone and desktop widths, `/comment-ca-marche`, `/tarifs`, `/faq`.
2. Once **Ready to merge** is ticked on k0d0minio/berceo#47: `/pipeline release blocs-accueil`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/47

## Do not

- Do not change a word in `src/content/` or a colour token (D-5).
- Do not fix the parked `vitrine-mesures-hors-accueil` overruns here; they are the base's, and a bug lane owns them.
- Do not tick a gate box or an acceptance-criteria box in the PR body; each criterion's status is in `03_build/output/notes.md`.
