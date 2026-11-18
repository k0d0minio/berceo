# Database — the databases of today, and the migration at build

Language: en

This file belongs to the repo. The rule of the blueprint is `.icm/_system/features/database.md`
(the answer `database: postgres`, since 2026-11-18). This file has what is true of this repo
until the setup act `.icm/setup/databases.md` is done. It leaves with `vercel-build.sh` at
step 5 of that act.

## The databases

`.icm/environments.md` has the table. The provider is Neon.

- **Isolation is by Neon project.** Only Vercel Production and the workflow `promote` reach
  the project `berceo`. Each other deployment reads the project `uat-berceo` (why: a separate
  project is the strongest wall between the client's production data and a preview · Jamie,
  2026-10-28).
- **UAT** reads the default branch of `uat-berceo`.
- **Preview.** On 2026-10-29, Preview had the `DATABASE_URL` of UAT for all branches, and Neon
  had no branch for a preview. The blueprint asks for a third database: the shared preview
  database (`.icm/setup/databases.md`, step 1). The notes of the old setup stub
  `.icm/intake/setup/neon-vercel-integration.md` have the facts of 2026-10-30. No session read
  Vercel or Neon on 2026-11-18.
- **Neon Auth and the document store** follow the Neon branch of the database
  (`NEON_AUTH_BASE_URL`, `DOCUMENTS_S3_*` in `.env.example`). A new preview database needs its
  own values of these names on Preview.

## Who migrates

| Database | Today | After the setup act `databases` |
|---|---|---|
| A new, empty Postgres of the job `code` | each run of `ci` | the same |
| Preview | the Vercel build (`vercel-build.sh`) | the job `database` of `ci`, on each push to a pull request |
| UAT | the Vercel build of `uat`, and the job `database` of `ci` when the secret `UAT_DATABASE_URL` exists | the job `database` of `ci`, on each merge to `main` |
| Production | the workflow `promote`, from the secret `DATABASE_URL` | the same |

`db:migrate` applies only the migrations that the database does not have. A second run on the
same database applies nothing.

## The migration at build

`package.json` has this line:

```json
"vercel-build": "bash .icm/local/vercel-build.sh next build"
```

- `.icm/local/vercel-build.sh` runs `db:migrate`, then `db:verify`, then the build command.
  It skips the migration when `VERCEL_TARGET_ENV` is `production`: the build of production
  runs at the merge to `main`, before the sign-off. The workflow `promote` migrates production.
- Vercel sets `VERCEL_TARGET_ENV` at build, and no person sets it. Without it, the script stops.
- The script gives `db:migrate` and `db:verify` `DATABASE_URL_UNPOOLED` as `DATABASE_URL` when
  it has a value: a migration needs a direct connection.
- A migration at build runs while the previous deployment still serves. So a migration must
  work with the code that it replaces.

## The open fault (2026-11-18)

The job `code` of the workflow `ci` gives `DATABASE_URL` of a plain Postgres 17 service, and
`.icm/_system/ci/code.sh` runs `db:migrate` and `db:verify` on it. These two tools cannot
connect to a plain Postgres:

- `db:migrate` is `drizzle-kit migrate`. The repo has only the driver `@neondatabase/serverless`,
  and drizzle-kit then connects through a Neon websocket.
- `db:verify` is `scripts/verify-migrations.ts`. It uses `neon(url)`, the Neon HTTP driver.

Thus the job `code` is red on each run with the answer `database: postgres`. Jamie decides: a
plain Postgres driver for the two tools (for example `pg` as a development dependency), or the
answer `database: none`.

The repo has no `check:migrations` script. `src/db/migrations-journal.test.ts` refuses a
journal whose stamps are out of order.

## Names

| Name | Holds | Where |
|---|---|---|
| `DATABASE_URL` | the pooled connection string of the deployment's database | Vercel: Production, `uat`, Preview |
| `DATABASE_URL_UNPOOLED` | the direct connection string of the same database | as `DATABASE_URL` |
| `VERCEL_TARGET_ENV` | the deployment's environment, set by Vercel | Vercel, a system variable |
| `DATABASE_URL` (secret) | the direct connection string of production | GitHub Actions, for `promote` |
| `UAT_DATABASE_URL`, `PREVIEW_DATABASE_URL` (secrets) | the direct connection strings of UAT and of the preview database | GitHub Actions, for `ci` and `db-reset` (`.icm/setup/databases.md`, step 4) |
