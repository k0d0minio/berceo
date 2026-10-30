> Done: automated setup session (gh), 2026-10-30

# Setup: production's connection string for the migration in promote.yml

- setup-slug: actions-production-database
- needs: uat, a database
- where: GitHub → the repository → Settings → Secrets and variables → Actions

## Why

`promote.yml` migrates production before it promotes. Without this secret, a build whose
`package.json` names `db:migrate` stops the promotion before production moves.

## Steps

1. Copy production's direct (unpooled) connection string from the database's console.
2. In GitHub, add the repository secret `DATABASE_URL` with that string.
3. Put the string nowhere else in GitHub. No workflow but `promote.yml` reads it.

## Done when

- [x] The repository has the secret `DATABASE_URL`, with production's direct connection
      string.

## Notes

2026-10-30: `gh api repos/k0d0minio/berceo/actions/secrets` lists `DATABASE_URL`
(`updated_at: 2026-09-23T12:08:31Z`), the only workflow that reads it is `promote.yml`
(checked: no other workflow names it). A GitHub Actions secret's value cannot be read back
by the API or the CLI, so the string itself (that it is production's direct, unpooled
connection string and not UAT's) is not verified here. `promote.yml` has never run yet (no
run in the Actions history), so there is no execution evidence either. Jamie confirms the
secret still holds the correct string before the first `promote`.
