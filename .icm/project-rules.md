# Project rules

This file belongs to the repo. Write the rules that are true for this repo only: the stack,
the conventions of the code, the names of things. Build and the lanes read it.

Keep it short. A rule that is true for all repos belongs in the blueprint, not here.
`CLAUDE.md` has the routing table (which file holds which feature) and the brand rules.
`README.md` has one section for each feature.

## Stack

- Next.js 16 (App Router), React 19, TypeScript. npm is the package manager.
- Tailwind CSS v4 and shadcn/ui (`src/components/ui/`, retuned to the art direction).
- Drizzle ORM on Neon Postgres. The schema is `src/db/schema.ts`. The migrations are in
  `drizzle/`.
- Neon Auth for accounts, Resend for e-mail, Stripe for the fee and the subscriptions, an S3
  bucket for the private documents.
- Vitest for the tests. Vercel for the deployments. GitHub Actions for CI and the scheduled
  jobs.

## Names

- The package name in `package.json` is `berceo-shell`. It is the name of the first
  increment. No script, workflow or deployment reads it. Keep it (JAM-242).
- The product words are French and stay French in code: `famille`, `professionnelle`,
  `demande` (a care request), `reservation` (a booking), `garde` (one night), `avis`
  (a rating), `credits`, `abonnements`, `paiements`, `favoris`, `messagerie`,
  `disponibilites`. A folder of `src/lib/` and of `src/components/` has the same name as its
  feature.
- The table and column names are English (`care_requests`, `bookings`, `ratings`).
- The routes are French: `/espace/famille`, `/espace/professionnelle`, `/admin`.

## Code conventions

- One feature is one folder of `src/lib/<feature>/`. Its `rules.ts` has the pure rules. Its
  other files are the only reads and writes of its tables. Another feature calls them. It
  does not query those tables.
- Every word that a user sees is in `src/content/`, one file for each surface, keyed by
  locale. A component gets its words as props.
- `src/app/globals.css` is the only file that holds a colour. `src/app/fonts.ts` is the only
  file that names a typeface.
- A test is next to its file: `<name>.test.ts`.
- A schema change: edit `src/db/schema.ts`, then `npm run db:generate -- --name <what>`, then
  commit `drizzle/`. `.icm/local/database.md` has the rest.
- Client-facing text is `fr-BE`. Code, commits, comments and notes are English.

## Docs

- The docs folder of the lane `knowledge` is `.icm/docs/`, with `README.md` at the root of
  the repo.
- `README.md` is the doc of the product as built. It is English. It has one `## ` section for
  each feature. The routing table of `CLAUDE.md` names these sections.
- `.icm/docs/` has the research of the engagement: `REPORT.md`, `cahier-des-charges.md`,
  `QUESTIONS.md`. `cahier-des-charges.md` and `DECOUVERTE-BERCEO.md` are the client's French
  and stay French.
- A link in a doc goes to a file that exists. Name a removed file by its commit, not by its
  old path.
