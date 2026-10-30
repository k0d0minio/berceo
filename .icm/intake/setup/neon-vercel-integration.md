# Setup: the Neon integration on each Vercel project

- setup-slug: neon-vercel-integration
- needs: database neon
- where: Vercel → the team → Storage, and each project → Settings → Environment Variables

## Why

The integration makes each preview's database: a Neon branch `preview/<git branch>`, made
before the build, and deleted with the git branch. No script of this build does it.

## Steps

Do these steps on each Vercel project of the build that reads the database:

1. Open Storage. Connect the Neon project `uat-berceo` to the project, for the
   environment Preview only.
2. Turn on a database branch for each preview deployment.
3. Turn on the deletion of the branch when its git branch is deleted.
4. Connect the Neon project `berceo` to the project, for the environment Production
   only. Or set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` of `berceo` on Production by
   hand.
5. Open Settings → Environment Variables. Make sure that Preview has no `DATABASE_URL` and no
   `DATABASE_URL_UNPOOLED` for all branches.
6. Make sure that "Automatically expose System Environment Variables" is on.

## Done when

- [ ] A new pull request gets a Neon branch `preview/<git branch>` in `uat-berceo`
      before its first build.
- [ ] Its preview build log shows `[vercel-build] VERCEL_TARGET_ENV=preview: migrate, verify,
      then build`.
- [ ] Preview has no `DATABASE_URL` for all branches.
- [x] Production reads `berceo`.

## Notes

2026-10-30: `vercel env ls --scope kodominio` on the project `berceo` shows two separate
variable groups:
- `Preview, Development, uat`: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_PROJECT_ID`,
  and the full Neon system set (`PGHOST`, `POSTGRES_URL`, …) — this is the non-production
  side, consistent with `uat-berceo` connected for Preview.
- `Production` only: its own separate hidden set of the same names — consistent with
  `berceo` connected for Production. This bullet is ticked on that evidence.

Two findings block the other three bullets, and need Jamie's hand in the Vercel dashboard
(Storage → the integration's settings), not a guess here:
1. **Preview carries a static `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.** Step 5 of this
   stub asks that Preview have none of these, for all branches, so the integration's
   per-build injection is the only source. The CLI's `env ls` cannot tell a static project
   variable from the integration's dynamic one, and this needs the dashboard to check and,
   if a static one exists, remove it.
2. **No `preview/*` branch exists in `uat-berceo` today**
   (`neonctl branches list --project-id dawn-scene-70949411` → only `main`), so "branch
   per preview deployment" (step 2) and "delete the branch when its git branch is deleted"
   (step 3) cannot be exercised: no feature pull request is open right now, only the
   release-please pull request #93. The first two `Done when` bullets need a real feature
   branch's preview build to confirm, after step 1 above is settled.

This also blocks `github-delete-head-branches`'s second bullet, which depends on this
integration's branch deletion.
