# Routes of this repo

Language: en

These routes are in addition to `.icm/_system/ROUTER.md`. They belong to this repo.

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
  branch for each preview. No file of `.icm/setup/` replaces them: the repo answered
  `database: none`.
- `uat-variables` has one open point in its notes: `RESEND_API_KEY` is not on the Vercel
  environment `uat`. It is part of `.icm/setup/vercel-uat.md`, step 6.

## The database

`.icm/local/database.md` is the database rule of this repo: the Neon databases, the migration
at the Vercel build (`.icm/local/vercel-build.sh`), and the migration of production before a
promotion (`.github/workflows/migrate-production.yml`). The database model of the blueprint
is not adopted.

## The scheduled product workflows

`.github/workflows/avis-invitations.yml`, `demandes-digest.yml` and `gardes-rappel.yml` belong
to the product. Each calls a cron route of the application. `migrate-production.yml` belongs to
the repo also. The blueprint does not own them.
