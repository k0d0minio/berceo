# Database — the Neon databases, and who migrates

Language: en

This file belongs to the repo. It is the database rule of this repo.

**The database model of the blueprint is not adopted** (the answer `database: none`, Jamie,
2026-11-18). Reason: that model proves each migration on a plain Postgres in CI, and this repo
has only the Neon serverless driver. `drizzle-kit migrate` and `scripts/verify-migrations.ts`
cannot connect to a plain Postgres. The rule of before 2026-11-18 stays.

## The databases

`.icm/environments.md` has the table. The provider is Neon.

- **Isolation is by Neon project.** Only Vercel Production and the workflow
  `migrate-production` reach the project `berceo`. Each other deployment reads the project
  `uat-berceo` (why: a separate project is the strongest wall between the client's production
  data and a preview · Jamie, 2026-10-28).
- **UAT** reads the default branch of `uat-berceo`.
- **Preview.** The design is one Neon branch `preview/<git branch>` of `uat-berceo` for each
  preview, made by the Neon integration on Vercel. On 2026-10-30 that was not in effect:
  Preview had a `DATABASE_URL` for all branches, and Neon had no preview branch. The notes of
  `.icm/intake/setup/neon-vercel-integration.md` have the facts of that date.
- **Neon Auth and the document store** follow the Neon branch of the database
  (`NEON_AUTH_BASE_URL`, `DOCUMENTS_S3_*` in `.env.example`).

## Who migrates

| Database | Migrates on | With |
|---|---|---|
| Preview | each Vercel build of a preview | `.icm/local/vercel-build.sh` |
| UAT | each Vercel build of `uat`, at a merge to `main` | `.icm/local/vercel-build.sh` |
| Production | the operator's word, before the promotion | the workflow `migrate-production` |

CI migrates no database, and no job proves the migrations from zero.
`src/db/migrations-journal.test.ts` refuses a journal whose stamps are out of order.

## The migration at build

`package.json` has this line:

```json
"vercel-build": "bash .icm/local/vercel-build.sh next build"
```

- `.icm/local/vercel-build.sh` runs `db:migrate`, then `db:verify`, then the build command.
  It skips the migration when `VERCEL_TARGET_ENV` is `production`: the build of production
  runs at the merge to `main`, before the sign-off.
- Vercel sets `VERCEL_TARGET_ENV` at build, and no person sets it. Without it, the script stops.
- The script gives `db:migrate` and `db:verify` `DATABASE_URL_UNPOOLED` as `DATABASE_URL` when
  it has a value: a migration needs a direct connection.
- A migration at build runs while the previous deployment still serves. So a migration must
  work with the code that it replaces.

## The migration of production

The workflow `promote` of the blueprint migrates nothing with the answer `database: none`.
The repo has its own workflow, `.github/workflows/migrate-production.yml`, with the steps of
the promote workflow of before 2026-11-18: `db:migrate`, then `db:verify`, from the repository
secret `DATABASE_URL`, at the commit of the release tag.

The order of a promotion (`.icm/_system/features/uat.md` has the other steps):

1. The sign-off, then `promote.sh release`. The tag `v*` exists.
2. On the operator's word: `gh workflow run migrate-production.yml -f tag=<tag>`. Read the run.
   A red run: stop, and do not promote.
3. On the operator's word: `promote.sh run --tag <tag>`.

A release with no new file in `drizzle/` needs no step 2. The run is safe in that case: it
applies nothing.

## Names

| Name | Holds | Where |
|---|---|---|
| `DATABASE_URL` | the pooled connection string of the deployment's database | Vercel: Production, `uat`, Preview |
| `DATABASE_URL_UNPOOLED` | the direct connection string of the same database | as `DATABASE_URL` |
| `VERCEL_TARGET_ENV` | the deployment's environment, set by Vercel | Vercel, a system variable |
| `DATABASE_URL` (secret) | the direct connection string of production | GitHub Actions, for `migrate-production` |
