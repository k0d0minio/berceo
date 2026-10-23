# Stub: The founders see every subscription and its state

- feature-slug: abonnements-back-office
- epic: abonnements-familles
- sequence: 5 of 5
- depends-on: abonnements-catalogue-stripe
- complexity: low
- priority: P2

## Problem

The founders cannot see who is subscribed, to what, and since when, without opening Stripe.

## Proposed change

`/admin/abonnements` lists every subscription, newest first, 50 per page: the family, the plan,
the status, the start, the renewal date, the grace period when there is one, and a link to the
subscription in Stripe. « Vue d'ensemble » gets the count of active subscriptions. The account
page of a family in the back-office shows her subscription line.

## Acceptance criteria

- [ ] `/admin/abonnements` lists the subscriptions with the columns above and pages by 50.
- [ ] « Vue d'ensemble » shows the number of active subscriptions, linked to the list.
- [ ] A family's account page in the back-office shows her plan and status.
- [ ] The page is in the back-office navigation and goes through `AdminShell` (D-132).

## Out of scope

- Editing a subscription from the back-office. Stripe does that.

## Notes

- Files: `src/app/(portail)/admin/abonnements/`, `src/lib/admin/lists.ts`,
  `src/components/admin/admin-shell.tsx`, `src/content/admin.ts`.
