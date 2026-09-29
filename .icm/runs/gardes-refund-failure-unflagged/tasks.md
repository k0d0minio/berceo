# Tasks: gardes-refund-failure-unflagged

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] On `/admin/paiements`, a `payee` fee whose booking is `annulee`, `cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'` shows « Payés », then « À rembourser » and the caption line, and the « Rembourser les frais » button.
- [ ] The same booking with its fee at `remboursement_echoue` shows « Remboursement échoué » with the same « À rembourser » mark and caption.
- [ ] A fee whose booking was cancelled by the family, or cancelled as an absence (either side), or is still `confirmee`, carries no « À rembourser » mark; a `remboursee` fee on a professional's cancellation carries none either.
- [ ] `/admin/paiements?statut=a-rembourser` lists exactly the flagged fees, newest first, paginated at 50; with none it shows « Aucun frais à rembourser. »; the « À rembourser » link is marked current there and the other two are not.
- [ ] Refunding a flagged fee from its dialog shows the variant description (no « La garde n'est pas annulée. »), records `remboursee` with reason `berceo` and the journal line as today, and the row then leaves the filter and loses its mark.
- [ ] On `/admin`, with at least one flagged fee, the « Paiements récents » block shows « {n} frais à rembourser » linking to the filter, where n equals the filter's row count; with none, the line is absent.
- [ ] Every new or changed word lives in `src/content/admin.ts` with `@relecture`, and `src/content/vitrine.test.ts` passes (no `!`, `…` or `—`).
- [ ] A unit test covers the filter parameter's parsing (only `a-rembourser` selects the filter) in `src/lib/paiements/rules.test.ts`.

## Queue

- [x] The words — `src/content/admin.ts` (mark, caption, filter, empty state, dialog variant, overview line)
- [x] The rule — `TO_REFUND` + `isToRefundFilter` in `src/lib/paiements/rules.ts`, test in `rules.test.ts`
- [x] The read — `awaitingRefund` predicate, `awaitingRefundCount`, `readPayments(page, view)` with `toRefund` per row
- [x] The page, the table, the dialog — `admin/paiements/page.tsx`, `payments-table.tsx`, `refund-button.tsx`
- [x] The overview — `admin/page.tsx` line when n > 0
- [ ] Flip ready, settle the full gate, smoke on the preview (operator)
