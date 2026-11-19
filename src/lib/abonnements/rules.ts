import type { BookingStatus, NightPassStatus, SubscriptionPlan, SubscriptionStatus } from "@/db/schema";
import { addDays, brusselsNow, hasNightEnded, isIsoDate } from "@/lib/demandes/rules";

/**
 * The family subscription's rules that need neither the database nor Stripe
 * (abonnements-catalogue-stripe): the four plans and the variables naming
 * their Stripe prices, how Stripe's status reads here, the grace period after
 * a failed renewal, `hasActiveSubscription`, which every later stub of the
 * epic reads, and `familyMay`, what it opens (abonnements-acces); the
 * cancellation date, the page's state and the test clocks
 * (abonnements-espace-echec-paiement); the founders' list's state, its
 * filter and its link to Stripe (abonnements-back-office). Pure, so
 * the tests hold them to the spec; `./subscriptions.ts`
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
 * When a cancellation ends the subscription (abonnements-espace-echec-paiement):
 * Stripe's `cancel_at`, or the period's end when the portal cancels at the
 * period's end (`cancel_at_period_end`). Null while it renews, and on a row
 * that no longer runs.
 */
export function cancelsAt(
  stripeSubscription: { cancelAt: number | null; cancelAtPeriodEnd: boolean },
  periodEnd: Date | null,
  status: SubscriptionStatus,
): Date | null {
  if (status !== "active" && status !== "impayee") return null;
  if (stripeSubscription.cancelAt !== null) return new Date(stripeSubscription.cancelAt * 1000);
  return stripeSubscription.cancelAtPeriodEnd ? periodEnd : null;
}

/**
 * What « Votre abonnement » says of a running row
 * (abonnements-espace-echec-paiement): `active` renews, `resiliee` ends at
 * `cancelsAt`, `grace` is a failed renewal inside its 7 days, `suspendue` is
 * one past them, when the gate is closed. Null for a row that does not run.
 */
export type SubscriptionState = "active" | "resiliee" | "grace" | "suspendue";

export function subscriptionState(
  row: { status: SubscriptionStatus; graceEndsAt: Date | null; cancelsAt: Date | null },
  now: Date,
): SubscriptionState | null {
  if (row.status === "impayee") return hasActiveSubscription(row, now) ? "grace" : "suspendue";
  if (row.status !== "active") return null;
  return row.cancelsAt ? "resiliee" : "active";
}

/**
 * Whether a new Stripe customer gets its own test clock, so a tester can
 * advance time to a renewal in Stripe's dashboard. Only with a test key and
 * `STRIPE_TEST_CLOCKS=1`, which Preview and UAT carry and Production never.
 */
export function testClocksEnabled(env: Readonly<Record<string, string | undefined>>): boolean {
  const key = env.STRIPE_SECRET_KEY ?? "";
  return env.STRIPE_TEST_CLOCKS === "1" && (key.startsWith("sk_test_") || key.startsWith("rk_test_"));
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
 * What a subscription opens (abonnements-acces). Without one, a family keeps
 * her account, her past gardes and her conversations in read-only, and
 * cancelling a request never closes. A confirmed booking is never cut: its
 * conversation stays writable until the night is over, which the closing rule
 * of `src/lib/messagerie/` holds. `favori` marks a professional as one of
 * « mes professionnelles » (favoris-marquer). The professionals' side reads
 * none of this.
 */
export const FAMILY_ACTIONS = ["publier", "modifier", "reserver", "priorite", "profil", "ecrire", "favori"] as const;

export type FamilyAction = (typeof FAMILY_ACTIONS)[number];

/**
 * Whether a family may do `action`: `subscribed` is `hasActiveSubscription`,
 * so the grace period opens everything; `booked` (the conversation's answer is
 * the booked one) opens `ecrire` alone. The one gate: pages and actions read
 * it, none decides on its own.
 */
export function familyMay(action: FamilyAction, facts: { subscribed: boolean; booked?: boolean }): boolean {
  if (facts.subscribed) return true;
  return action === "ecrire" && facts.booked === true;
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

/**
 * A subscription's state on the founders' list (abonnements-back-office):
 * `subscriptionState` for a running row, and the two states it says nothing
 * of, a first payment still pending and an ended row.
 */
export type AdminSubscriptionState = SubscriptionState | "en_attente" | "terminee";

export function adminSubscriptionState(
  row: { status: SubscriptionStatus; graceEndsAt: Date | null; cancelsAt: Date | null },
  now: Date,
): AdminSubscriptionState {
  if (row.status === "en_attente" || row.status === "terminee") return row.status;
  return subscriptionState(row, now) ?? "terminee";
}

/** The founders' list keeps the subscriptions `hasActiveSubscription` counts with `?statut=actifs` (D-133). */
export const ACTIVE_FILTER = "actifs";

export function isActiveFilter(value: string | null | undefined): boolean {
  return value === ACTIVE_FILTER;
}

/**
 * The subscription's page in Stripe's dashboard, in test mode with a test key
 * (UAT and the previews), so the founders' link opens the account that holds it.
 */
export function stripeSubscriptionUrl(
  stripeSubscriptionId: string,
  env: Readonly<Record<string, string | undefined>>,
): string {
  const key = env.STRIPE_SECRET_KEY ?? "";
  const test = key.startsWith("sk_test_") || key.startsWith("rk_test_");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}subscriptions/${encodeURIComponent(stripeSubscriptionId)}`;
}

// ---------------------------------------------------------------------------
// The one-night plan (JAM-304)
// ---------------------------------------------------------------------------

/**
 * The environment variable that holds the one-night plan's Stripe price: a
 * one-off price, not a recurring one. Name in `.env.example`, value in Vercel.
 */
export const NIGHT_PASS_PRICE_ENV = "STRIPE_PRICE_UNE_NUIT";

/** The facts of the booking a pass is used by: the first one confirmed after its payment. */
export type PassBooking = { status: BookingStatus; nightDate: string; startTime: string; extraHours: number };

/**
 * Whether a one-night pass opens what a subscription opens, at `now`
 * (JAM-304, the answers Q2 and Q4): it is paid, and either the family has
 * made no booking since its payment, or the night of the first booking she
 * made since then has not ended. A pass with no booking has no end date. A
 * cancelled booking still uses the pass: it closes at that night's end.
 */
export function nightPassOpen(
  pass: { status: NightPassStatus; paidAt: Date | null } | null | undefined,
  booking: PassBooking | null,
  now: Date,
): boolean {
  if (!pass || pass.status !== "payee" || !pass.paidAt) return false;
  if (!booking) return true;
  return !hasNightEnded(booking.nightDate, booking.startTime, booking.extraHours, now);
}

/** The pass's state on the founders' list: its Checkout open, paid and still open, used, or never paid. */
export type AdminNightPassState = "en_attente" | "ouverte" | "utilisee" | "terminee";

export function adminNightPassState(
  pass: { status: NightPassStatus; paidAt: Date | null },
  booking: PassBooking | null,
  now: Date,
): AdminNightPassState {
  if (pass.status !== "payee") return pass.status;
  return nightPassOpen(pass, booking, now) ? "ouverte" : "utilisee";
}

// ---------------------------------------------------------------------------
// The promotion codes (JAM-304, the answer Q3)
// ---------------------------------------------------------------------------

/** What a family types on Stripe's Checkout: 3 to 30 capital letters and digits. */
export const PROMO_CODE_PATTERN = /^[A-Z0-9]{3,30}$/;

export const PROMO_KINDS = ["pourcentage", "montant"] as const;
export type PromoKind = (typeof PROMO_KINDS)[number];

/** The form of « Codes promo », as the founder typed it. */
export type PromoCodeInput = {
  code: string;
  kind: string;
  value: string;
  endsOn: string;
  maxUses: string;
};

/**
 * A code ready for Stripe: a percentage from 1 to 100 or an amount in cents
 * above 0, never both; the end as the instant the Brussels day after `endsOn`
 * starts; the most uses. Every code applies to the five plans, on the first
 * payment only: Stripe's duration `once`.
 */
export type PromoCodeDraft = {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
  expiresAt: Date | null;
  maxRedemptions: number | null;
};

export type PromoCodeError = "code" | "remise" | "fin" | "utilisations";

/** The instant the Brussels day `date` starts. */
export function brusselsDayStart(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  for (const hours of [1, 2]) {
    const candidate = new Date(utcMidnight - hours * 3_600_000);
    const here = brusselsNow(candidate);
    if (here.date === date && here.time === "00:00") return candidate;
  }
  return new Date(utcMidnight - 3_600_000);
}

/**
 * Reads the form of « Codes promo ». The code is put in capitals. The value is
 * a whole percentage from 1 to 100, or an amount in euros above 0 with at most
 * two decimals (« 5 », « 5,50 »). The end date, when given, is today or later
 * in Brussels; the code ends when that day ends. The number of uses, when
 * given, is a whole number from 1. Nothing else is accepted.
 */
export function parsePromoCode(
  input: PromoCodeInput,
  now: Date,
): { ok: true; draft: PromoCodeDraft } | { ok: false; error: PromoCodeError } {
  const code = input.code.trim().toUpperCase();
  if (!PROMO_CODE_PATTERN.test(code)) return { ok: false, error: "code" };

  const value = input.value.trim().replace(",", ".");
  let percentOff: number | null = null;
  let amountOffCents: number | null = null;
  if (input.kind === "pourcentage") {
    if (!/^\d{1,3}$/.test(value)) return { ok: false, error: "remise" };
    percentOff = Number(value);
    if (percentOff < 1 || percentOff > 100) return { ok: false, error: "remise" };
  } else if (input.kind === "montant") {
    if (!/^\d{1,5}(\.\d{1,2})?$/.test(value)) return { ok: false, error: "remise" };
    const [euros, cents = ""] = value.split(".");
    amountOffCents = Number(euros) * 100 + Number(cents.padEnd(2, "0"));
    if (amountOffCents <= 0) return { ok: false, error: "remise" };
  } else {
    return { ok: false, error: "remise" };
  }

  let expiresAt: Date | null = null;
  const endsOn = input.endsOn.trim();
  if (endsOn !== "") {
    if (!isIsoDate(endsOn) || endsOn < brusselsNow(now).date) return { ok: false, error: "fin" };
    expiresAt = brusselsDayStart(addDays(endsOn, 1));
  }

  let maxRedemptions: number | null = null;
  const maxUses = input.maxUses.trim();
  if (maxUses !== "") {
    if (!/^\d{1,6}$/.test(maxUses) || Number(maxUses) < 1) return { ok: false, error: "utilisations" };
    maxRedemptions = Number(maxUses);
  }

  return { ok: true, draft: { code, percentOff, amountOffCents, expiresAt, maxRedemptions } };
}

/** The promotion code's page in Stripe's dashboard, in test mode with a test key. */
export function stripePromotionCodeUrl(
  promotionCodeId: string,
  env: Readonly<Record<string, string | undefined>>,
): string {
  const key = env.STRIPE_SECRET_KEY ?? "";
  const test = key.startsWith("sk_test_") || key.startsWith("rk_test_");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}promotion_codes/${encodeURIComponent(promotionCodeId)}`;
}
