# Build notes: frais-de-service

- commits: 539a2d3 (schema + migration 0008), f581482 (rules, Stripe, payments, webhook, booking seam, refund e-mail), ddcc3ff (the family's flow), f6196bd (/admin/paiements), 7a0ce2f (docs)
- ci: GREEN on c1e2ede (full gate: Vercel preview pass; Quality (advisory) pass — lint, typecheck, tests)

## What changed

- `src/db/schema.ts`, `drizzle/0008_frais_de_service.sql`: `payments` (links SET NULL, D-96), `payment_status`, `refund_reason`, `admin_action` + `frais_rembourses`; checks on the amount (300 to 900), the currency, `paid_at` by status, the refund pair; the partial unique index « one `en_attente` per request ». Applied and verified (`db:verify`) on the run's Neon branch `run/frais-de-service`.
- `src/lib/paiements/`: `rules.ts` (the amount, the expiry reading, refundability, the refund key, the webhook's refund sync), `stripe.ts` (the lazy client, API `2026-08-26.dahlia`), `signature.ts` (the webhook's check, pure), `payments.ts` (`startCheckout`, `confirmPayment`, `markSession`, `abandonCheckout`, `refundFee`, `syncRefund`, `readPayments`), `notify.ts` (the refund e-mail), `format.ts`, `paths.ts`.
- `src/lib/reservations/bookings.ts`: `acceptCheck` split out of `acceptAnswer` (the Checkout reads the same rules); `acceptAnswer` now takes the payment's id, its first statement requires that payment `payee` for this very answer, and a sixth statement links the payment to the booking, in the same transaction.
- `src/app/api/webhooks/stripe/route.ts`: signature on the raw body (400 otherwise), then the seven events; 500 on our failure so Stripe retries.
- `src/app/(portail)/espace/famille/`: `acceptAnswerAction` opens the Checkout and redirects to Stripe; `reservations/paiement/` (return: confirm, then the booking or a message) and `reservations/paiement/abandon/` (« Retour »); the request page's four `?paiement=` messages; the summary's fee row, the guide's two sentences and the Stripe line (`accept-answer.tsx`).
- `src/app/(portail)/admin/paiements/`, `src/components/admin/payments-table.tsx`, `refund-button.tsx`; `ReasonDialog` exported from `decision-panel.tsx` with optional labels; the admin home links the page.
- Words: `src/content/paiement.ts` (new), `admin.ts` (the page, the journal action), `emails.ts` (the refund e-mail); `reservations.recapitulatif.confirmer` removed (replaced by `paiement.recapitulatif.confirmer`).
- `.env.example`: `STRIPE_SECRET_KEY` [production,preview,development], `STRIPE_WEBHOOK_SECRET` [production,preview]. `README.md` « The service fee », `AGENTS.md` routing row.
- `package.json`: `stripe` ^22.6.2.

## Acceptance criteria status

- [x] The fee row shows 3 % of the answer's stored rate, « 4,11 € » for 137 €, with the guide's two sentences and the Stripe line; computed on the server (`feeLine`, `feeCents`). Unit-tested; the dialog is for the smoke.
- [x] Confirming opens a French Checkout for exactly that amount, card and Bancontact only; nothing about the request or answers changes before the payment. Code-read; proven only on a preview with test keys.
- [x] A paid Checkout books once whichever path comes first: the conditional `en_attente → payee` update is the lock, and `acceptAnswer` requires the paid row (probe on the run's branch: an unpaid payment does not book, a paid one books and links, a second call books nothing). E-mails leave from the winner only.
- [x] « Retour », expiry and an async failure leave the request open, the answers waiting, the row `expiree` or `echouee`.
- [x] A second Checkout expires the first; the partial unique index refuses a second `en_attente` (probe: 23505).
- [x] A payment that can no longer book is refunded in full, `reservation_impossible`, with the return page's message and the refund e-mail.
- [x] The webhook refuses a missing, foreign, altered or stale signature (unit tests on `verifiedEvent`); every handler is idempotent, so a replay changes nothing.
- [x] `refundFee` refunds a `payee` (or failed-refund) row once: one idempotency key per payment and attempt, a conditional update; refuses other statuses (unit tests on the rules).
- [x] `/admin/paiements` « Rembourser les frais »: reason required (client and server), confirmation dialog, `remboursee`/`berceo`, one `frais_rembourses` journal line.
- [x] A dashboard refund reads `remboursee`/`stripe`; a failed refund `remboursement_echoue` (via `refund.*` events, D-95).
- [x] `/admin/paiements` lists every payment newest first, 50 per page, section 8's fields; 404 to non-admins through `requireAccess`.
- [x] Both keys read from the environment only, declared in `.env.example`; `security-check.sh` OK before every code commit.
- [x] One forward migration; its checks refuse 200 cents and a second `en_attente` (probe: 23514, 23505).
- [x] Words in `src/content/`, catalogue tests for `paiement.ts`, the admin statuses and reasons, the refund e-mail; unit tests for the amount, the expiry reading, the refund rules, the signature.

The PR body's boxes are left for the operator (Learned rules: a session never ticks them).

## Notes for Release

- **Decision ids collided with the sibling run messagerie** (branch `claude/tender-albattani-vje2w4`): both runs used D-87 to D-91. Messagerie merged first (#44); this run renumbered its five at Release: D-87 → D-99, D-88 → D-100, D-89 → D-101, D-90 → D-102, D-91 → D-103. Whichever merges second renumbers its own ids in its spec, decisions, notes and code comments (this run's Build ids start at D-95 and are clear of both).
- **Both runs also add a migration numbered 0008** (`0008_frais_de_service`, `0008_messagerie`): the one that merges second regenerates its migration on the merged tree (`npm run db:generate`, never a hand-edited `idx`), and resets its preview branch per Learned rules.
- **env.sh audit --changed → GAPS 2**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are declared but not yet set in Vercel. The values are the operator's (D-100): a Stripe test account for Preview/Development; Production stays empty until the company's live account exists. Until the Preview key exists, « Confirmer et régler les frais de service » shows the generic payment error on previews and UAT, so the smoke of the payment itself waits on it.
- Stripe's dashboard, per account: enable **Bancontact**, register the webhook endpoint and its seven events (README « The service fee »); a Checkout asking for `bancontact` on an account without it fails at creation.
- Review closely: `confirmPayment` (the claim, the refund on refusal, the put-back on a throw), `acceptAnswer`'s new first-statement condition, `refundFee`'s key and its race with the webhook (D-95).
- Spec deviations recorded as Build decisions: D-95 (refund events), D-97 (row after session).
- The migration adds an enum value (`frais_rembourses`) and uses it nowhere in the same migration (Learned rules).
