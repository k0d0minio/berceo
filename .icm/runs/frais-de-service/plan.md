# Plan: frais-de-service

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **The schema and its migration** — `src/db/schema.ts` (`payments`, `payment_status`, `refund_reason`, `admin_action` + `frais_rembourses`), `npm run db:generate -- --name frais_de_service`, `drizzle/**`; load `.icm/skills/database-migration/` — done when: one migration `0008_*` holds the table, both enums, the enum value, the checks (amount 300–900, `paid_at` by status, refund pair) and the partial unique index on `en_attente` per request, and `check-migrations.sh` is clean.
2. **The rules, pure** — `src/lib/paiements/rules.ts` + tests: the fee constant and `feeCents(rate)`, the effective status (an `en_attente` past `expires_at` reads `expiree`), which statuses a refund accepts, the euro formatting with cents (« 4,11 € ») — done when: unit tests cover 100/137/300 €, the expiry reading and the refund refusals.
3. **Stripe and the payments module** — `stripe` in `package.json`, `src/lib/paiements/stripe.ts` (server-only client, pinned API version, reads `STRIPE_SECRET_KEY`), `src/lib/paiements/payments.ts`: `startCheckout` (rules, expire the open one, insert `en_attente`, create the session: `card` + `bancontact`, `fr`, 30 min, metadata), `confirmPayment(sessionId)` (retrieve, verify paid + amount, conditional `en_attente → payee`, then `acceptAnswer` with the payment id, auto-refund on refusal/conflict), `expireCheckout`, `refundFee(paymentId, reason, by?)` (idempotency key per payment), the admin read (50 per page); `.env.example` gains the two keys — done when: every `payments` read and write and every Stripe call lives here, and unit tests cover the refund idempotency and the confirm race through the conditional update.
4. **The booking seam** — `src/lib/reservations/bookings.ts`: `acceptAnswer` takes the payment id and writes `payments.booking_id` in the same batch; `src/lib/reservations/notify.ts`: the refund e-mail (`src/content/emails.ts`, `src/lib/email/templates.ts`) — done when: the existing booking tests still hold and the booking and its payment link land in one transaction.
5. **The webhook** — `src/app/api/webhooks/stripe/route.ts`: raw body, `constructEvent` with `STRIPE_WEBHOOK_SECRET`, 400 on a bad signature; `checkout.session.completed` / `async_payment_succeeded` → `confirmPayment`, `expired` → `expiree`, `async_payment_failed` → `echouee`, `charge.refunded` → `remboursee`/`stripe` if unrecorded, `refund.failed` / `refund.updated` failed → `remboursement_echoue`; always 200 once verified and handled idempotently — done when: a test signs an event with `generateTestHeaderString` and a wrong signature is refused.
6. **The family's flow** — `acceptAnswerAction` becomes « start checkout, redirect to Stripe »; the return and cancel handlers under `src/app/(portail)/espace/famille/reservations/` (the four outcomes of spec §4, the abandon of §5); the request page's new messages; `accept-answer.tsx` gains the fee row, the guide's sentences, the Stripe line and the new button label; `src/content/paiement.ts` + its catalogue test — done when: on a preview with test keys, a test card and the Bancontact test flow each land on the booking page with `?confirmee=1`, and « Retour » lands on the request with the abandon message.
7. **The admin page** — `src/app/(portail)/admin/paiements/page.tsx` + action, a table and the refund dialog in `src/components/admin/`, the link on `src/app/(portail)/admin/page.tsx`, words in `src/content/admin.ts`; the refund writes the `frais_rembourses` journal entry — done when: an admin sees every row with section 8's fields, a non-admin gets 404, and a refund from the button shows `remboursee`/`berceo` and one journal line.
8. **Docs** — `README.md` (a « The service fee » section: the flow, the env keys, the webhook URL and its events, test vs live), `AGENTS.md` routing row for `src/lib/paiements/` — done when: the operator can register the webhook from the README alone.

## Risks

- The webhook and the return page racing: the conditional `en_attente → payee` update is the lock; the signal is a double confirmation e-mail or a unique-violation in the logs.
- Previews cannot receive Stripe's webhook (Vercel protection): the return page must book on its own; the signal is a preview payment stuck on « confirmation en cours ».
- `ALTER TYPE … ADD VALUE` for `frais_rembourses` cannot be used in the same transaction as it is added: keep the migration to DDL only.
- The Next route handler must read the raw body (`request.text()`) before anything parses it, or every signature fails.
- Stripe's `sessions.expire` on a session already completed errors: treat it as « paid, go confirm » rather than as a failure.
- The fee words touch the guide's rules (`vitrine.test.ts`-style checks forbid `…`, `—`, `!`); `demandes.ts` forbids `€`, so no fee word goes there.
