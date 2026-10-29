# Breakdown: The cancellation table and the Berceo credits

- epic-slug: annulations-credits
- source: the devis of 27 August 2026 (house, `clients/berceo/quote/quote.md`, « Les crédits et annulations ») and the answers [9.1 to 9.3, 9.7] (`.icm/docs/berceo-answers.pdf`), taken into V1 by Jamie on 2026-10-29 after the UAT review

## What I understood

The devis sells the founders' cancellation table as they wrote it in the answers [9.2, 9.3]. A
family who cancels more than 24 hours before the start keeps her fee as a Berceo credit. A
family who cancels later loses it. A professional's cancellation, at any delay, turns the fee
into a credit. A professional's absence does the same. A family's absence keeps the fee at
Berceo. A cancellation by Berceo turns the fee into a credit. A dispute is a « litige » the
founders read by hand. Force majeure is their call. A credit pays a later fee and lasts 24
months. The 24-hour delay is a setting the founders change without a build. Every cancellation
keeps its date, its author, its selected reason and its state.

Today (cycle-de-garde-et-annulation, frais-de-service) either side cancels until the start
hour and reports an absence until 24 hours after the end. A professional's cancellation refunds
the fee at Stripe. A family's keeps it. An absence refunds nothing by itself, and the founders
refund from `/admin/paiements`. The vitrine and the FAQ say « remboursés ». No credit exists,
no delay, no selected reason, no « litige » state.

### Questions for Jamie

1. A professional's cancellation: a credit, as the table says, or a refund at Stripe, as today? Default: a credit. The table is the devis.
2. A credit smaller than the next fee: the credit pays its part and Stripe takes the rest, or the credit waits for a fee it covers? Default: the credit pays its part. The rest goes through the Checkout.
3. The selected reason: a short list per side, written to the guide, or free text? Default: a short list, no free text (D-20).
4. The « litige »: a state on the garde with the founders' note, read on `/admin/signalements`? Default: yes.

### Questions for the founders

1. The 24 hours count to the start hour of the night? Default: yes.
2. A credit that pays part of a fee is spent, and the balance stays? Default: yes.

## Build order

1. annulations-delai-et-motif — the 24-hour delay in the founders' settings, the selected reason on each cancellation — depends-on: none
2. credits-registre — the credit ledger: one row per credit with its amount, its origin and its expiry, and the family's balance in her space — depends-on: annulations-delai-et-motif
3. annulations-table — each line of the table writes a credit, keeps the fee or opens a litige, and the vitrine says so — depends-on: credits-registre
4. credits-au-paiement — a credit pays the next fee before the Checkout — depends-on: credits-registre
5. annulations-back-office — the founders read every cancellation, absence, litige and credit, and turn a fee into a credit by hand — depends-on: annulations-table

## Out of scope

- A refund of a subscription.
- A penalty on repeated absences (the answers [9.3]: none, by hand).
- A credit bought or offered (gift cards, the devis' exclusions).
- A change to the fee's amount or to the Checkout's payment methods.
