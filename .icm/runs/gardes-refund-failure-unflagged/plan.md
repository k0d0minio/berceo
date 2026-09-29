# Plan: gardes-refund-failure-unflagged

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The words** — `src/content/admin.ts` → `paiements`: `aRembourser` (the mark), its caption,
   `filtres.aRembourser`, `filtres.libelle` (« Filtrer les paiements »), `videARembourser`,
   `confirmation.descriptionARembourser`; `vueEnsemble`: the « {n} frais à rembourser » line.
   Every entry `@relecture Surya`. — done when: `src/content/vitrine.test.ts` passes.
2. **The rule** — `src/lib/paiements/rules.ts`: the filter value (`TO_REFUND = "a-rembourser"`)
   and a parser (`paymentsFilter(params)` → `"tous" | "recents" | "aRembourser"`), with its test
   in `rules.test.ts`. — done when: the new test passes.
3. **The read** — `src/lib/paiements/payments.ts`: one `awaitingRefund` SQL predicate (payment
   `REFUNDABLE` and an `exists` on `bookings` by `payments.booking_id` with `status = 'annulee'`,
   `cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'`); `readPayments` takes
   the filter (replacing its `since` argument or beside it) and selects `toRefund: boolean` per
   row from the same predicate; `awaitingRefundCount()` for the overview. — done when:
   typecheck is clean and the list, the flag and the count all call the one predicate (grep).
4. **The page and the table** — `admin/paiements/page.tsx`: three `FilterLinks` options, the
   `?statut` parameter, the filter's empty state; `payments-table.tsx`: the mark and caption on
   a flagged row, `toRefund` passed to `RefundButton`; `refund-button.tsx`: the variant
   description when flagged. — done when: the preview's `/admin/paiements` shows the three
   filters and a seeded flagged row as the spec says.
5. **The overview** — `admin/page.tsx`: `awaitingRefundCount()` in the `Promise.all`, the line
   and its link inside the « Paiements récents » block only when n > 0. — done when: the preview's
   `/admin` shows the line with a flagged fee and not without.
6. **Docs** — README → The service fee / The back-office gets one sentence on « À rembourser »
   at **Release**, not in Build.

## Risks

- `readPayments`' signature change breaks another caller: grep `readPayments(` before changing it
  (today only the page).
- The `exists` subquery on `bookings` is per row; 50 rows a page and a PK lookup, so no index is
  needed — if `EXPLAIN` on the preview branch shows a seq scan on `bookings`, say so, don't add
  a migration in this run.
- Wording: every new line is `@relecture`; nothing uses « remboursement garanti » or insurance
  vocabulary (D-8).
