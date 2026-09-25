# Handoff: avis-etoiles

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. **Spec approved** is ticked (2026-09-25). Take cycle-de-garde-et-annulation through Define, Build and Release in its own session: `new cycle-de-garde-et-annulation`.
2. Once cycle-de-garde-et-annulation has merged on `main`, run `build avis-etoiles`, starting with `plan.md` → Pass 0 (merge `main`, then name the three garde facts in `notes.md`).

## Blockers

- cycle-de-garde-et-annulation (stub 11) is not built yet. This run reads its terminée / annulée states and the garde's end instant. It must be defined, built and merged first (`new cycle-de-garde-et-annulation`).

## Do not

- Do not start Build before cycle-de-garde-et-annulation has merged, and never re-implement the garde's state here.
- Do not tick the gate checkboxes.
- Do not add any text field to the rating flow or a text column to `ratings` (D-18).
- Do not hand-edit `drizzle/meta/_journal.json`. Regenerate the migration on the merged tree.
