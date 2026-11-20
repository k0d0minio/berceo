# The burst mode

Language: en

Owner: Jamie. Date: 2026-11-20. This file belongs to the repo. It stays while the mode is in
use. Jamie removes the mode with a pull request that deletes this file, `burst-check.sh` and
the route in `ROUTES.md`.

A burst is a set of tickets that are built at the same time. Each ticket has its own local
branch. A ticket has no CI run and no pull request of its own. One check runs at the end of
the burst. A green burst goes to `main` with one pull request, reaches UAT, and the client
tests it.

## What the mode sets aside

Jamie approved these exceptions on 2026-11-20. Each other rule of `CLAUDE.md`,
`.icm/project-rules.md` and `.icm/_system/` stays.

| Rule | In a burst |
|---|---|
| "One ticket is one run, one branch and one pull request" (`CLAUDE.md`) | One pull request carries each ticket of the burst. A ticket has no run folder |
| "Open the pull request with `new-run.sh`" (`.icm/_system/rules/github.md`) | The coordinator opens the pull request of the burst with `gh pr create` |
| "Never run build, lint, typecheck, test or dev locally" | Only the coordinator runs `.icm/local/burst-check.sh` and a dev server, on the branch `burst-<N>` |

The gates do not change. The body of the pull request has the anchor
`<!-- gate:ready-to-merge -->` and its box. Only Jamie ticks it. `release.sh <number>` merges.
Production moves only on Jamie's word.

## The roles

- **The coordinator** is one session. It cuts `burst-<N>` from `main`, starts the ticket
  sessions, merges their branches, runs the check, tests in the browser, and opens the pull
  request.
- **A ticket session** builds one ticket in its own worktree, on its own local branch cut
  from `burst-<N>`.

## Rules of a ticket session

Read this file first. Then read `CLAUDE.md` and `.icm/project-rules.md`.

1. Work only in your worktree, on your branch. Do not change the branch.
2. Read your ticket in the brief that the coordinator gave you. Do not read Linear, and do not
   write to Linear.
3. Do not use the pipeline commands of `.icm/_system/` (`new-run.sh`, `resolve-run.sh`,
   `release.sh`, `merge.sh`, the stage and lane contracts). This file replaces them for you.
   Do not make a run folder.
4. Write the code and the unit tests of what you add. A test is next to its file.
5. Do not run a build, lint, typecheck, test or dev command. The coordinator runs the check.
6. Do not push, fetch or pull. Do not open a pull request.
7. Edit only the files that your brief names. If you need a different file, stop and tell the
   coordinator: a different ticket can own that file.
8. Do not edit these files. The coordinator writes them at the merge, from your report:
   `README.md`, `CLAUDE.md`, `AGENTS.md`, `.env.example`, each file of `.icm/`.
9. Only the migration ticket of the burst edits `src/db/schema.ts` and `drizzle/`. Its brief
   says so. Make the migration with `npm run db:generate -- --name <what>`. Do not run
   `db:migrate` or `db:push`.
10. Keep the rules of personal data and access control. A feature reads a table only through
    the folder of `src/lib/` that owns it. Keep the suspension predicate
    (`src/lib/auth/suspension.ts`) and each isolation test.
11. Never write a secret in a file. A new environment variable gets a name in your report, not
    a value. Do not read a `.env*` file.
12. Each word that a user sees is French (`fr-BE`), is in `src/content/`, follows the rules of
    words in `CLAUDE.md`, and has `@relecture` when it is not quoted from the client.
13. Commit small, on your branch, with the ticket key at the start of each message.
14. Write a finding that is not part of your ticket in your report. Do not correct it.

## The report of a ticket session

End with these parts, in this sequence:

1. The branch, and each commit (hash and subject).
2. Each file that you changed or added.
3. What you did not do, and why.
4. Each debt that you left.
5. What to look at in the browser: the page, the account kind, the steps.
6. Text for `README.md`, and the routing row for `CLAUDE.md` if the ticket adds a feature.
7. Each new environment variable, by name.

## The check and the ship (the coordinator)

1. Merge the ticket branches into `burst-<N>` in a fixed sequence. The migration ticket is
   first. One burst has one migration at most.
2. Run `bash .icm/local/burst-check.sh`.
3. Apply the migration of the burst to the Neon branch `local/bursts` of the project
   `uat-berceo`, and to no other database. Local work never reads the production database.
4. Start the dev server and test each feature in the browser with the test accounts of
   `local/bursts`. Use invented people only. `next dev` writes a block in `AGENTS.md`: restore
   the file before a commit.
5. A ticket that cannot be made green leaves the burst. Say which ticket and why.
6. Push `burst-<N>` and open one pull request into `main`. Its title and body are French and
   list the ticket keys. This is the one CI run of the burst. A red CI on a branch that was
   green locally is a finding: report the difference.
7. After the merge, when UAT has the burst, move each merged ticket in Linear to the state
   « To test » with the BAXTER tool. Move no ticket that left the burst.

## The local environment

- `.env.local` comes from the Vercel environment `development`, and its database and auth
  variables name the Neon branch `local/bursts`. Git ignores the file. Do not read it and do
  not print a value of it.
- Node: CI uses version 22.
