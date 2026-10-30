> Done: automated setup session (gh, vercel, neonctl), 2026-10-30

# Stub: verify and close out the open setup stubs where a CLI check can confirm the act

- lane: chore
- found-by: Jamie's request to work through `.icm/intake/setup/` · 2026-10-30
- complexity: low
- priority: P1

## Problem

Eight setup stubs sat open in `.icm/intake/setup/`. Several of the acts they describe were
already done (by an earlier session or by Jamie, by hand), but no one had checked them
against the live state of GitHub, Vercel and Neon and moved the stubs.

## Proposed change

Read all eight stubs and their `Steps`. For each, check its `Done when` bullets against
`gh`, the Vercel CLI (`vercel`, already logged in) and `neonctl` (Neon API key from
`~/.zshrc`, loaded per command, never echoed). Move a stub to `setup/_done/` only when every
bullet holds, with the evidence recorded in a `## Notes` section. Leave a stub open, with a
dated note naming the gap, when a bullet needs a value this session cannot read (a secret's
content), a toggle only visible in a dashboard, or a credential (a Resend sandbox key) this
session has no account access to make.

## Acceptance criteria

- [x] Each of the eight setup stubs was read in full, Steps and Done when.
- [x] `actions-production-database`, `actions-vercel`, `neon-projects`, `uat-database` and
      `vercel-uat-environment` move to `setup/_done/`, each with command output as evidence.
- [x] `github-delete-head-branches`, `neon-vercel-integration` and `uat-variables` stay
      open, each with a dated note naming exactly what is missing or unconfirmed.
- [x] Nothing is guessed: no secret value was invented, no toggle was assumed, no key was
      fabricated.

## Out of scope

- Making the Vercel dashboard changes `neon-vercel-integration`'s note asks for.
- Making a Resend sandbox key.
- Dispatching `promote.yml` or otherwise touching production.
