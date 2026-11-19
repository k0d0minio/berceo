# Findings jam-304

## The previews migrate the UAT database (2026-11-19)

- Neon project `uat-berceo` has one branch, `main`. Each preview build runs `db:migrate` against UAT's `DATABASE_URL` (`.icm/local/database.md`, Preview row).
- Result: the UAT database already holds the JAM-304 migration (row 38 of `__drizzle_migrations`, the old `0035_une-nuit-et-codes-promo`, same SQL as `0036` now), before any merge. Rows 37 and 39 are migrations of two other open branches.
- Risk 1: a pull request that is closed without merge leaves its tables and enum values in UAT.
- Risk 2: the migrator applies only entries whose `when` is greater than the newest row. When two open branches migrate the shared database, a branch with an older stamp gets a no-op or a failed `CREATE` (the preview of commit 9c6e7da failed on `db:migrate` for this reason).
- Proposal for Jamie: turn on the Neon integration on Vercel so each preview has its own branch `preview/<git branch>` (`.icm/intake/setup/neon-vercel-integration.md`).
