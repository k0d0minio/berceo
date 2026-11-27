# Setup checklist of berceo

The blueprint wrote this list for the answers of this repo (1.0.0-rc30). It has only the
items that apply to this repo. Do the items in the setup pull request of the repo.
- (S): a session does it.
- (J): the operator does it, in a service or with a secret value.
- (B): BAXTER does it, with its data or its tools.

A session ticks the box of an item (S) when it is done. A session does not tick a box of
(J) or (B).

## Render the blueprint
- [ ] (S) Run `bin/update-repo.sh <repo>` of the blueprint on a clean tree at
      `origin/main`. The script does not commit.
- [ ] (S) Read `.icm/project.json`. The update adds each missing key of the template and
      keeps each value. Write each empty value that this repo needs.
- [ ] (S) Write `.icm/environments.md`: one row for each environment (the address, the
      Vercel project, the database, what moves it).
- [ ] (S) Write `.icm/project-rules.md`: the stack, the names, the code conventions.
      When the script `dev` of `package.json` is not the correct command, add the line
      `- dev server: <command with {port}>`.
- [ ] (S) `CLAUDE.md` imports `.icm/_system/ROUTER.md` and routes the files of this repo.

## GitHub
- [ ] (J) A ruleset on `main` makes these checks necessary: `secrets`,
      `workflows`, `icm-check` and `code`.
- [ ] (S) No workflow calls `legible-consulting/.github`.
- [ ] (J) Code security: Dependabot alerts on, and Dependabot security updates on
      (`dependabot-security.md`).
- [ ] (J) The Actions secret `VERCEL_TOKEN` and the Actions variable `VERCEL_TEAM`.
- [ ] (J) Settings, Actions, General: "Allow GitHub Actions to create and approve pull
      requests" is on (`actions-promote.md`).

## Vercel and UAT
- [ ] (J or B) The Vercel project is linked to this repo (`vercel-uat.md`).
- [ ] (J or B) The custom environment `uat` follows `main`.
- [ ] (J or B) The domain `uat.<domain>` is on `uat`, with its DNS record.
- [ ] (J or B) "Auto-assign Custom Production Domains" is off.
- [ ] (J) Each variable of the app is on `uat`, with sandbox keys only.
- [ ] (J) `promote.sh status` reads each UAT project and prints no `SETUP:` line.
- [ ] (J) A merge to `main` opens or updates the release pull request.

## Database
- [ ] (S) This repo has no database answer. Write the database rule of this repo in
      `.icm/project-rules.md`, or write that it has no database.

## Request button
- [ ] (S) The root layout has `<RequestButton lang="<language of the site>" />` after
      `{children}`. Give `lang` (`en`, `fr` or `pt`): with no `lang`, the first render of
      the form is in English (`request-button.md`).
- [ ] (S) When the layout knows the session, give `user`. This is optional.
- [ ] (S) The route `app/api/baxter-request/route.ts` (or below `src/`) exports `POST` again.
- [ ] (S) The Content-Security-Policy of this repo permits a POST to the same origin.
- [ ] (S) The TypeScript and ESLint configuration of this repo accept
      `.icm/_system/request-button/`.
- [ ] (S) On a local dev server, the button shows, and an empty POST to the route gets 400.
- [ ] (J) Vercel `uat`: `BAXTER_REQUEST_ENV` = `uat`. Production does not have it.
- [ ] (J) Vercel `uat`: `BAXTER_REQUEST_LINEAR_API_KEY`.
- [ ] (J) The label `requests.linear_label` of `.icm/project.json` exists in the team
      `JAM`.

## Checktest
- [ ] (S) Write the seed script of the contract in `checktest-accounts.md`: test addresses
      only, it refuses production, the database address comes from the environment of the
      target, it can run again with no change, exit 0 or 1 with one line.
- [ ] (B) The test passwords are in the data of BAXTER. They are never in this repo.
- [ ] (B) Storyboards exist for this repo (`baxter_tool run checktest storyboards`).
- [ ] (J) After the checktest signs up the admin account on UAT, run the seed one time. The
      UAT database address comes from the keyring of BAXTER for that one command. Never
      write it in a file.

## Linear
- [ ] (B) The org `kodominio` is in the keyring of BAXTER.
- [ ] (S) `linear.writes` of `.icm/project.json` is `session`.
- [ ] (S) `linear.states`: the state names of the team `JAM`. An empty
      name: no state move at that event.

## Close
- [ ] (S) CI is green on the setup pull request, and the Vercel preview builds.
- [ ] (J) Tick each box of the other files of `.icm/setup/` when its act is done.
