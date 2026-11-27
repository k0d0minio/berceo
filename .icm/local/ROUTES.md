# Routes of this repo

Language: en

These routes are in addition to `.icm/_system/ROUTER.md`. They belong to this repo.

## The burst mode

| You are asked to | Go to |
|---|---|
| build a ticket in a burst, or coordinate a burst | `.icm/local/BURSTS.md`, then `.icm/local/burst-check.sh` for the coordinator |

## The markdown backlog of before 2026-11-18

Before the BAXTER blueprint, a ticket of this repo was a markdown stub:
`.icm/intake/<epic>/<slug>.md` with a `breakdown.md` for each epic, and
`.icm/intake/triage/<slug>.md`. A finished stub is in a `_done/` folder. On 2026-11-18 the repo
had two open stubs: `annulations-credits/annulations-back-office.md` and
`triage/vitrine-compte-gratuit-profils-complets.md`.

A ticket is now a Linear key of the team `JAM`. A stub is not a ticket.

1. To work on a stub, the operator asks BAXTER for its Linear ticket. BAXTER makes it from the
   stub: the title, the sections, and the path of the stub.
2. Start the work with the Linear key, as the router says.
3. In the pull request of that ticket, move the stub into its `_done/` folder.
4. Do not start a run from a stub path: the blueprint of this repo refuses it.

`.icm/intake/README.md` has the order of the epics and each decision.

## The setup stubs of before 2026-11-18

`.icm/intake/setup/` has the setup stubs of the pipeline of before, with their notes. They are
records. The setup acts of today are in `.icm/setup/`.

- `neon-vercel-integration` and `github-delete-head-branches` are open. They ask for one Neon
  branch for each preview. `.icm/setup/databases.md` replaces them since 2026-11-27: one
  shared preview database, and no Neon branch for each preview.
- `uat-variables` has one open point in its notes: `RESEND_API_KEY` is not on the Vercel
  environment `uat`. It is part of `.icm/setup/vercel-uat.md`, step 6.

## The database

The repo uses the database model of the blueprint since 2026-11-27 (`database: postgres`,
Jamie: "we want things to run from baxter's blueprint rather than relying on berceo's own
pipelines"). The rule is `.icm/_system/features/database.md`. The Neon databases are in
`.icm/environments.md`. The repo's own migration at the Vercel build and its workflow
`migrate-production.yml` are removed.

`drizzle-kit migrate` and `npm run db:verify` connect with `pg` (node-postgres), so they work
on the empty Postgres of the CI job `code` and on a direct Neon connection string. The app
reads the database with the Neon HTTP driver (`src/db/index.ts`).

## The scheduled product workflows

`.github/workflows/avis-invitations.yml`, `demandes-digest.yml` and `gardes-rappel.yml` belong
to the product. Each calls a cron route of the application on UAT and on production. The
blueprint does not own them, and has no feature that replaces them: they are app crons, not CI.
`vercel.json` has one more app cron, the purge of refused files.
