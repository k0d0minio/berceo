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

A box that needs a person's act or a test the session cannot do stays empty.
