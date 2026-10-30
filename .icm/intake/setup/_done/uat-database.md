> Done: automated setup session (vercel CLI), 2026-10-30

# Setup: the UAT database on the UAT environment

- setup-slug: uat-database
- needs: uat, database neon
- where: Vercel → each UAT project → Settings → Environment Variables

## Why

The integration serves Preview and Production. The `uat` environment reads the default branch
of `uat-berceo` from two variables that a person sets.

## Steps

Do these steps on each UAT project:

1. In the Neon console, copy the pooled and the direct connection strings of the default
   branch of `uat-berceo`.
2. Add `DATABASE_URL` with the pooled string to the environment `uat` only.
3. Add `DATABASE_URL_UNPOOLED` with the direct string to the environment `uat` only.

## Done when

- [x] Each UAT project has `DATABASE_URL` and `DATABASE_URL_UNPOOLED` on `uat`, from
      `uat-berceo`.
- [x] The UAT build log shows `[vercel-build] VERCEL_TARGET_ENV=uat: migrate, verify, then
      build`.

## Notes

2026-10-30: `vercel env ls uat --scope kodominio` on the project `berceo` (the repository's
one Vercel project) shows `DATABASE_URL` and `DATABASE_URL_UNPOOLED`, each scoped to
`Preview, Development, uat`, alongside the full Neon-integration variable set
(`NEON_PROJECT_ID`, `PGHOST`, `POSTGRES_URL`, …), which matches the non-production project
`uat-berceo` connected for Preview per `neon-vercel-integration`.
`vercel inspect uat.berceo.be --logs` on the newest `uat` deployment
(`dpl_6kpcqQtHw8ywxSt7X5cTM6BUCibh`, built from `main` at `8357fc9`, the current head) shows
the line `2026-10-29T23:11:50.779Z  [vercel-build] VERCEL_TARGET_ENV=uat: migrate, verify,
then build`, matching exactly.
