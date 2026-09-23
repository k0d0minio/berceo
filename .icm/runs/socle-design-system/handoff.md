# Handoff: socle-design-system

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview https://berceo-git-claude-practical-johnson-2wrp8b-kodominio.vercel.app
   — `/` (must match production's holding page exactly), `/design-system` (hover the buttons,
   open the dialog, try Escape and Tab, narrow the window for the menu),
   `/design-system/portail` (mobile menu, sign-out dialog), `/api/health`.
2. Tick **Ready to merge** on PR #21, then run `release socle-design-system`.

## Blockers

- none.

## Do not

- Tick a gate checkbox.
- Change AGENTS.md's "committed to dark" rule (the vitrine's Release owns it).
- Put a colour value outside `src/app/globals.css` (and `theme-color.ts`, B-2), or the red/green tokens outside `confirm-dialog.tsx`.
