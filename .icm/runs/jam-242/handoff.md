# Handoff jam-242

## Next action

The operator reads the diff of pull request #129 and ticks **Ready to merge**. Then Release merges.

## How to test

Open the preview. The site looks and works as before. The change is in docs and config only.

## What changed

1. `.icm/project-rules.md` has the stack, the names, the code conventions and the docs. The docs folder of the lane `knowledge` is `.icm/docs/`, with `README.md`.
2. `.gitignore` has no rules for `.icm/raw/` and `.icm/processed/`, and no comment about the old desk. These folders do not exist.
3. `README.md`, section of the family profile: the dead link to `.icm/intake/triage/famille-changement-email.md` is gone. The text names the stub, pull request #73 and commit `5119934`. Git history keeps the stub.
4. `AGENTS.md` names the router `.icm/_system/ROUTER.md`.
5. The package name `berceo-shell` stays. No script, workflow or deployment reads it. A rename needs an edit of `package-lock.json` without a local `npm install`, and it gives no value. `.icm/project-rules.md` records the decision.
6. Three closed stubs in `.icm/intake/triage/_done/` said `icm-board`. They now say "the old desk". `git grep -n "icm-board"` finds nothing.

## Why no user sees a difference

No file of `src/`, `public/`, `package.json` or a workflow changed. The changed files are docs, `.gitignore` and run records. `.gitignore` lost rules for folders that do not exist.

## Blockers

- none

## Do not touch

- none
