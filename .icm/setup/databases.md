# Setup: the three databases

- where: Neon, Vercel and GitHub, mostly through the BAXTER commands below

## Steps

The steps are for Neon, the provider of the estate. Another provider: the same databases,
made by hand. Each act that writes to a service is the operator's.

1. **The databases.** Neon projects: `berceo` (production) and `uat-berceo` (UAT).
   The shared preview database is one fixed branch `preview` of `uat-berceo`, not a
   branch for each pull request. On the computer of BAXTER one command makes the branch and
   stores its pooled and direct strings in the env store (environment `preview`):
   `baxter_tool run neon create_preview_database '{"name": "uat-berceo", "slug": "berceo"}' --yes`.
   The new branch is a copy of UAT: no first reset is necessary.
2. **Neon Auth** (only when the app uses it). Each Neon branch has its own Neon Auth and its
   own schema `neon_auth`. Neon console → the preview database → Auth: turn it on,
   with the settings of the UAT database. Store its URL:
   `baxter_env.py set berceo preview NEON_AUTH_BASE_URL`. The reset never copies
   `neon_auth`.
3. **The Vercel integration of Neon.** Turn off "Create a branch for each preview
   deployment", and delete each `preview/*` branch that it made.
4. **Vercel.** Each environment gets two strings of its database: `DATABASE_URL` (pooled,
   for the app) and `DATABASE_URL_UNPOOLED` (direct, for the migration of the build).
   Production gets production, `uat` gets UAT, Preview (all branches) gets `preview`.
   The operator pushes the store: `baxter_env.py push berceo <environment>`.
5. **GitHub.** `baxter_env.py actions-setup berceo` (the operator) writes the repo
   secrets from the direct strings of the store: `PREVIEW_DATABASE_URL`,
   `UAT_DATABASE_URL` (the reset copies UAT) and `DATABASE_URL` (the promotion migrates
   production). They need no keyring name of their own. `--plan` shows the state.
6. **`package.json`.** `db:migrate` applies the migrations, `db:verify` (optional) checks the
   schema, and `"vercel-build": "bash .icm/_system/scripts/db.sh build"`: Vercel runs it in
   place of `build`; it migrates, then builds. Remove each other migration of a build line,
   and a `vercel-build.sh` of the repo. The job `code` fails without this script. With a
   serverless driver only (Neon HTTP or WebSocket), add `pg`: the migration of CI reaches a
   plain Postgres.

## Done when

- [ ] The build log of a preview has "db.sh: the migration of the preview database, before the build".
- [ ] The job `code` of the workflow `ci` is green.
- [ ] A preview reads the shared preview database.
- [ ] No database branch for a pull request exists.
