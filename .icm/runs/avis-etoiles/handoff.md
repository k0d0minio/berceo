# Handoff: avis-etoiles

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the preview https://berceo-git-claude-hopeful-wright-505ax0-kodominio.vercel.app. A terminée garde is needed: book a past night on the preview's own Neon branch, or use one that has ended. Rate it from both sides at 360 px. Then check the notes on the profile, the answer cards, the request cards and both homes, and look at `/admin/avis`.
2. Tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/49, then `release avis-etoiles`.

## Blockers

- blocked on operator: the preview smoke and the **Ready to merge** tick.

## Do not

- Do not tick the gate checkboxes or the acceptance criteria on the PR. Their status is in `03_build/output/notes.md`.
- Do not hand-edit `drizzle/meta/_journal.json`. If `main` gains a migration first, regenerate `0011_avis` on the merged tree and reset the preview's Neon branch (learned rule).
- Do not re-derive the garde's state here. It is `src/lib/gardes/`'s.
- Release should look at D-122 (ratings of a garde later cancelled by an absence) and the `/admin/avis` 404 wording, both in Notes for Release.
