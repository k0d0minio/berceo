# Handoff: candidature-et-reservation

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview (https://berceo-git-claude-kind-faraday-8m50tu-kodominio.vercel.app): a validated professional answers and withdraws, a family compares two answers and books one, both confirmation e-mails, the declined professional's e-mail, the address only on her garde, the full profile with « Prochaines disponibilités », a priority request, republishing. A professional becomes `valide` through the founders' queue (`/admin`).
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/42.
3. Then `/pipeline release candidature-et-reservation`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/42.

## Do not

- Do not tick a gate or an acceptance-criteria box; the criteria's status is in `03_build/output/notes.md`.
- Do not add a payment step, messaging, cancellation of a confirmed booking or ratings: stubs 9 to 12.
- Do not regenerate 0007 unless `main` gains another migration first; if it does, regenerate on the merged tree and reset both the run branch and the PR's `preview/claude/kind-faraday-8m50tu` Neon branch (the learned rule).

## Made in this run

- D-70 to D-78 (Define) and D-82 to D-86 (Build) — see `decisions.md`. D-79 to D-81 belong to disponibilites-indicatives.
