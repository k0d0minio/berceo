# Spec: Flag a professional's cancellation whose refund failed

- slug: gardes-refund-failure-unflagged
- personas: admin
- touches: src/lib/paiements/payments.ts, src/lib/paiements/rules.ts, src/lib/paiements/rules.test.ts, src/components/admin/payments-table.tsx, src/components/admin/refund-button.tsx, src/app/(portail)/admin/paiements/page.tsx, src/app/(portail)/admin/page.tsx, src/content/admin.ts
- complexity: standard

## Problem

When a professional cancels a confirmed garde, `refundOnCancellation` in `src/lib/gardes/gardes.ts`
asks Stripe to refund the family's 3 % fee after the cancellation commits (D-2: a professional's
cancellation refunds the fee in full). If Stripe throws, the fee stays `payee`; if Stripe answers
with a failed refund, it becomes `remboursement_echoue`. Either way only a server log records it,
and on `/admin/paiements` a `payee` row owed back to a family reads exactly like any other paid
fee. The family's page says « Remboursement des frais de service en cours. » indefinitely. The D-2
promise therefore depends on someone reading Vercel logs. This closes a gap in the
cycle-de-garde-et-annulation release (found at its review, 2026-09-25) for Plateforme Berceo V1:
the founders' back office (D-93, D-101) must show every fee Berceo still owes.

## Proposed change

**One condition, « à rembourser ».** A fee is *à rembourser* when its status is `payee` or
`remboursement_echoue` (`REFUNDABLE`) **and** its booking (`payments.booking_id`) is `annulee`
with `cancelled_by = 'professionnelle'` and `cancellation_kind = 'annulation'`. An absence
(`cancellation_kind = 'absence'`) is not flagged: the founders decide those (D-101, D-106), and
`/admin/absences` already lists them. A family's cancellation is not flagged: its fee stays
Berceo's (D-2). The condition is written once in `src/lib/paiements/payments.ts` (the only reader
of `payments`), as a SQL predicate that joins `bookings`, and every reader below uses that one
predicate, so the row mark, the filter and the overview count cannot disagree (the D-133 rule).
No new table, column or migration: the booking already carries the facts.

**On `/admin/paiements`, the row.** `readPayments` returns, per row, whether it is à rembourser.
A flagged row's « Statut » cell keeps its status word (« Payés » or « Remboursement échoué ») and
adds, in semibold, « À rembourser » and a caption line « Garde annulée par la professionnelle,
frais dus en entier. » (`@relecture`). The « Rembourser les frais » button stays as it is on every
refundable row (D-101).

**On `/admin/paiements`, the filter.** A third filter link « À rembourser » beside « Tous les
paiements » and « Payés ces 7 derniers jours », mutually exclusive with them, on its own query
parameter value (`?statut=a-rembourser`; the page ignores any other value). It lists only
flagged fees, newest first, 50 per page, with the same pager. Its empty state reads « Aucun frais
à rembourser. » (`@relecture`). The filter's navigation label, today `colonnes.date`, becomes a
neutral « Filtrer les paiements » (`@relecture`), since the filters are no longer all about
the date.

**The refund dialog on a flagged row.** Its description replaces today's text (which says « La
garde n'est pas annulée. », wrong on a garde already cancelled) with a variant: « La
professionnelle a annulé cette garde. Les frais de service de {montant} sont dus en entier à la
famille. Le motif sera inscrit au journal. » (`@relecture`). Other rows keep today's text. The
refund itself is unchanged: `refundPaymentAction` still records reason `berceo` (« remboursés par
Berceo ») and the founder's motif in the journal (operator's choice at Define; see Decisions).

**On « Vue d'ensemble » (`/admin`).** The « Paiements récents » block keeps its number, precision
and link, and gains one line, shown only when at least one fee is à rembourser: « {n} frais à
rembourser » (`@relecture`), a link to `/admin/paiements?statut=a-rembourser`, counted with the
same predicate. With none, the block is exactly as today.

## Acceptance criteria

- [ ] On `/admin/paiements`, a `payee` fee whose booking is `annulee`, `cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'` shows « Payés », then « À rembourser » and the caption line, and the « Rembourser les frais » button.
- [ ] The same booking with its fee at `remboursement_echoue` shows « Remboursement échoué » with the same « À rembourser » mark and caption.
- [ ] A fee whose booking was cancelled by the family, or cancelled as an absence (either side), or is still `confirmee`, carries no « À rembourser » mark; a `remboursee` fee on a professional's cancellation carries none either.
- [ ] `/admin/paiements?statut=a-rembourser` lists exactly the flagged fees, newest first, paginated at 50; with none it shows « Aucun frais à rembourser. »; the « À rembourser » link is marked current there and the other two are not.
- [ ] Refunding a flagged fee from its dialog shows the variant description (no « La garde n'est pas annulée. »), records `remboursee` with reason `berceo` and the journal line as today, and the row then leaves the filter and loses its mark.
- [ ] On `/admin`, with at least one flagged fee, the « Paiements récents » block shows « {n} frais à rembourser » linking to the filter, where n equals the filter's row count; with none, the line is absent.
- [ ] Every new or changed word lives in `src/content/admin.ts` with `@relecture`, and `src/content/vitrine.test.ts` passes (no `!`, `…` or `—`).
- [ ] A unit test covers the filter parameter's parsing (only `a-rembourser` selects the filter) in `src/lib/paiements/rules.test.ts`.

## Out of scope

- Retrying the refund automatically (a cron or a webhook retry): the founders' button (D-101) is the retry.
- Changing the reason a back-office refund records: it stays `berceo`, by the operator's choice at Define.
- The family's line « Remboursement des frais de service en cours. » and its e-mail: they stay true until the founders refund.
- An e-mail or Slack alert to the founders on a failed refund.
- Flagging absences for a refund decision: `/admin/absences` already lists them (D-106).
- The other two stubs of this epic (`gardes-shared-helpers`, `care-requests-read-ownership`).

## Open questions

- none
