# Handoff: frais-de-service

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` (or the Spec block of https://github.com/k0d0minio/berceo/pull/45); a change goes through `revise frais-de-service "<what>"`.
2. Once **Spec approved** is ticked on the PR: `/pipeline build frais-de-service`, following `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/45.
- blocked on operator (for Build's pass 6 smoke, not for the code): a Stripe test-mode account, with `STRIPE_SECRET_KEY` (test) set in Vercel for Preview and Development, and `STRIPE_WEBHOOK_SECRET` for Preview once the UAT webhook endpoint is registered (D-88).

## Do not

- Do not book on the click, and do not trust the return URL without reading the session from Stripe (D-90).
- Do not build the professional's-cancellation refund trigger or any booking cancellation: stub 11 owns it; only export `refundFee` (D-94).
- Do not add Stripe Tax, a VAT line, receipts or a payment history (D-87, D-93).
- Do not put live keys anywhere but Production, and no key in git.
