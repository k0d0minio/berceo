# Stub: Point uat.berceo.be at the UAT environment — the client cannot open UAT yet

- lane: chore
- found-by: estate template sync (icm-board ticket-base-rollout) · 2026-09-23
- priority: P1
- sources: `.icm/project.json` → `uat.url` = `https://uat.berceo.be` · `dig uat.berceo.be` and
  `curl https://uat.berceo.be` on 2026-09-23 and again 2026-09-24: the name does not resolve ·
  Vercel `GET /v6/domains/uat.berceo.be/config` 2026-09-24: `misconfigured: true`, recommended
  CNAME `d46ed30d4a191f65.vercel-dns-017.com.` · the Vercel project `berceo` has SSO protection
  `all_except_custom_domains`, so a deployment URL is never a client address — UAT needs the
  custom domain · reworded for D39 (2026-09-24): UAT is the Vercel custom environment `uat`, not
  a git branch

## What

The UAT environment is declared (`uat: {target: uat, url: https://uat.berceo.be}`) and deploys
`main` on every merge; `uat.berceo.be` is attached to the `uat` environment in Vercel (done
2026-09-24 in the D39 cutover). The name still has no DNS record, so the batch cannot be shown to
the founders, and `health_endpoint`'s UAT entry (`https://uat.berceo.be/api/health`) fails.

One act left, the operator's, never an agent's (`_shared/promotion.md`):

- Infomaniak DNS for `berceo.be`: `uat` CNAME → the value Vercel shows on the domain
  (`d46ed30d4a191f65.vercel-dns-017.com.` on 2026-09-24).

Fallback, no DNS act needed: `uat.berceo.jamienisbet.com` (jamienisbet.com is on Vercel DNS) —
attached to the `uat` environment, then `/setup` rewrites `uat.url` and the health endpoint.

## Done when

- `curl -sI https://uat.berceo.be` answers from the `uat` environment's deployment (not an SSO wall).
- `.icm/scripts/deploy-status.sh --sha <main> --uat` reads it; `health-check.sh` passes its UAT entry.

## Prompt

In the berceo repo, read `.icm/intake/triage/uat-address-dns.md`. The UAT address
`https://uat.berceo.be` declared in `.icm/project.json` does not resolve. Walk Jamie through the
Infomaniak CNAME — never change Vercel or DNS yourself — then verify with
`curl -sI https://uat.berceo.be` and `.icm/scripts/deploy-status.sh --sha <main> --uat`. If Jamie
prefers the fallback `uat.berceo.jamienisbet.com`, run `/setup` to rewrite `uat.url` and the UAT
health endpoint. Close the stub by moving it to `.icm/intake/triage/_done/` in a direct commit
to `main`.
