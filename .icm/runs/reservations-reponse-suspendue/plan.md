# Plan: reservations-reponse-suspendue

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The withdrawal helper** — `src/lib/reservations/answers.ts`: a `reopeningWithdrawsAnswers(profileId, at)`
   beside `suspensionWithdrawsAnswers`, updating her `en_attente` answers to `retiree` (`updated_at = at`)
   only when her profile is no longer `valide` and was moved at `at` (condition on
   `professional_profiles.updated_at = at and status <> 'valide'`, the same "only if that write moved it"
   guard suspension uses with `suspendedAtExactly`). Returns the ids. — done when: the helper exists, is
   exported, and touches no other professional's rows.
2. **`reopenFile` writes both together** — `src/app/(portail)/espace/professionnelle/actions.ts`: replace
   the lone `update` with `db.batch([statusUpdate, reopeningWithdrawsAnswers(profile.id, now)])` using one
   `now` for both (the batch is one transaction on the Neon HTTP driver, as `suspendAccount` relies on).
   The status update keeps its `status = <read status>` guard. — done when: a reopen from `valide` leaves
   `brouillon` + her waiting answers `retiree`, and a no-op reopen withdraws nothing.
3. **The test** — `src/lib/reservations/*.test.ts` (pure, no database, the repo's style): hold the
   helper's statement (`.toSQL()`) to its conditions — `status = 'en_attente'`, her profile only, the
   moved-at guard — and, if a pure rule is extracted (`leavesValide(from, to)`), its truth table. — done
   when: vitest passes in CI.
4. **The dialog sentence** — `src/content/professionnelle.ts` → `reouverture.description`: append
   « Vos disponibilités en attente de réponse seront retirées. » (or an equivalent within D-19), with the
   `@relecture` mark. — done when: `vitrine.test.ts` passes.
5. **The backfill** — `npm run db:generate -- --custom --name retrait_reponses_profils_non_valides`
   (load `.icm/skills/database-migration/`): one idempotent `UPDATE care_request_applications SET
   status = 'retiree', updated_at = now() WHERE status = 'en_attente' AND profile_id IN (SELECT id FROM
   professional_profiles WHERE status <> 'valide')`. No schema change. — done when: the migration and its
   `meta/_journal.json` entry are committed as `0013_…`.
6. **README** — the answer-and-booking section notes that reopening a validated file withdraws her
   waiting answers. — done when: the line is there.

## Risks

- `drizzle-kit generate --custom` needs no database but does need the journal in order: a parallel run
  landing `0013` first means renumbering at the merge of `main` (signal: two `0013_` files).
- `updated_at = at` as the "moved" guard assumes `reopenFile` sets exactly that `now`; if Build prefers
  a single CTE statement (`with reopened as (update … returning id) update care_request_applications …`),
  that is equally fine and needs no timestamp guard — record the choice in `notes.md`.
- The dialog sentence is copy: the mechanical check can pass while Surya still rewords it (`@relecture`).
