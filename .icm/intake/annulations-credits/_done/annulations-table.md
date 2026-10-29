# Stub: A cancellation or an absence follows the founders' table

- feature-slug: annulations-table
- epic: annulations-credits
- sequence: 3 of 5
- depends-on: credits-registre
- complexity: high
- priority: P1

## Problem

Today a professional's cancellation refunds the fee at Stripe, a family's keeps it, and an
absence refunds nothing by itself. The founders' table (the answers [9.2, 9.3]) says
otherwise: a credit in six lines, the fee kept in two, a litige in one.

## Proposed change

One rule, `outcomeOf(cancellation, delay, now)`, in `src/lib/gardes/rules.ts`, returns the
line of the table that applies. Its result is written in the statement that cancels or reports:

- The family cancels more than the delay before the start: a credit of the fee.
- The family cancels within the delay: the fee stays at Berceo.
- The professional cancels, at any delay: a credit of the fee.
- The professional is reported absent: a credit of the fee.
- The family is reported absent, or the garde could not start at her home: the fee stays.
- Both sides report the other absent: the garde enters « litige », no credit, the founders decide.
- Berceo cancels (a suspension, D-134): a credit of the fee.

The garde's page of each side says what happened to the fee. The vitrine's fee paragraph and the
FAQ's cancellation answer say « crédit Berceo » where they say « remboursés ». The refund at
Stripe leaves the automatic path and stays the founders' button.

## Acceptance criteria

- [ ] Each line of the table above has a test in `rules.test.ts`, with the delay from the settings.
- [ ] A family's cancellation before the delay writes one credit of the fee's amount, in the statement that cancels.
- [ ] A professional's cancellation writes one credit and refunds nothing at Stripe.
- [ ] A professional reported absent writes one credit. A family reported absent writes none.
- [ ] Two opposite absence reports put the garde in « litige », shown on `/admin/signalements`.
- [ ] The garde's page of each side names the credit, the fee kept, or the litige.
- [ ] `/tarifs` and the FAQ name the credit, and `src/content/vitrine.test.ts` passes.

## Out of scope

- Spending the credit (`credits-au-paiement`).
- The founders' manual credit and the lists (`annulations-back-office`).
- A penalty on repeated absences.

## Notes

- Questions, with a default each: the breakdown's questions 1 and 4.
- A garde booked before the fee existed has no payment: the rule returns « nothing to do ».
- Files: `src/lib/gardes/rules.ts`, `src/lib/gardes/gardes.ts`, `src/lib/credits/`,
  `src/lib/paiements/payments.ts` (the automatic refund leaves), `src/components/gardes/`,
  `src/content/gardes.ts`, `src/content/tarifs.ts`, `src/content/faq.ts`, `src/content/vitrine.test.ts`.
