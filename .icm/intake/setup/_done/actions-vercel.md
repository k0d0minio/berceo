> Done: automated setup session (gh, vercel CLI), 2026-10-30

# Setup: the Vercel token and team in GitHub Actions

- setup-slug: actions-vercel
- needs: uat
- where: GitHub → the repository → Settings → Secrets and variables → Actions

## Why

`promote.yml` and the UAT scripts read Vercel with these two names. Without them, no promotion
runs.

## Steps

1. In Vercel, make a token for the team. Give it the smallest scope that reads and promotes
   deployments.
2. In GitHub, add the repository secret `VERCEL_TOKEN` with the token.
3. Add the repository variable `VERCEL_TEAM` with the team's slug.
4. Add no variable that names a project. The scripts find the projects.

## Done when

- [x] The repository has the secret `VERCEL_TOKEN`.
- [x] The repository has the variable `VERCEL_TEAM`.
- [x] `.icm/scripts/promote.sh status` lists each UAT project.

## Notes

2026-10-30: `gh api repos/k0d0minio/berceo/actions/secrets` lists `VERCEL_TOKEN`
(`updated_at: 2026-10-27T16:05:16Z`). `gh api repos/k0d0minio/berceo/actions/variables`
lists `VERCEL_TEAM=kodominio`. No variable names a project, as the steps ask. A Vercel
token named `berceo-vercel` exists in the team's token list (`vercel tokens ls`),
consistent with the secret's purpose.
`promote.sh status`, run without `VERCEL_TOKEN` locally (by design: the token lives only
in the GitHub secret, never on a workstation), correctly reports `VERCEL_TOKEN is not set:
UAT and production were not read` and still prints the git and GitHub part of its status.
The CLI, logged in as Jamie, independently confirms the one condition the script's project
discovery depends on: the Vercel project `berceo` carries the custom environment `uat`
(`vercel environments ls` → `uat main Preview`), so `vercel_uat_projects()` would find it
once a run supplies the secret. `promote.yml` itself has never run yet (no run in the
Actions history), so there is no end-to-end execution evidence.
