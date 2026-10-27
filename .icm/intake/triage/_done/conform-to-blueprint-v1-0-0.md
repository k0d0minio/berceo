# Stub: The repo renders from the blueprint v1.0.0

- lane: chore
- found-by: the house conformance stub `conformance-v1-0-0.md` · 2026-10-27
- complexity: low
- priority: P1

## Problem

`.copier-answers.yml` names blueprint v0.8.0. The blueprint is at v1.0.0. `database` and `migrations_path` are new questions. The repo has no lanes, no hotfix lane, no database contract, no `merge.sh`, no `release.sh` and no gate workflow. `CLAUDE.md` names the tier `app`, says that the merge is a human's, and says that Jamie merges the release pull request and dispatches `promote.yml`.

## Proposed change

Run `copier update` to v1.0.0 with the answers of record, each by `--data`. Keep the repo's own files: `README.md`, `.icm/intake/README.md`, `CLAUDE.md`, `.gitignore` and `.env.example`. Then bring the rows and rules of `CLAUDE.md` in line with the blueprint's `template/CLAUDE.md.jinja` at v1.0.0 for these answers.

## Acceptance criteria

- [ ] `.copier-answers.yml` names `v1.0.0`. Its answers are `workspace: false`, `monorepo: false`, `release: true`, `uat: true`, `database: neon` and `migrations_path: drizzle`. `slug`, `client_name` and `language` do not change.
- [ ] `.icm/lanes/`, `.icm/database/CONTEXT.md`, `.icm/scripts/merge.sh`, `.icm/scripts/release.sh`, `.icm/scripts/preview-db.sh` and `.github/workflows/gate.yml` exist. `.icm/scripts/uat-db.sh` does not exist.
- [ ] `CLAUDE.md` does not name a tier. It has the lane, hotfix, no-ticket, question, merge-release-or-promote and database rows, the blueprint's merge rule, the `release.sh` line and the blueprint's UAT rule. The `Release` section is gone.
- [ ] `ci` is green, bar `gate / gate` before the tick.

## Notes

The dry run of 2026-10-27 answered `monorepo: true`. Berceo has no `apps/` and no `packages/`, so the answer is `false`. `.icm/CONTEXT.md` stays: a separate pull request removes the legacy files. The `## Order` of `.icm/intake/README.md` came from pull request #75.
