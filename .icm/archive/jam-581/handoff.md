# Handoff jam-581

## Next action

Jamie tests the preview and ticks Ready to merge. The release that carries this pull request runs `migrate-production.yml` before `promote.sh run` (migration 0040).

## How to test

On the preview, open Tarifs: Une nuit comes first, and Parenthèse, Sérénité and Premium show their price per month. Check that the header menu shows Tarifs. Sign up as a family with Une nuit: after the e-mail check, the Checkout of the one-night plan opens.

## Decisions

- Q1, Jamie in chat, 2026-11-25: "Do it in this PR". In the live session, the same day: "Add it to #144". AC-4 is in this pull request, with a database change.
- The monthly price rounds to the nearest cent, a half cent up. Jamie has not decided otherwise (2026-11-25).

## Blockers

- none

## Do not touch

- none
