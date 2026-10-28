# Stub: The build migrates on the rule that `.icm/database/CONTEXT.md` states

- lane: chore
- found-by: the preview build of `profil-professions-inami` · 2026-10-28
- complexity: low
- priority: P2

## Problem

`package.json` runs `db:migrate` when `VERCEL_ENV` is not `production`. `.icm/database/CONTEXT.md` says the build migrates only when `MIGRATE_AT_BUILD` is `1`. The contract also says the Neon integration never serves Preview. On this project it cuts a `preview/<branch>` branch for every pull request, and the first preview build migrated that branch.

## Proposed change

Investigate. Then make `package.json`, the Vercel variables and the contract say the same rule. The blueprint may render one of them: if so, change the blueprint and run `copier update`.

## Acceptance criteria

- [ ] `vercel-build` in `package.json` and `.icm/database/CONTEXT.md` state the same condition.
- [ ] A preview build of a pull request with no migration never runs `db:migrate` against the base.
