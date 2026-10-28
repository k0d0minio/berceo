import type { SubscriptionPlan, SubscriptionStatus } from "@/db/schema";

/**
 * The family subscription's rules that need neither the database nor Stripe
 * (abonnements-catalogue-stripe): the four plans and the variables naming
 * their Stripe prices, how Stripe's status reads here, the grace period after
 * a failed renewal, and `hasActiveSubscription`, which every later stub of the
 * epic reads. Pure, so the tests hold them to the spec; `./subscriptions.ts`
 * holds the live-row rule again in its SQL.
 */

/** The four plans of the devis, in its order, which is also `src/content/abonnements.ts`'s. */
export const PLANS = ["decouverte", "parenthese", "serenite", "premium"] as const satisfies readonly SubscriptionPlan[];

export function isPlan(value: string | null | undefined): value is SubscriptionPlan {
  return (PLANS as readonly string[]).includes(value ?? "");
}

/** The environment variable that holds each plan's Stripe price id. Names in `.env.example`, values in Vercel. */
export const PRICE_ENV = {
  decouverte: "STRIPE_PRICE_DECOUVERTE",
  parenthese: "STRIPE_PRICE_PARENTHESE",
  serenite: "STRIPE_PRICE_SERENITE",
  premium: "STRIPE_PRICE_PREMIUM",
} as const satisfies Record<SubscriptionPlan, string>;

/** The plan whose price id is `priceId`, read from `env`; null for a price that is none of the four. */
export function planOfPrice(
  priceId: string | null | undefined,
  env: Readonly<Record<string, string | undefined>>,
): SubscriptionPlan | null {
  if (!priceId) return null;
  return PLANS.find((plan) => env[PRICE_ENV[plan]] === priceId) ?? null;
}

/** The statuses that hold a family's one live row: the partial unique index says the same. */
export const LIVE = ["en_attente", "active", "impayee"] as const satisfies readonly SubscriptionStatus[];

export function isLive(status: SubscriptionStatus): boolean {
  return (LIVE as readonly SubscriptionStatus[]).includes(status);
}

/**
 * Stripe's subscription status as the row reads it. `incomplete`: the first
 * payment is pending. `past_due` and `unpaid`: a renewal failed. `canceled`,
 * `incomplete_expired`, `paused` and anything unknown: no subscription runs.
 */
export function statusFromStripe(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "incomplete":
      return "en_attente";
    case "past_due":
    case "unpaid":
      return "impayee";
    default:
      return "terminee";
  }
}

/** The grace period after a failed renewal (the devis, « Les paiements »). */
export const GRACE_DAYS = 7;

/**
 * The grace period's end for a row moving to `next`. Only `impayee` has one.
 * It starts at the first failed renewal: a row already `impayee` keeps its
 * end, so Stripe's later retries never extend it.
 */
export function graceEndsAt(
  current: { status: SubscriptionStatus; graceEndsAt: Date | null },
  next: SubscriptionStatus,
  now: Date,
): Date | null {
  if (next !== "impayee") return null;
  if (current.status === "impayee" && current.graceEndsAt) return current.graceEndsAt;
  return new Date(now.getTime() + GRACE_DAYS * 24 * 60 * 60_000);
}

/**
 * Whether a family is subscribed now: an `active` row, or an `impayee` row
 * still in its grace period. Nothing else opens anything.
 */
export function hasActiveSubscription(
  row: { status: SubscriptionStatus; graceEndsAt: Date | null } | null | undefined,
  now: Date,
): boolean {
  if (!row) return false;
  if (row.status === "active") return true;
  return row.status === "impayee" && row.graceEndsAt !== null && now.getTime() < row.graceEndsAt.getTime();
}

/**
 * The plan a family's home asks her to finish (abonnements-inscription-famille):
 * the one she picked at sign-up, while no Checkout of hers ever completed.
 * Leaving the Checkout unpaid completes none. A completed Checkout, paid,
 * pending or ended since, asks for nothing more.
 */
export function planToFinish(
  signupPlan: SubscriptionPlan | null,
  completedCheckout: boolean,
): SubscriptionPlan | null {
  return completedCheckout ? null : signupPlan;
}

/**
 * A subscription Checkout lasts 30 minutes, Stripe's minimum, like the fee's
 * (D-92), with a minute of margin for Stripe's clock.
 */
export function checkoutExpiry(now: Date): Date {
  return new Date(now.getTime() + 31 * 60_000);
}
