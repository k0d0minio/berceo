# Handoff: profil-famille

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/34, run
   `/pipeline release profil-famille`. Read `03_build/output/notes.md` → Notes for Release first.

## Blockers

- blocked on operator: smoke the preview https://berceo-git-claude-quirky-cray-agr7cf-kodominio.vercel.app
  (sign in as a family on that preview's branch, `/espace/famille/profil` at 360 px and desktop), then
  tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/34.

## Do not

- Do not tick a gate.
- Do not hand-edit `src/lib/communes/data.ts`; regenerate with `scripts/communes/generate.py`.
- Do not let a file outside `src/lib/famille/` read `family_profiles` (the guard test fails).
- onboarding-professionnelle also adds a migration: generate it on a tree that has 0002, never in parallel.
