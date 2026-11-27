# Database — fixed databases, and migrations that CI proves

Language: fr

## Purpose

Each migration applies to the database of a deployment before that deployment serves.
CI proves each migration from zero. No database is made for a pull request.

## Inputs

- `package.json`: `db:migrate` applies the migrations. `db:verify` (optional) examines the
  schema. `check:migrations` (optional) examines the order against the base branch.
  `vercel-build` is `bash .icm/_system/scripts/db.sh build`: the job `code` fails without it.
- The setup act `.icm/setup/databases.md`.

| Database | Reads it | Migrates on |
|---|---|---|
| A new, empty Postgres of the job `code` | the tests in CI | each run of `ci` |
| The shared preview database | each preview | the Vercel build of each preview |
| UAT | UAT | the Vercel build of UAT, at each merge to `main` |
| Production | production | the promotion, before the code moves (`features/uat.md`) |

## Process

1. **The build migrates, then serves** (1.0.0-rc35). Vercel builds each deployment at the
   push. `db.sh build` migrates the database of that deployment (`DATABASE_URL_UNPOOLED` of
   its Vercel environment), then builds. A deployment serves only after its build: no code
   serves on an old schema. A failed migration fails the build, and the old deployment
   serves on. A production build does not migrate: the promotion migrates.
   The job `code` applies each migration from zero on a new database, then the tests run on
   it. Two builds can migrate the shared preview database at the same time: a build that
   fails on the migration of another build is built again (Redeploy in Vercel).
2. **Migrations go forward only.** A migration must work with the code that serves while it
   runs. Add a column first, use it in the next release, and remove an old one last.
3. **Write a migration** with the tool of the repo. Do not edit a migration that is on
   `main`. Do not run a migration on a computer against a shared database.
4. **The mixed preview database.** Two pull requests can each apply a migration to the
   shared preview database. When a preview fails because of the other pull request, the
   operator says "reset the preview database". The session runs
   `gh workflow run db-reset.yml -f ref=<the branch to test>`. The workflow empties the
   preview database, copies UAT into it, and applies the migrations of that branch.
   It drops and copies only the schemas of the owner of the database: the schema
   `neon_auth` of Neon Auth stays as it is, and the users of UAT are not copied.
5. **A failed migration** stops its build. The shared database keeps its last good schema.
   Read the build log. A dropped connection: Redeploy. A fault in the migration: fix it
   forward, as a new migration on the branch.

## Outputs

- A green job `code`: each migration applies from zero, and the tests pass on it.
- Each shared database at the schema of its code.

## Gates

None. The operator's word starts a reset.
