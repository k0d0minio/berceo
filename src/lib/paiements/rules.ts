import type { PaymentStatus, RefundReason } from "@/db/schema";

/**
 * The service fee's rules that need neither the database nor Stripe: the
 * amount (D-99), how long a Checkout stays open and how a stale one reads
 * (D-92), which payments a refund accepts and the key that makes it happen
 * once (D-94), and the page of the admin list. Pure, so the tests hold them
 * to the spec; `./payments.ts` holds them again in its SQL.
 */

/** A Stripe Checkout session id, test or live: the only form the return pages accept. */
export function isSessionId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(value);
}

/** The fee: 3 % of the night rate, all-in, VAT included (D-2, D-99). */
export const FEE_PERCENT = 3;

/**
 * The fee in cents for a whole-euro rate: rate × 3 cents is exactly 3 % of it,
 * never rounded, 300 to 900 cents for 100 to 300 € (D-4).
 */
export function feeCents(nightRateEur: number): number {
  if (!Number.isInteger(nightRateEur) || nightRateEur < 100 || nightRateEur > 300) {
    throw new RangeError(`night rate out of range: ${nightRateEur}`);
  }
  return nightRateEur * FEE_PERCENT;
}

/** « 4,11 »: cents as French euros, a comma and always two decimals (the € is the catalogue's). */
export function eurosFromCents(cents: number): string {
  const euros = Math.trunc(cents / 100);
  const rest = String(Math.abs(cents % 100)).padStart(2, "0");
  return `${euros},${rest}`;
}

/** A Checkout lasts 30 minutes, Stripe's minimum (D-92). */
export const CHECKOUT_MINUTES = 30;

/**
 * When a Checkout opened now closes. A minute of margin over Stripe's floor,
 * since Stripe measures it from its own clock when the session is created.
 */
export function checkoutExpiry(now: Date): Date {
  return new Date(now.getTime() + (CHECKOUT_MINUTES + 1) * 60_000);
}

/**
 * How a payment reads today: an open Checkout past its expiry is expired,
 * whether or not Stripe's webhook came to say so (previews never get it, D-92).
 */
export function effectiveStatus(
  payment: { status: PaymentStatus; expiresAt: Date },
  now: Date,
): PaymentStatus {
  if (payment.status === "en_attente" && payment.expiresAt.getTime() <= now.getTime()) return "expiree";
  return payment.status;
}

/**
 * The statuses a refund accepts: a paid fee, or one whose refund Stripe
 * reported failed, to try again (D-94). Anything else is refused.
 */
export const REFUNDABLE = ["payee", "remboursement_echoue"] as const satisfies readonly PaymentStatus[];

export function isRefundable(status: PaymentStatus): boolean {
  return (REFUNDABLE as readonly PaymentStatus[]).includes(status);
}

/**
 * Stripe's idempotency key for a refund: one per payment and attempt. Two calls
 * on the same state send the same key, so Stripe makes one refund; a retry
 * after a failed refund names the failed one, so it is a new attempt.
 */
export function refundKey(paymentId: string, failedRefundId: string | null): string {
  return failedRefundId ? `frais-remboursement-${paymentId}-${failedRefundId}` : `frais-remboursement-${paymentId}`;
}

/** A Stripe refund's status as the record reads it: failed or not. */
export function refundFailed(stripeStatus: string | null | undefined): boolean {
  return stripeStatus === "failed" || stripeStatus === "canceled";
}

/** The metadata the app puts on its own refunds, so the webhook leaves them to it. */
export const APP_REFUND = { source: "berceo" } as const;

/**
 * What a refund Stripe reports does to a payment (webhook, D-101): a live
 * refund on a paid fee, not made by the app, was made in the dashboard
 * (`stripe`); a failed one on the refund the row carries marks it
 * `remboursement_echoue`; anything else changes nothing. The app's own
 * refunds are recorded by `refundFee`, which knows their reason.
 */
export type RefundSync =
  | { kind: "dashboard" }
  | { kind: "echec" }
  | { kind: "rien" };

export function refundSync(
  payment: { status: PaymentStatus; stripeRefundId: string | null },
  refund: { id: string; status: string | null | undefined; fromApp: boolean },
): RefundSync {
  if (refundFailed(refund.status)) {
    return payment.stripeRefundId === refund.id && payment.status === "remboursee" ? { kind: "echec" } : { kind: "rien" };
  }
  return payment.status === "payee" && !refund.fromApp ? { kind: "dashboard" } : { kind: "rien" };
}

/** Why a fee was refunded, in the order the admin page names them. */
export const REFUND_REASONS = [
  "annulation_professionnelle",
  "reservation_impossible",
  "berceo",
  "stripe",
] as const satisfies readonly RefundReason[];

/** The admin list's page size, like the journal's. */
export const PAYMENTS_PAGE_SIZE = 50;
