# Spec: The 3 % service fee through Stripe

- slug: frais-de-service
- personas: parent, admin
- touches: src/db/schema.ts, drizzle/**, src/lib/paiements/**, src/lib/reservations/bookings.ts, src/lib/reservations/notify.ts, src/app/api/webhooks/stripe/**, src/app/(portail)/espace/famille/demandes/actions.ts, src/app/(portail)/espace/famille/demandes/[id]/page.tsx, src/app/(portail)/espace/famille/professionnelles/[id]/page.tsx, src/app/(portail)/espace/famille/reservations/**, src/app/(portail)/admin/paiements/**, src/app/(portail)/admin/page.tsx, src/components/reservations/accept-answer.tsx, src/components/admin/**, src/content/paiement.ts, src/content/admin.ts, src/content/emails.ts, src/lib/email/templates.ts, package.json, package-lock.json, .env.example, README.md, AGENTS.md
- complexity: complex

## Problem

Berceo's only revenue in V1 is the service fee (D-2): 3 % of the night rate, charged when the
family confirms a booking. Today « Accepter et réserver » books the answer on the click
(candidature-et-reservation), with no payment at all, so the platform that is due on
uat.berceo.be before December earns nothing, and the refund rule D-2 promises on the Tarifs page
and in the FAQ has nothing to refund. This run puts the payment between the family's click and
the booking, keeps a record of every fee the founders can read, and gives cycle-de-garde-et-
annulation (stub 11) the refund it will call when a professional cancels. It advances the
Plateforme Berceo V1 objective: a first usable version on uat.berceo.be before December 2026, for
a launch in January 2027. Cahier des charges I-02 (the commission), I-04 (the refund, fee only,
on the professional's cancellation), H-04 (the admin reads the payments); I-01, I-03, I-05 and
B-04 are annotated NON and stay out (D-1).

## Proposed change

**The words.** Every visible word lives in `src/content/` (D-19): the fee, the checkout and the
return messages in a new `src/content/paiement.ts`, the admin page in `src/content/admin.ts`, the
e-mail in `src/content/emails.ts`, keyed by locale. The fee sentences are quoted from the guide's
Tarifs text already on the site (`src/content/tarifs.ts`); every other entry carries
`@relecture Surya`. Vouvoiement, no `!`, `…` or `—`, no insurance wording (D-8), no price but
the 100 to 300 € rate and the 3 % (D-3, D-4), amounts written the French way with the € after
the number and a comma for the cents (« 4,11 € »). The catalogue tests cover the new file.

### 1. The amount (D-2, D-87)

- The fee is **3 % of the rate the chosen answer carries** (its `night_rate_eur`, frozen when the
  professional answered, D-74), computed in cents as `rate × 3`: exact, never rounded, from
  3,00 € (100 €) to 9,00 € (300 €). Stripe's minimum charge in euros is 0,50 €, so no floor.
- The 3 % is **all-in**: the family pays exactly that, VAT included. Stripe Tax is off. How the
  VAT inside it is booked is the founders' accountant's, outside the platform.
- One constant holds the percentage; the amount is computed on the server only, never taken from
  the browser.

### 2. The summary before paying

« Récapitulatif de votre garde » (the dialog `accept-answer.tsx` opens) gains:

- a row « Frais de service (3 %) » with the amount (« 4,11 € »), after « Tarif de la garde »;
- under the existing line « Vous réglez la garde directement à la professionnelle. » (D-1), the
  guide's two sentences: « Des frais de service de 3 % sont prélevés à la confirmation de chaque
  réservation. » and « Si la professionnelle annule la garde, ces frais vous sont intégralement
  remboursés. Si vous annulez, ils ne sont pas remboursés. »;
- a line saying the fee is paid on Stripe's secure page, by Bancontact or card (`@relecture`);
- the green confirmation button reads « Confirmer et régler les frais de service »
  (`@relecture`); going back stays red « Revenir aux réponses » (D-24).

The Tarifs page and the FAQ already carry the guide's fee sentences; they are not changed.

### 3. Paying (D-90, D-92)

Confirming no longer books. The server:

1. reads the rules again exactly as today (`acceptRefusal`: the answer still waits, the
   professional is still validated, the request is hers, open and ahead, her address is filled);
   a refusal shows today's message and nothing is sent to Stripe;
2. closes any checkout still open for that request (whichever answer it was for): it is expired
   at Stripe and its row becomes `expiree`. **One open checkout per request**, held by a partial
   unique index;
3. records a payment row `en_attente` (the request, the answer, the family, the rate, the amount,
   the moment it expires), then opens a **Stripe Checkout** session in `payment` mode, locale
   `fr`, with `card` and `bancontact` as the only methods (wallets appear under card), one line
   « Frais de service Berceo » described by the night (« Garde de nuit du 12 octobre 2026 »,
   `@relecture`), the family's e-mail prefilled, no Stripe customer created, the payment row's id
   as `client_reference_id` and in the metadata, and an expiry of **30 minutes** (Stripe's
   minimum);
4. redirects the family to Stripe.

Nothing about the request, the answers or the professional changes while the family is on Stripe:
the request stays `ouverte`, the answers stay `en_attente`, nobody is told anything.

### 4. The booking is made by the payment (D-90, D-91)

A booking is made only once Stripe reports the session paid. One idempotent function,
`confirmPayment(sessionId)` in `src/lib/paiements/`, does it, and two paths call it:

- **the webhook** `POST /api/webhooks/stripe`, its signature verified with the endpoint's secret
  on the raw body (an unsigned or wrongly signed call answers 400 and touches nothing), on
  `checkout.session.completed` and `checkout.session.async_payment_succeeded`;
- **the return page** Stripe sends the family back to (`success_url`, under
  `/espace/famille/reservations/`), which reads the session **from Stripe's API** by its id,
  never from the URL alone, so the family lands on her booking without waiting for the webhook,
  and previews (which Stripe's webhook cannot reach) still book.

`confirmPayment` checks the session is `paid`, its amount and currency match the row, then moves
the row `en_attente → payee` with one conditional update: only the caller that wins it goes on,
the other reads the result. The winner runs today's `acceptAnswer` (same five statements, same
races) with the payment's id; the booking and the payment's `booking_id` are written in the same
transaction. Then, exactly as today, the confirmation e-mails and the « non retenue » e-mails
leave (D-76), once, from the winner only.

**When the booking can no longer be made** (another booking won the request, she was booked
elsewhere that night, she withdrew, the family cancelled the request, the professional was
suspended, the night started while the family was paying), the fee is **refunded in full at
once** (reason `reservation_impossible`), the request is left as it is, and the family is told:
the return page says the booking could not be confirmed and the fee is refunded (`@relecture`),
and an e-mail says the same, since she may have closed the tab.

The return page, by outcome:

- booked → the booking page with today's `?confirmee=1` message;
- paid but the other path is still booking → the request page with « Votre paiement est reçu, la
  confirmation de votre garde est en cours. » (`@relecture`) and a link to refresh;
- refunded → the request page with the refund message above;
- not paid → the request page with the abandon message below.

### 5. Abandoning (D-92)

- **« Retour »** on Stripe (`cancel_url`) brings the family back to the request page with « Le
  paiement n'a pas abouti. Votre demande reste ouverte. » (`@relecture`); the session is expired
  at Stripe and the row becomes `expiree`.
- Closing the tab: Stripe expires the session after 30 minutes and `checkout.session.expired`
  marks the row `expiree`. Where the webhook never comes (previews), a row `en_attente` past its
  `expires_at` is **read** as expired by every rule; no cron.
- `checkout.session.async_payment_failed` marks the row `echouee`.

An abandoned or failed checkout leaves the request open, the answers waiting and no booking; the
family can choose again, the same answer or another.

### 6. Refunds (D-89, D-94)

- **One entry point**, `refundFee(paymentId, reason, by?)` in `src/lib/paiements/`: the full
  fee, never part of it, only on a `payee` row, with a Stripe idempotency key built from the
  payment's id so two calls make one refund. It records the Stripe refund id, the moment, the
  reason and the status. It never touches the booking: cancelling it is stub 11's.
- Reasons: `annulation_professionnelle` (stub 11 calls it; this run only exports it and tests
  it), `reservation_impossible` (section 4), `berceo` (the founders' button), `stripe` (made in
  Stripe's dashboard).
- **The founders' button.** On `/admin/paiements`, a `payee` row offers « Rembourser les frais »
  (`@relecture`); it opens a confirmation dialog (green to confirm, red to go back, D-24) with a
  mandatory reason; confirming refunds and writes one admin-journal entry, action
  `frais_rembourses` (new value), the family as the subject, the reason and the amount as the
  detail. The journal stays append-only (D-54).
- **A refund made in Stripe's dashboard** reaches the record through `charge.refunded`: the row
  becomes `remboursee`, reason `stripe`, if the app did not already record it.
- **A refund Stripe fails** (`refund.failed`, or `refund.updated` to `failed`) sets the row to
  `remboursement_echoue` and logs an error; the founders see it on `/admin/paiements` and can try
  the button again.

### 7. The payments record (D-93)

A new table `payments`, one row per checkout opened:

- the request, the answer, the family (foreign keys) and, once made, the booking (unique);
- the rate it was computed from, the amount in cents, the currency (`eur`);
- a status: `en_attente`, `payee`, `expiree`, `echouee`, `remboursee`, `remboursement_echoue`;
- the Stripe Checkout session id (unique), the PaymentIntent id, the refund id;
- `expires_at`, `paid_at`, `refunded_at`, the refund reason (an enum), timestamps.

Checks: the amount between 300 and 900 cents; `paid_at` set whenever the status is `payee`,
`remboursee` or `remboursement_echoue`; `refunded_at` and the reason set together; one
`en_attente` row per request (partial unique index). One migration adds the table, its two enums
and the admin-journal value.

`src/lib/paiements/` holds the only reads and writes of `payments` and the only calls to Stripe;
the Stripe client is created once on the server (`server-only`), from `STRIPE_SECRET_KEY`, with
the API version pinned.

### 8. What the admin reads (D-93)

`/admin/paiements` (404 to anyone but an admin, D-33; noindex), linked from the admin home: every
payment, newest first, 50 per page like the journal. Per row: the date, the family's name, the
professional's first name, the night, the rate, the fee, the status, the Stripe PaymentIntent id,
and for a refund its date and reason. A booking-less `en_attente` or `expiree` row is shown too,
so an abandoned checkout is visible. The families and the professionals see no payment history
and no receipt (I-05 NON).

### 9. Configuration (D-88)

- Two new variables, named in `.env.example` with their targets, values never in git:
  `STRIPE_SECRET_KEY` (`[production,preview,development]`) and `STRIPE_WEBHOOK_SECRET`
  (`[production,preview]`).
- **Test mode on UAT and previews, live mode on Production only.** No Stripe account exists yet:
  the operator opens one in test mode for UAT and previews; Production receives live keys once the
  company's account exists and is verified. Until then Production has no keys and « Confirmer et
  régler les frais de service » fails with the generic error: Production is not open to families
  before the launch.
- The webhook endpoints (UAT, Production) and their four event groups are registered by the
  operator in Stripe's dashboard; the README says which.

## Acceptance criteria

- [ ] On the summary, the fee row shows 3 % of the chosen answer's rate in euros with the cents and the € after the number (137 € → « 4,11 € »), with the guide's two fee sentences and the Stripe line; the amount is computed on the server, from the answer's stored rate.
- [ ] Confirming the summary opens a Stripe Checkout page in French for exactly that amount, offering Bancontact and card only; the request stays `ouverte` and its answers `en_attente` until Stripe reports the payment.
- [ ] A paid checkout makes the booking exactly once, whether the webhook, the return page or both arrive, in either order; the confirmation and « non retenue » e-mails leave once.
- [ ] A checkout abandoned with « Retour », left to expire, or failed leaves the request open, the answers waiting, no booking, and a payment row `expiree` or `echouee`; the family can choose again.
- [ ] Starting a second checkout for the same request expires the first; there is never more than one `en_attente` row per request.
- [ ] A payment whose booking can no longer be made (the request already booked, the professional booked that night, the answer withdrawn, the request cancelled, the night started) is refunded in full automatically, the row reads `remboursee` with reason `reservation_impossible`, and the family sees and receives the refund message.
- [ ] The webhook refuses a call without a valid Stripe signature (400) and changes nothing; a replayed event changes nothing.
- [ ] `refundFee` refunds the full fee of a `payee` payment once, however many times it is called, and records the refund id, date and reason; it refuses any other status.
- [ ] An admin can refund a paid fee from `/admin/paiements` with a mandatory reason, through a confirmation dialog; the row becomes `remboursee` (reason `berceo`) and the admin journal gains one `frais_rembourses` entry.
- [ ] A refund made in Stripe's dashboard shows on the record as `remboursee`, reason `stripe`; a failed refund shows as `remboursement_echoue`.
- [ ] `/admin/paiements` lists every payment newest first, 50 per page, with the fields of section 8, and answers 404 to anyone but an admin.
- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are read from the environment only and named in `.env.example` with their targets; no key or secret is in git; `security-check.sh` is clean before every push.
- [ ] One forward migration adds `payments`, its enums and the `frais_rembourses` journal action; its checks refuse an amount outside 300 to 900 cents and a second `en_attente` row for one request.
- [ ] Every new word is in `src/content/`, follows the guide's rules and passes the catalogue tests; the unit tests cover the amount, the expired-by-time reading, the refund rules and the webhook's signature check.

## Out of scope

- Any payment for the night itself, transfers to professionals, Stripe Connect (D-1; I-01, I-03, B-04 NON).
- Subscriptions, gift cards, promo codes (D-3).
- Cancelling a booking by either side and the professional's-cancellation refund being triggered: stub 11 (cycle-de-garde-et-annulation) calls `refundFee` with `annulation_professionnelle`.
- Receipts, invoices and a payment history for families or professionals (I-05 NON); Stripe's own receipt e-mails are a dashboard setting, the operator's.
- Stripe Tax and a VAT line (D-87); the VAT bookkeeping is the accountant's.
- Partial refunds.
- The fee amount in the confirmation e-mails.
- The back office's wider views (overview, search, suspension): stub 14 (back-office-admin), which builds on `/admin/paiements`.
- Opening the Stripe account, its verification, the live keys, the webhook registration, the statement descriptor: the operator's, in Stripe's dashboard and Vercel.
- Scope decisions this run neither builds nor changes: D-5, D-6, D-7, D-9 (the DA, already in the components), D-10, D-11, D-12, D-13, D-14, D-15 (the address still reveals at the booking, now made by the payment), D-16, D-17 (disputes go to the founders' e-mail; the admin button of D-89 is how they refund one), D-18, D-20, D-21, D-22, D-23, D-25, D-26, D-27.

## Open questions

- none
