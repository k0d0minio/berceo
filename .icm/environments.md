# Where the build runs

| Environment | Address | Vercel project | Database | Moves on |
|---|---|---|---|---|
| Production | https://www.berceo.be, https://www.berceo.eu | `berceo` | the default branch of the Neon project `berceo` | `promote.sh run --tag <tag>`, on Jamie's word. The workflow `promote` migrates production first |
| UAT | https://uat.berceo.be, https://uat.berceo.eu | `berceo` | the default branch of the Neon project `uat-berceo` | every merge to `main`. The job `database` of `ci` migrates UAT |
| Preview | the pull request's Vercel preview | `berceo` | <the shared preview database: one fixed Neon branch `preview` in `uat-berceo`, for all previews. Until Jamie makes it (`.icm/setup/databases.md`), Preview reads UAT's `DATABASE_URL`> | every push to the branch. The job `database` of `ci` migrates the preview database |

This table is the one home of where the build runs. This file belongs to the repo. The scripts
find the Vercel project from the git link of the repo, not from this file.
The setup acts are in `.icm/setup/`.
The UAT contract: `.icm/_system/features/uat.md`.
The database rule: `.icm/_system/features/database.md` (the blueprint, `database: postgres`;
Jamie, 2026-11-27: "database should be neon with uat"). The provider is Neon. Isolation is by
Neon project: only Vercel Production and the workflow `promote` reach the project `berceo`.
UAT and the preview database are in the project `uat-berceo`. Neon Auth and the document store
follow the Neon branch of the database (`NEON_AUTH_BASE_URL`, `DOCUMENTS_S3_*`).
