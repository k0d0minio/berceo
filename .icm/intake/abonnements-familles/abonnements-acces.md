# Stub: A subscribed family publishes requests and opens full profiles

- feature-slug: abonnements-acces
- epic: abonnements-familles
- sequence: 3 of 5
- depends-on: abonnements-catalogue-stripe
- complexity: medium
- priority: P0

## Problem

Every family account can publish a request and open a professional's full profile. The devis
puts the full profile and the contact behind an active subscription, and the founders' feedback
makes the subscription the condition of sign-up.

## Proposed change

An active subscription, or a subscription in its grace period, opens: publishing a request,
answering an answer, opening a professional's full profile, the conversation and the contact
after a booking. Without it, the family sees the teaser cards, her past gardes and her
conversations in read-only, and each closed action shows one line that invites her to subscribe.
A confirmed booking is never cut: the garde, its conversation and its rating stay open until the
night is over.

## Acceptance criteria

- [ ] A family without a subscription cannot publish a request, open a full profile or book, and each closed action shows the invitation line.
- [ ] A family in her grace period can do everything a subscribed family can.
- [ ] A family whose subscription ended keeps her confirmed gardes, their conversations and their ratings.
- [ ] The professionals' side is unchanged.
- [ ] `src/lib/abonnements/rules.test.ts` covers each gate.

## Out of scope

- A limit on requests. The devis sets none.
- The professionals' subscription.

## Notes

- Question, with a default: does the search page stay open to a family without a subscription?
  Default: yes, with the teaser cards, since the public pages show them already.
- The gate is one function in `src/lib/abonnements/`, read by the server actions and the pages.
  No page decides on its own.
- Files: `src/lib/abonnements/`, `src/app/(portail)/espace/famille/`,
  `src/lib/demandes/requests.ts`, `src/lib/reservations/`, `src/lib/messagerie/`,
  `src/content/abonnements.ts`.
