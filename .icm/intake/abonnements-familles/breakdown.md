# Breakdown: The four family subscriptions

- epic-slug: abonnements-familles
- source: the devis of 27 August 2026 (house, `clients/berceo/quote/quote.md`, « Les paiements ») and the answers [4.3, 9.4, 9.6, 9.7, 9.8]; the founders' feedback round 1 (Drive, `feedback-round-1.pdf`, 2026-10-23), sections « Page d'accueil » and « Tarif »

## What I understood

The devis sells four family subscriptions, auto-renewing, with no limit on requests: Découverte,
1 mois, 24,90 € · Parenthèse, 3 mois, 59,90 € · Sérénité, 6 mois, 94,90 € · Premium, 12 mois,
159,90 €. The full profile and the contact of a professional open with an active subscription.
Payment by Bancontact, cards, Apple Pay and Google Pay. A failed renewal: Stripe retries, an
e-mail, 7 days of grace, then the subscriber's features stop while confirmed bookings stand.
Invoices through Stripe. The first cut put subscriptions out (D-3) and the site says « sans
abonnement ». The founders' feedback asks for the subscriptions on the tariff page and in the
sign-up: without one, sign-up is not possible. Jamie decided on 2026-10-23 that the feedback
supersedes D-3 and that this epic ships with the Spec approved gate. The 3 % service fee stays
as it is. Stripe stays in Berceo's name, with a test key until the account exists.

Questions for Jamie, with a default each:

1. Do the four prices stand? Default: yes, the devis.
2. What does a family without an active subscription do? Default: she has an account and sees
   the teaser cards. She cannot publish a request and cannot open a full profile. Her space
   invites her to subscribe.
3. A free trial? Default: none.
4. Renewal payments: Bancontact cannot renew by itself. Default: Stripe Checkout in subscription
   mode, which takes Bancontact for the first payment and SEPA Direct Debit for the renewals, and
   cards, Apple Pay and Google Pay.
5. Where do the Stripe price ids live? Default: four environment variables `STRIPE_PRICE_*`,
   names in `.env.example`, values in Vercel.

## Build order

1. abonnements-catalogue-stripe — the four plans in Stripe, the subscription table, the Checkout and the webhook — depends-on: none
2. abonnements-inscription-famille — the sign-up proposes the four plans and ends on the Checkout — depends-on: abonnements-catalogue-stripe
3. abonnements-acces — what an active subscription opens, what its absence closes — depends-on: abonnements-catalogue-stripe
4. abonnements-espace-echec-paiement — the plan in the family's space, cancelling, a failed renewal and the grace period — depends-on: abonnements-catalogue-stripe
5. abonnements-back-office — the founders' list of subscriptions — depends-on: abonnements-catalogue-stripe

## Out of scope

- Professional subscriptions, gift cards, promo codes, the credit ledger (the devis' later items
  and exclusions).
- The words on `/tarifs`: `vitrine-retour-1/tarifs-abonnements`.
- VAT setup and Stripe Tax: Berceo's accountant, outside the build.
