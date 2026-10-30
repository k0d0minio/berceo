> Done: automated setup session (vercel CLI, dig, curl), 2026-10-30

# Setup: the UAT environment on each Vercel project that the client tests

- setup-slug: vercel-uat-environment
- needs: uat
- where: Vercel → the project → Settings → Environments, and the domain registrar

## Why

Without the custom environment `uat`, no merge reaches the UAT address, and `promote.sh` finds
no UAT project. Without the second step, each merge moves production before the sign-off.

## Steps

Do these steps on each Vercel project of an app that the client tests:

1. Make sure that the team is on the Pro plan. A custom environment needs it.
2. Make sure that the project's git link is this repository.
3. Open Settings → Environments. Add a custom environment with the slug `uat`.
4. Set its branch tracking to `main`.
5. Attach the domain `uat.<the production domain>` to `uat`.
6. Add the CNAME record at the domain registrar.
7. Open Settings → Environments → Production. Set "Auto-assign Custom Production Domains" to
   off.
8. In `.icm/environments.md`, write the project's name in the column `Vercel project` of
   its UAT row, and the UAT address in the column `Address` of the same row.

## Done when

- [x] Each project that the client tests has the custom environment `uat`, from `main`.
- [x] The UAT address opens the newest build of `main`.
- [x] `.icm/environments.md` has one UAT row for each project that the client tests. Each
      row names the project in `Vercel project` and its UAT address in `Address`.
- [x] A merge to `main` makes a staged production deployment that serves no domain.

## Notes

2026-10-30:
- `vercel teams ls` shows `kodominio` on plan `pro`.
- The linked project `berceo` is this repository (`vercel link --project berceo --scope
  kodominio`, confirmed: already linked).
- `vercel environments ls` shows the custom environment `uat`, branch tracking `main`, type
  `Preview`.
- `vercel domains inspect berceo.be` / `berceo.eu` show `uat.berceo.be` and `uat.berceo.eu`
  attached to the project `berceo`. `dig` resolves both to Vercel's edge CNAME; `curl`
  returns HTTP 200 on `uat.berceo.be` and HTTP 302 on `uat.berceo.eu` (redirect, consistent
  with one canonical host). `vercel inspect uat.berceo.be` shows the deployment aliased
  there is the `uat` target build of `8357fc9`, `main`'s current head: the newest build.
- `.icm/environments.md` already carries the UAT row (`berceo`, the two addresses), filled
  by #125 on 2026-10-29.
- The latest `production`-target deployment from a push to `main` (`dpl_Zmh73…`, from
  `8357fc9`) carries only the generic `*.vercel.app` aliases, no `berceo.be`/`berceo.eu`
  alias. `www.berceo.be` still serves an older deployment (36 days old, the last actual
  promotion). This confirms "Auto-assign Custom Production Domains" is off: a merge stages
  production without moving the live domain.
