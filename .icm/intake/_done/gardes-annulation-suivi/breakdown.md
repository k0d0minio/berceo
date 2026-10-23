# Breakdown: Follow-ups from the cycle-de-garde-et-annulation review

## What was understood

The cycle-de-garde-et-annulation release review (2026-09-25) found three gaps sharing one
review pass, and two of them sharing the same file: a professional's cancellation whose Stripe
refund fails leaves no visible trace for the founders, so the D-2 promise (a professional's
cancellation refunds the fee in full) depends on someone reading Vercel logs; `hasNightEnded`,
`otherSide` and `gardeNotice` in `src/lib/gardes/` were copied from `messagerie/` and
`reservations/` instead of shared; and `care_requests` reads that AGENTS.md routes to
`src/lib/demandes/` (« the only reads and writes ») live directly in `src/lib/gardes/gardes.ts`
and `src/lib/reservations/bookings.ts`. Grouped because the dedup and the read-ownership stub
both rewrite `gardes.ts`'s read and helper surface — doing the dedup first means the
read-ownership stub moves code that has already settled into its final shape instead of code
about to be renamed again. The refund-visibility bug touches a different corner (`/admin/paiements`)
and has no code dependency on the other two; sequenced first only because it is the more urgent
find (a paid fee, P1).

## Build order

1. **gardes-refund-failure-unflagged** (tweak, P1) — flag a `payee` or `remboursement_echoue`
   fee whose booking was cancelled by the professional as awaiting a refund on
   `/admin/paiements`. No dependency on the other two; ships first as the most urgent find.
2. **gardes-shared-helpers** (chore, P2) — move `hasNightEnded`/`otherSide` into one home
   (`src/lib/demandes/rules.ts`), fold `gardeNotice` into `bookingNotice`, share one cron
   bearer check. No behaviour change; settles `gardes.ts`'s shape before the next stub touches
   it again.
3. **care-requests-read-ownership** (chore, P2) — depends on 2. Decide whether
   `src/lib/demandes/` owns every read of `care_requests` or only its writes, then move the
   reads in `gardes.ts` and `reservations/bookings.ts` behind `demandes/requests.ts` exports (or
   amend the AGENTS.md routing row), against the helper shape 2 already settled.

Depends-on lines route 3 through 2; 1 has no dependency on either and can build in any order.
