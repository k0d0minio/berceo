# Tasks: frais-de-service

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

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

## Queue

- [x] Schema and migration: `payments`, `payment_status`, `refund_reason`, `frais_rembourses` (0008, applied on run/frais-de-service)
- [x] Pure rules and their tests: `src/lib/paiements/rules.ts`, the words in `src/content/paiement.ts`
- [x] Stripe client, the payments module, the webhook's signature check: `src/lib/paiements/`, `.env.example`
- [x] The booking seam and the refund e-mail: `src/lib/reservations/bookings.ts`, `notify.ts`, `src/content/emails.ts`, `src/lib/email/templates.ts`
- [x] The webhook route: `src/app/api/webhooks/stripe/route.ts`
- [x] The family's flow: the action, the return and abandon routes, the request page's messages, the summary dialog
- [x] The admin page and its refund button: `src/app/(portail)/admin/paiements/`, `src/components/admin/`, `src/content/admin.ts`
- [x] Docs: README « The service fee », AGENTS.md routing row
