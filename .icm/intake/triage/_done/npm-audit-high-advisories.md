# Stub: Clear the four high/critical npm advisories the security gate reports

- lane: chore
- found-by: security-check · 2026-09-23
- priority: P1
- sources: `npm audit --audit-level=high` on `main` at a407c5e, before the database landed

## What

`.icm/scripts/security-check.sh` answers `BLOCKED 1` on any change that touches the lockfile,
because `npm audit` reports four high/critical advisories that were already in `main`'s
`package-lock.json` before the Drizzle/Neon PR:

- `next` 16.3.0 — critical (GHSA-p293-qw3h-jr36 Windows-only RCE; GHSA-2xp9-vwfh-vxw4 RCE in
  the Image Optimization API with AVIF input). Fix is `next@16.3.6`, outside the pinned
  `16.3.0`; `eslint-config-next` moves with it.
- `sharp` < 0.35.4 — high (libheif). `npm audit fix`.
- `fast-uri` 3.0.0–3.1.5 — high (SSRF/host confusion). `npm audit fix`.
- `js-yaml` 4.0.0–4.3.1 — high (CPU). `npm audit fix`.

The Drizzle/Neon PR did not introduce any of them (its own additions surface only moderate
advisories: `esbuild` via `drizzle-kit`, `hono`, `qs`), so per the `security-audit` skill they
are parked here rather than absorbed into that diff.

## Done when

`npm audit --audit-level=high` is clean on `main` and `security-check.sh` on a change that
touches the lockfile answers `OK`. The Vercel build is green with the bumped `next`.

## Prompt

Read `.icm/intake/triage/npm-audit-high-advisories.md` in this repo, then run
`npm audit --audit-level=high`. Bump `next` and `eslint-config-next` together to the patched
16.3.x, run `npm audit fix` for the transitive three, commit `package.json` and
`package-lock.json` on a `claude/` branch, and let CI and the Vercel build be the verdict —
never `npm audit fix --force`, and never run `build` or `lint` locally
(`AGENTS.md` → Standing rules). Finish by `git mv`-ing this stub to
`.icm/intake/triage/_done/`.
