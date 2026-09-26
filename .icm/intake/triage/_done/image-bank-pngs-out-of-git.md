# Stub: Take the image-bank PNGs out of git
> Done 2026-09-26 (estate audit, icm-board D47): the image bank moved to icm-board `workspaces/deals/berceo/berceo-platform/raw/image-bank/` and `.icm/raw/**` is ignored here.

- lane: chore
- found-by: finition-accueil scope (D-7) · 2026-09-25
- complexity: low
- priority: P2

## Problem

`.icm/raw/Banque d_image/1.png`, `4.png`, `5.png`, `8.png` (7.7 MB together) are committed. They are the originals of the WebPs the site ships in `public/photos/`, hold no text for `process-raw.sh` to extract, and are recorded by link and description in `.icm/runs/finition-accueil/01_scope/_source/story.md`. AGENTS.md: never commit binaries over a few MB; brand masters live in Drive.

## Proposed change

Confirm the four PNGs are in the brand Drive, `git rm` them, and add a `.gitignore` rule so images dropped in `.icm/raw/` stay local. History rewrite is not part of this chore; it is the operator's call.

## Prompt

In the berceo repo, read `.icm/intake/triage/image-bank-pngs-out-of-git.md`. Confirm with the operator that `.icm/raw/Banque d_image/1.png`, `4.png`, `5.png`, `8.png` are held in the brand Drive, then `git rm` them and add a `.gitignore` rule keeping future `.icm/raw/` images local. No history rewrite. Run it through `/pipeline chore image-bank-pngs-out-of-git`.
