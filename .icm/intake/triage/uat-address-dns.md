# Stub: Point uat.berceo.be at the uat branch — the client cannot open UAT yet

- lane: chore
- found-by: estate template sync (icm-board ticket-base-rollout) · 2026-09-23
- priority: P1
- sources: `.icm/project.json` → `uat.url` = `https://uat.berceo.be` · `dig uat.berceo.be` and
  `curl https://uat.berceo.be` on 2026-09-23: the name does not resolve · the Vercel project
  `berceo` has SSO protection `all_except_custom_domains`, so a branch alias is never a client
  address — UAT needs the custom domain

## What

The UAT environment is declared (`uat: {branch: uat, url: https://uat.berceo.be}`) and the
`uat` branch deploys, but the fixed address has no DNS record and no Vercel domain assignment.
Until both exist, the batch on `uat` (today: `socle-design-system`) cannot be shown to the
client, `deploy-status.sh --uat` reads nothing at the address, and `health_endpoint`'s UAT entry
(`https://uat.berceo.be/api/health`) fails.

Both acts are the operator's, never an agent's (`.icm/uat/CONTEXT.md`):

1. Vercel → project `berceo` → Domains: add `uat.berceo.be`, assigned to git branch `uat`.
2. Infomaniak DNS for `berceo.be`: the CNAME Vercel asks for (`uat` → `cname.vercel-dns.com`,
   or the value Vercel shows).

Fallback, no DNS act needed: `uat.berceo.jamienisbet.com` (jamienisbet.com is on Vercel DNS) —
then `/setup` rewrites `uat.url` and the health endpoint to match.

## Done when

- `curl -sI https://uat.berceo.be` answers from the `uat` deployment (not an SSO wall).
- `.icm/scripts/deploy-status.sh --uat` reads the address; `health-check.sh` passes its UAT entry.

## Prompt

In the berceo repo, read `.icm/intake/triage/uat-address-dns.md`. The UAT address
`https://uat.berceo.be` declared in `.icm/project.json` does not resolve. Walk Jamie through the
two operator acts (Vercel domain on branch `uat`; the Infomaniak CNAME) — never change Vercel or
DNS yourself — then verify with `curl -sI https://uat.berceo.be` and
`.icm/scripts/deploy-status.sh --uat`. If Jamie prefers the fallback
`uat.berceo.jamienisbet.com`, run `/setup` to rewrite `uat.url` and the UAT health endpoint.
Close the stub by moving it to `.icm/intake/triage/_done/` in a ticket PR into `uat`.
