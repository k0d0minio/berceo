# Where the build runs

| Environment | Address | Vercel project | Database | Moves on |
|---|---|---|---|---|
| Production | https://www.berceo.be, https://www.berceo.eu | `berceo` | the default branch of the Neon project `berceo` | `migrate-production.yml`, then `promote.sh run --tag <tag>`, on Jamie's word |
| UAT | https://uat.berceo.be, https://uat.berceo.eu | `berceo` | the default branch of the Neon project `uat-berceo` | every merge to `main` |
| Preview | the pull request's Vercel preview | `berceo` | <the Neon branch `preview/<branch>` in `uat-berceo`. On 2026-10-29 Neon has no preview branch and Preview shares UAT's `DATABASE_URL`: the old setup stub `.icm/intake/setup/neon-vercel-integration.md` has the notes> | every push to the branch |

This table is the one home of where the build runs. This file belongs to the repo. The scripts
find the Vercel project from the git link of the repo, not from this file.
The setup acts are in `.icm/setup/`.
The UAT contract: `.icm/_system/features/uat.md`.
The database rule: `.icm/local/database.md`.
