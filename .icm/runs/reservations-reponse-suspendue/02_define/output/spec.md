# Spec: A professional's waiting answers are withdrawn when her profile leaves `valide`

- slug: reservations-reponse-suspendue
- personas: professionnel, parent
- touches: src/app/(portail)/espace/professionnelle/actions.ts, src/lib/reservations/**, src/content/professionnelle.ts, drizzle/**
- complexity: standard

## Problem

The edit lock on a care request, the family's pending-answer count and the answers list count only
the waiting answers of validated professionals (D-85). A professional whose profile leaves `valide`
while her answer waits therefore stops locking the request: the family edits the night, and if the
professional is validated again, her old `en_attente` answer reappears on the new night, at her old
rate, and can be accepted and paid. A family can end up booking a night the professional never
said she was free for. Found by the candidature-et-reservation release review (2026-09-25); it is
the first of the two stubs of the « what follows a professional leaving `valide` » epic, whose
point is that the same trigger is handled once and consistently.

## Proposed change

**The trigger (D-146).** A profile leaves `valide` in exactly one place today: the professional's
own « Modifier ma profession ou mes justificatifs » (`reopenFile`,
`src/app/(portail)/espace/professionnelle/actions.ts`), which moves the file `valide → brouillon`.
The founders' review (`src/lib/admin/review.ts`) never does: it decides only on `en_attente` and
`complement_demande` files (`refuseDecision` → `traite` otherwise), and an answer can only be
written by a `valide` profile, so a refused or complement-requested file never holds a waiting
answer. Suspension already withdraws her answers (`suspensionWithdrawsAnswers`, D-134) and needs
nothing here.

**The withdrawal.** When `reopenFile` moves her file out of `valide`, every one of her answers in
`en_attente` becomes `retiree` in the same database write, and only if that write actually moved
the status (a double click, or a status that changed since the page was read, withdraws nothing
twice and withdraws nothing on a no-op). It is the same state her own « retirer » and a suspension
produce: silent (no e-mail to the family, as D-73), she leaves the families' answer lists at once,
the request's edit lock and pending count drop her. `retenue`, `non_retenue` and already `retiree`
answers are untouched; confirmed bookings and their conversations are untouched. The helper lives
beside `suspensionWithdrawsAnswers` in `src/lib/reservations/answers.ts` (the module that owns
writes to `care_request_applications`); `reopenFile` calls it in one batch or one statement with
the status change.

**Coming back.** Once validated again she answers the request afresh through the existing path
(the upsert that re-opens a `retiree` answer), at her current rate, on the request's current night.
Nothing new to build.

**The dialog (D-147).** The reopen confirmation dialog (`professionnelle.reouverture.description`)
gains one sentence saying her waiting availabilities will be withdrawn, marked `@relecture`, in the
guide's register (vouvoiement, no `!`, `…` or `—`). Proposed wording:
« Vos disponibilités en attente de réponse seront retirées. » Build may adjust the wording within
those rules; `vitrine.test.ts` holds the mechanical part.

**The existing rows (D-148).** A one-off Drizzle data migration sets `retiree` (and `updated_at`)
on every `care_request_applications` row in `en_attente` whose profile is not `valide`, so a
profile that left `valide` before this fix carries no hidden answer either. It is idempotent and
touches no schema.

## Acceptance criteria

- [ ] A validated professional with one or more `en_attente` answers who confirms « Modifier ma profession ou mes justificatifs » ends with her profile in `brouillon` and every one of those answers `retiree`, written together (no state where one changed and not the other).
- [ ] Her `retenue`, `non_retenue` and already `retiree` answers, and her confirmed bookings, are unchanged by the reopening.
- [ ] Reopening a file that is not `valide`, or a second reopen after the first, withdraws nothing it had not already withdrawn and changes no other professional's answers.
- [ ] On a request she had answered, the family's answers list, pending-answer count and edit lock no longer count her after the reopening; the family can edit the night.
- [ ] After she is validated again, her old answer does not reappear on the request; answering again creates a waiting answer at her current rate.
- [ ] The reopen dialog tells her, before she confirms, that her waiting availabilities will be withdrawn; the sentence is marked `@relecture` and `vitrine.test.ts` passes.
- [ ] The data migration sets `retiree` on every `en_attente` answer of a non-`valide` profile and leaves every other row as it was; running it twice changes nothing more.
- [ ] A test covers the withdrawal on reopening (the helper's conditions: her answers only, `en_attente` only, only when the status moved).

## Out of scope

- The conversations of requests she answered once her profile is no longer `valide` (read and send access): the epic's second stub, `messagerie-profil-non-valide`.
- Any e-mail or notice to the family when her answer is withdrawn (withdrawals are silent, D-73).
- Changing the founders' review so it can move a `valide` file (it cannot today; if it ever can, that change carries the same withdrawal).
- Suspension and deletion paths, which already withdraw her answers (D-134).

## Open questions

- none

Context budget: read `src/lib/admin/review.ts`, `src/lib/admin/rules.ts`, parts of `src/lib/reservations/answers.ts`, `src/lib/professionnelle/rules.ts`, `src/app/(portail)/espace/professionnelle/actions.ts` and `src/lib/admin/accounts.ts` to establish the only trigger (D-146); the cahier des charges lives outside this repo (icm-board) and was not read.
