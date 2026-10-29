# Where the build runs

| Environment | Address | Vercel project | Database | Moves on |
|---|---|---|---|---|
| Production | https://www.berceo.be, https://www.berceo.eu | `berceo` | the default branch of the Neon project `berceo` | `promote.sh run --tag <tag>`, on Jamie's word |
| UAT | https://uat.berceo.be, https://uat.berceo.eu | `berceo` | the default branch of the Neon project `uat-berceo` | every merge to `main` |
| Preview | the pull request's Vercel preview | `berceo` | <the Neon branch `preview/<branch>` in `uat-berceo`. On 2026-10-29 Neon has no preview branch and Preview shares UAT's `DATABASE_URL`: setup stub `neon-vercel-integration`> | every push to the branch |

This table is the one home of where the build runs. The blueprint's files read it and never
repeat it. The blueprint owns this file: `copier update` merges a new tag into it three ways,
so a cell that a person filled stays filled.
Each setup stub in `.icm/intake/setup/` names the cells that it fills.
A person fills each `<…>` cell that no setup stub fills, when the project or the domain exists.
The UAT contract: `.icm/uat/CONTEXT.md`.
The database contract: `.icm/database/CONTEXT.md`.
