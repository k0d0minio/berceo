# Stub: Take the image-bank PNGs out of git

- lane: chore
- found-by: finition-accueil scope (D-7) · 2026-09-25
- complexity: low

## Problem

`.icm/raw/Banque d_image/1.png`, `4.png`, `5.png`, `8.png` (7.7 MB together) are committed. They are the originals of the WebPs the site ships in `public/photos/`, hold no text for `process-raw.sh` to extract, and are recorded by link and description in `.icm/runs/finition-accueil/01_scope/_source/story.md`. AGENTS.md: never commit binaries over a few MB; brand masters live in Drive.

## Proposed change

Confirm the four PNGs are in the brand Drive, `git rm` them, and add a `.gitignore` rule so images dropped in `.icm/raw/` stay local. History rewrite is not part of this chore; it is the operator's call.
