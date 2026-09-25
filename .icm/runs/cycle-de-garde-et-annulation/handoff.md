# Handoff: cycle-de-garde-et-annulation

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the preview https://berceo-git-claude-quirky-sagan-yfikdh-kodominio.vercel.app
   (a family and a professional account with a confirmed garde: states, cancel from each side,
   the fee line after a professional's cancellation, republish, report an absence on a started
   garde, `/admin/absences`), then ticks **Ready to merge** in the body of PR #48.
2. Then `/pipeline release cycle-de-garde-et-annulation`: reviews, README (« The garde's life »,
   the booking and fee sections) and the AGENTS.md routing row for `src/lib/gardes/`, changelog,
   close-out, squash-merge; `db-branch.sh cycle-de-garde-et-annulation down` after the merge.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** in the body of PR #48.

## Do not

- Do not tick either gate; do not open a second PR (branch `claude/quirky-sagan-yfikdh`).
- Do not touch `vercel.json` (the reminder runs from GitHub Actions, D-108).
- Do not add a refund on a family's cancellation or on an absence (D-2, D-106).
- Do not renumber D-105 to D-113: the sibling avis-etoiles renumbers its own (decisions.md).
