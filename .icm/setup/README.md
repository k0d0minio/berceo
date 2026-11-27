# Setup

This folder belongs to the repo. Each file is one act that a person does one time, in a
service that no session can change: Vercel, GitHub settings, the database provider. The
blueprint writes a file for each act that the answers need. A file stays here. The person
ticks its boxes when the act is done. A session reads the boxes and does not tick them.

## Ticks by a session

Jamie, 2026-11-26, in the chat of the rc29 update (k0d0minio/berceo#148): "let's handle all
of this in this pr". On that word a session made the GitHub acts (the ruleset of `main`,
Dependabot) and ticked each box that it verified on that date:
- `github-checks.md`: no `legible-consulting` in `.github`; the ruleset "main: required
  checks" requires `secrets`, `workflows`, `code` and `icm-check`.
- `actions-promote.md`: the release pull request #93 was updated after the merge of #145.
- `vercel-uat.md`: the newest `uat` deployment is `fa8ef5b`, the head of `main`.
- `contact-email.md`, `sleep-consultation-url.md`: Vercel has the variable on Preview, `uat`
  and Production; `/contact` and `/consultation-sommeil` answer on UAT.

- `dependabot-security.md`: alerts and security updates turned on. The box waits for the
  first pull request of Dependabot.

Jamie, 2026-11-27: Jamie ran the seed of `checktest-accounts.md` step 3 on UAT. It printed
"parent -> admin". A session ticked the box of `checktest-accounts.md` on 2026-11-27 on this
evidence:
- The checktest run `20261127-095017-admin-signin` signed in `test+berceo-admin@jamienisbet.com`
  on UAT with the password and the e-mail code, and `/admin` showed « Vue d'ensemble ».
- The run `20261127-095140-admin-signin` (storyboard `.icm/local/checktest/admin-signin.json`)
  passed with 1 scene of 1.
`/admin` answers 404 to each user who is not an admin. Thus the page shows only to the role.

The same session ticked two more boxes on 2026-11-27, on the evidence of that date:
- `dependabot-security.md`: version updates are off (`open-pull-requests-limit: 0`), and
  Dependabot opened security pull requests (#155 to #164). For example #155 updates
  `systeminformation`, which has 3 open alerts.
- `request-button.md`, the box `BAXTER_REQUEST_ENV`: `baxter_env.py drift berceo uat
  --names` gives `BAXTER_REQUEST_ENV` and `BAXTER_REQUEST_LINEAR_API_KEY` on `uat` equal to
  the keyring. Production has neither. The button shows on UAT. A POST with no body to
  `https://uat.berceo.be/api/baxter-request` answers 400. The box of the Linear key stays
  empty: no session sent a request to Linear.

Jamie, 2026-11-27: Jamie ran `promote.sh status` in his terminal with the token from the
keyring of BAXTER (the command is in `vercel-uat.md`). It exited 0 with these lines:
- `berceo: uat READY dpl_2LqyQ3Gs7qppta1QWfQSBt7Q4kEy of 6da32d3 · production serves dpl_4Jb9x3JLqqpkgBYUib88kZ4BqW1i`
- `RESULT: OK batch 63 since v1.2.0`
It printed no line `SETUP:`. On this evidence a session ticked on 2026-11-27 the two boxes
of `vercel-uat.md` for `promote.sh status` and the box of `actions-promote.md`.

A box that needs a person's act or a test the session cannot do stays empty.
