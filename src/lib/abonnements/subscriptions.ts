import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, gt, gte, inArray, isNotNull, isNull, ne, or, sql, type SQL } from "drizzle-orm";
import { after } from "next/server";
import type Stripe from "stripe";

import {
  bookings,
  careRequests,
  db,
  nightPasses,
  subscriptions,
  users,
  type NightPass,
  type Subscription,
  type SubscriptionPlan,
  type User,
} from "@/db";
import { isUniqueViolation, UUID } from "@/lib/demandes/requests";
import { isSessionId } from "@/lib/paiements/rules";
import { stripe } from "@/lib/paiements/stripe";
import { siteOrigin } from "@/lib/site-origin";

import { notifyGracePeriod } from "./notify";
import { SUBSCRIPTION_PATH, SUBSCRIPTION_PORTAL_RETURN_PATH, SUBSCRIPTION_RETURN_PATH } from "./paths";
import {
  adminNightPassState,
  adminSubscriptionState,
  cancelsAt,
  checkoutExpiry,
  familyMay,
  graceEndsAt,
  hasActiveSubscription,
  LIVE,
  NIGHT_PASS_PRICE_ENV,
  nightPassOpen,
  planOfPrice,
  PRICE_ENV,
  statusFromStripe,
  stripeSubscriptionUrl,
  testClocksEnabled,
  type AdminNightPassState,
  type AdminSubscriptionState,
  type FamilyAction,
  type PassBooking,
} from "./rules";

/**
 * The family subscription (abonnements-catalogue-stripe): the only reads and
 * writes of `subscriptions`, and of `users.stripe_customer_id`. A family
 * opens a Checkout in subscription mode (`startSubscription`); Stripe's
 * subscription is then read from Stripe, never from the caller, and copied
 * onto the row (`syncSubscription`) by the webhook and by the return page,
 * whichever comes first, as often as either likes. The rules are
 * `./rules.ts`; the one live row per family is held again by a partial
 * unique index. It shares the Stripe client with the 3 % fee and changes
 * nothing of it. The family manages a running subscription in Stripe's
 * customer portal (`openPortal`), and the row's move into `impayee` sends
 * her the one e-mail of the grace period (abonnements-espace-echec-paiement).
 * The founders read every subscription, the count of active ones and a
 * family's own line (abonnements-back-office).
 *
 * The one-night plan (JAM-304) is here too: the only reads and writes of
 * `night_passes`. A family opens a Checkout in payment mode
 * (`startNightPass`); the payment is read from Stripe and copied onto the row
 * (`confirmNightPassCheckout`) by the webhook and by the return page. A paid
 * pass opens what a subscription opens until the night of her first booking
 * after it ends (`nightPassOpen`), so `isSubscribed` reads both. Every
 * Checkout accepts a promotion code; the code and its discount are read back
 * from the completed Checkout.
 */

function logError(what: string, context: Record<string, unknown>, error?: unknown): void {
  console.error(`[abonnements] ${what}`, {
    ...context,
    ...(error === undefined
      ? {}
      : {
          error: error instanceof Error ? error.name : typeof error,
          code:
            (error as { code?: unknown } | null)?.code ??
            (error as { cause?: { code?: unknown } } | null)?.cause?.code,
        }),
  });
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** The plan's Stripe price id, from its environment variable; a missing one throws. */
function priceIdFor(plan: SubscriptionPlan): string {
  const name = PRICE_ENV[plan];
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — this plan cannot be sold. See .env.example.`);
  return value;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** The family's one live row (`en_attente`, `active` or `impayee`), or null. */
export async function liveSubscription(userId: string): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), inArray(subscriptions.status, [...LIVE])))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Whether a Checkout of the family's ever completed: a row Stripe gave a
 * subscription, whatever its status since, or a paid one-night pass (JAM-581).
 */
export async function hasCompletedCheckout(userId: string): Promise<boolean> {
  const [[row], [pass]] = await Promise.all([
    db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), isNotNull(subscriptions.stripeSubscriptionId)))
      .limit(1),
    db
      .select({ id: nightPasses.id })
      .from(nightPasses)
      .where(and(eq(nightPasses.userId, userId), isNotNull(nightPasses.paidAt)))
      .limit(1),
  ]);
  return row !== undefined || pass !== undefined;
}

/**
 * Whether the family is subscribed now: `hasActiveSubscription` on her live
 * row, or a one-night pass still open (JAM-304). Every gate reads this.
 */
export async function isSubscribed(userId: string, now: Date): Promise<boolean> {
  if (hasActiveSubscription(await liveSubscription(userId), now)) return true;
  return nightPassOpenNow(userId, now);
}

/** Whether a subscription that Stripe created runs now (`active`, or `impayee` in its grace period): the pass does not count. */
async function subscriptionRuns(userId: string, now: Date): Promise<boolean> {
  return hasActiveSubscription(await liveSubscription(userId), now);
}

/**
 * Whether the family may do `action` now (abonnements-acces): `familyMay` on
 * her live row. A page reads it to show the invitation line in place of the
 * action, and the action reads it again before its write, since a
 * subscription can end between the page and the click.
 */
export async function familyMayNow(userId: string, action: FamilyAction, now: Date): Promise<boolean> {
  return familyMay(action, { subscribed: await isSubscribed(userId, now) });
}

/** Whose Checkout this is, for the return page: another family's reads as not found. */
export async function subscriptionOwner(sessionId: string): Promise<{ userId: string | null } | null> {
  if (!isSessionId(sessionId)) return null;
  const [row] = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return row ?? null;
}

async function rowBySession(sessionId: string): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Opening a Checkout
// ---------------------------------------------------------------------------

export type StartResult =
  | { kind: "stripe"; url: string }
  /** An `active` or `impayee` subscription runs: a second one is refused. */
  | { kind: "dejaAbonnee" }
  /** The first payment of a subscription is still pending. */
  | { kind: "enCours" }
  | { kind: "erreur" };

/**
 * The family's Stripe customer: the one on her row, or a new one, made once
 * (one idempotency key per family) and kept with a conditional update, so two
 * racing calls end on the same customer. With test clocks on (`testClocksEnabled`)
 * a new customer gets its own clock, made once the same way.
 */
async function customerFor(user: Pick<User, "id" | "email" | "firstName" | "lastName" | "stripeCustomerId">): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  let testClock: string | undefined;
  if (testClocksEnabled(process.env)) {
    const clock = await stripe().testHelpers.testClocks.create(
      { frozen_time: Math.floor(Date.now() / 1000), name: `abonnement-${user.id}` },
      { idempotencyKey: `abonnement-horloge-${user.id}` },
    );
    testClock = clock.id;
  }
  const customer = await stripe().customers.create(
    {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      preferred_locales: ["fr"],
      metadata: { user_id: user.id },
      ...(testClock ? { test_clock: testClock } : {}),
    },
    { idempotencyKey: `abonnement-client-${user.id}` },
  );
  const [kept] = await db
    .update(users)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(and(eq(users.id, user.id), isNull(users.stripeCustomerId)))
    .returning({ stripeCustomerId: users.stripeCustomerId });
  if (kept?.stripeCustomerId) return kept.stripeCustomerId;
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row?.stripeCustomerId) throw new Error("stripe customer not recorded");
  return row.stripeCustomerId;
}

/**
 * Closes the open Checkout of an `en_attente` row that has no subscription yet,
 * and ends the row. A Checkout Stripe refuses to expire was completed in the
 * meantime: it is confirmed instead, and the caller reads the row again.
 */
async function closeCheckout(row: Subscription, now: Date): Promise<"fermee" | "completee"> {
  try {
    await stripe().checkout.sessions.expire(row.stripeCheckoutSessionId);
  } catch (error) {
    const session = await stripe().checkout.sessions.retrieve(row.stripeCheckoutSessionId);
    if (session.status === "complete") {
      await confirmSubscriptionCheckout(row.stripeCheckoutSessionId, now);
      return "completee";
    }
    if (session.status !== "expired") {
      logError("checkout neither expired nor complete", { rowId: row.id, status: session.status }, error);
      throw error;
    }
  }
  await markCheckoutExpired(row.stripeCheckoutSessionId, now);
  return "fermee";
}

/**
 * « Choisir » a plan: refused while a subscription runs (`active` or
 * `impayee`) or while its first payment is pending. An earlier open Checkout
 * is closed first. Then a Checkout in subscription mode is opened at Stripe
 * for the plan's price, and recorded `en_attente`. Bancontact pays the first
 * period; Stripe takes the renewals of a Bancontact subscription by SEPA
 * Direct Debit. Cards cover Apple Pay and Google Pay.
 */
export async function startSubscription(input: {
  user: Pick<User, "id" | "email" | "firstName" | "lastName" | "stripeCustomerId">;
  plan: SubscriptionPlan;
  siteUrl: string;
  now: Date;
}): Promise<StartResult> {
  const { user, plan, siteUrl, now } = input;

  const live = await liveSubscription(user.id);
  if (live) {
    if (live.stripeSubscriptionId) {
      // Read Stripe first: a pending first payment may have landed, or failed for good.
      const synced = await syncSubscription(live.stripeSubscriptionId, now);
      const status = synced?.status ?? live.status;
      if (status === "active" || status === "impayee") return { kind: "dejaAbonnee" };
      if (status === "en_attente") return { kind: "enCours" };
    } else if (live.status === "en_attente") {
      if ((await closeCheckout(live, now)) === "completee") {
        const again = await liveSubscription(user.id);
        if (again?.status === "en_attente") return { kind: "enCours" };
        if (again) return { kind: "dejaAbonnee" };
      }
    } else {
      return { kind: "dejaAbonnee" };
    }
  }

  let customerId: string;
  let priceId: string;
  try {
    priceId = priceIdFor(plan);
    customerId = await customerFor(user);
  } catch (error) {
    logError("checkout not prepared", { userId: user.id, plan }, error);
    return { kind: "erreur" };
  }

  const id = randomUUID();
  const metadata = { subscription_row_id: id, user_id: user.id, plan };
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create(
      {
        mode: "subscription",
        locale: "fr",
        customer: customerId,
        allow_promotion_codes: true,
        payment_method_types: ["card", "bancontact"],
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: id,
        metadata,
        subscription_data: { metadata },
        expires_at: Math.floor(checkoutExpiry(now).getTime() / 1000),
        success_url: `${siteUrl}${SUBSCRIPTION_RETURN_PATH}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}${SUBSCRIPTION_PATH}?retour=abandonne`,
      },
      { idempotencyKey: `abonnement-checkout-${id}` },
    );
  } catch (error) {
    logError("checkout not opened", { userId: user.id, plan }, error);
    return { kind: "erreur" };
  }
  if (!session.url) {
    logError("checkout without a url", { userId: user.id, sessionId: session.id });
    return { kind: "erreur" };
  }

  try {
    await db.insert(subscriptions).values({
      id,
      userId: user.id,
      plan,
      stripeCustomerId: customerId,
      stripeCheckoutSessionId: session.id,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    // Two clicks racing: the other Checkout stands, this one is closed at once.
    await stripe()
      .checkout.sessions.expire(session.id)
      .catch((expireError: unknown) => logError("racing checkout not expired", { sessionId: session.id }, expireError));
    if (isUniqueViolation(error)) return { kind: "dejaAbonnee" };
    logError("subscription not recorded", { userId: user.id, sessionId: session.id }, error);
    return { kind: "erreur" };
  }

  return { kind: "stripe", url: session.url };
}

// ---------------------------------------------------------------------------
// Stripe's word
// ---------------------------------------------------------------------------

/** The promotion code typed on a completed Checkout, and the discount in cents (0 without one). */
function discountOf(session: Stripe.Checkout.Session): { promotionCode: string | null; amountDiscount: number } {
  const promo = session.discounts?.find((discount) => discount.promotion_code)?.promotion_code;
  return {
    promotionCode: promo && typeof promo !== "string" ? promo.code : null,
    amountDiscount: session.total_details?.amount_discount ?? 0,
  };
}

/**
 * Reads the promotion code and the discount of a subscription's Checkout once
 * (JAM-304): Stripe ends a `once` discount after the first invoice, so the
 * subscription itself soon forgets it, and the Checkout keeps it. A failure
 * leaves `amount_discount` null, and the next sync reads it again.
 */
async function recordSubscriptionDiscount(row: Subscription): Promise<void> {
  if (row.amountDiscount !== null || !row.stripeSubscriptionId) return;
  try {
    const session = await stripe().checkout.sessions.retrieve(row.stripeCheckoutSessionId, {
      expand: ["discounts.promotion_code"],
    });
    if (session.status !== "complete") return;
    await db
      .update(subscriptions)
      .set(discountOf(session))
      .where(and(eq(subscriptions.id, row.id), isNull(subscriptions.amountDiscount)));
  } catch (error) {
    logError("discount not read", { rowId: row.id }, error);
  }
}

/**
 * Copies Stripe's subscription onto its row: the status, the plan, the
 * renewal date, the grace period, the cancellation date and the end. The
 * subscription is read from Stripe, so a late, repeated or reordered event
 * writes the same row. A row is found by the subscription id, or, the first
 * time, by the row id the Checkout put in the subscription's metadata. A
 * subscription that is none of ours changes nothing.
 *
 * The move into `impayee` is claimed by a conditional update: the one call
 * that makes it sends the grace period's e-mail after the response, so
 * Stripe's retries and two racing events send one e-mail per failed renewal.
 */
export async function syncSubscription(stripeSubscriptionId: string, now: Date): Promise<Subscription | null> {
  const subscription = await stripe().subscriptions.retrieve(stripeSubscriptionId);

  let [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);
  if (!row) {
    const rowId = subscription.metadata?.subscription_row_id;
    if (rowId && UUID.test(rowId)) {
      [row] = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.id, rowId), isNull(subscriptions.stripeSubscriptionId)))
        .limit(1);
    }
  }
  if (!row) {
    logError("subscription of no row", { subscriptionId: subscription.id });
    return null;
  }

  const status = statusFromStripe(subscription.status);
  const item = subscription.items.data[0];
  const periodEnd = item ? new Date(item.current_period_end * 1000) : row.currentPeriodEnd;
  const plan = planOfPrice(item?.price.id, process.env) ?? row.plan;
  const endedAt =
    status === "terminee"
      ? (row.endedAt ?? (subscription.ended_at ? new Date(subscription.ended_at * 1000) : now))
      : null;

  const entering = status === "impayee" && row.status !== "impayee";
  const [updated] = await db
    .update(subscriptions)
    .set({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: idOf(subscription.customer) ?? row.stripeCustomerId,
      plan,
      status,
      currentPeriodEnd: periodEnd,
      graceEndsAt: graceEndsAt(row, status, now),
      cancelsAt: cancelsAt(
        { cancelAt: subscription.cancel_at, cancelAtPeriodEnd: subscription.cancel_at_period_end },
        periodEnd,
        status,
      ),
      endedAt,
      updatedAt: now,
    })
    .where(entering ? and(eq(subscriptions.id, row.id), ne(subscriptions.status, "impayee")) : eq(subscriptions.id, row.id))
    .returning();
  if (!updated) {
    if (!entering) return null;
    // Another call made the move first, and sends the e-mail.
    const [current] = await db.select().from(subscriptions).where(eq(subscriptions.id, row.id)).limit(1);
    return current ?? null;
  }
  await recordSubscriptionDiscount(updated);
  if (entering) {
    const siteUrl = await siteOrigin();
    after(async () => notifyGracePeriod(updated.id, await unpaidInvoiceUrl(subscription.id), siteUrl));
  }
  return updated;
}

/** The family's live row synced from Stripe, back from the portal: a row without a subscription yet is left as it is. */
export async function syncLiveSubscription(userId: string, now: Date): Promise<void> {
  const live = await liveSubscription(userId);
  if (live?.stripeSubscriptionId) await syncSubscription(live.stripeSubscriptionId, now);
}

// ---------------------------------------------------------------------------
// The portal and the unpaid renewal
// ---------------------------------------------------------------------------

/**
 * A session of Stripe's customer portal for the family's customer: she changes
 * her card or her plan, cancels and downloads her invoices there. The portal's
 * settings live in Stripe's dashboard (README). Null without a customer, or
 * when Stripe refuses.
 */
export async function openPortal(user: Pick<User, "id" | "stripeCustomerId">, siteUrl: string): Promise<string | null> {
  if (!user.stripeCustomerId) return null;
  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      locale: "fr",
      return_url: `${siteUrl}${SUBSCRIPTION_PORTAL_RETURN_PATH}`,
    });
    return session.url;
  } catch (error) {
    logError("portal not opened", { userId: user.id }, error);
    return null;
  }
}

/**
 * Stripe's page for the renewal that failed (« Régler maintenant »): the
 * hosted page of the subscription's latest invoice while it is still open.
 * Null once it is paid or voided, or when Stripe cannot be read.
 */
export async function unpaidInvoiceUrl(stripeSubscriptionId: string): Promise<string | null> {
  try {
    const subscription = await stripe().subscriptions.retrieve(stripeSubscriptionId, { expand: ["latest_invoice"] });
    const invoice = subscription.latest_invoice;
    if (!invoice || typeof invoice === "string" || invoice.status !== "open") return null;
    return invoice.hosted_invoice_url ?? null;
  } catch (error) {
    logError("unpaid invoice not read", { subscriptionId: stripeSubscriptionId }, error);
    return null;
  }
}

export type ConfirmResult =
  | { kind: "active" }
  | { kind: "enCours" }
  | { kind: "nonPayee" }
  | { kind: "inconnue" };

function outcome(row: Pick<Subscription, "status">): ConfirmResult {
  switch (row.status) {
    case "active":
    case "impayee":
      return { kind: "active" };
    case "en_attente":
      return { kind: "enCours" };
    case "terminee":
      return { kind: "nonPayee" };
  }
}

/**
 * A subscription Checkout that came back (the webhook, the return page): the
 * session is read from Stripe, its subscription linked to the row, and the row
 * synced. Safe to repeat.
 */
export async function confirmSubscriptionCheckout(sessionId: string, now: Date): Promise<ConfirmResult> {
  if (!isSessionId(sessionId)) return { kind: "inconnue" };
  const row = await rowBySession(sessionId);
  if (!row) return { kind: "inconnue" };

  let subscriptionId = row.stripeSubscriptionId;
  if (!subscriptionId) {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.mode !== "subscription") return { kind: "inconnue" };
    if (session.status === "expired") {
      await markCheckoutExpired(sessionId, now);
      return { kind: "nonPayee" };
    }
    subscriptionId = idOf(session.subscription);
    if (session.status !== "complete" || !subscriptionId) return outcome(row);
  }

  const synced = await syncSubscription(subscriptionId, now);
  return synced ? outcome(synced) : { kind: "inconnue" };
}

/** A subscription Checkout closed unpaid: its row ends, only from `en_attente` without a subscription. */
export async function markCheckoutExpired(sessionId: string, now: Date): Promise<void> {
  if (!isSessionId(sessionId)) return;
  await db
    .update(subscriptions)
    .set({ status: "terminee", endedAt: now, updatedAt: now })
    .where(
      and(
        eq(subscriptions.stripeCheckoutSessionId, sessionId),
        eq(subscriptions.status, "en_attente"),
        isNull(subscriptions.stripeSubscriptionId),
      ),
    );
}

/** A renewal paid or failed: the invoice names its subscription, which is synced. Other invoices change nothing. */
export async function syncFromInvoice(invoice: Stripe.Invoice, now: Date): Promise<void> {
  const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription);
  if (subscriptionId) await syncSubscription(subscriptionId, now);
}

// ---------------------------------------------------------------------------
// The founders' list (abonnements-back-office)
// ---------------------------------------------------------------------------

/** The page size of the founders' list, the journal's (`LIST_PAGE_SIZE` in `src/lib/admin/rules.ts`). */
export const ADMIN_SUBSCRIPTIONS_PAGE_SIZE = 50;

/**
 * The rows the founders' list holds: every subscription Stripe created, so a
 * Checkout left unpaid is no subscription. With `active`, only those
 * `hasActiveSubscription` counts, in SQL: `active`, or `impayee` before the
 * grace period's end. The overview's count and the list's filter both read
 * this one condition (D-133).
 */
export function subscriptionListCondition(active: boolean, now: Date): SQL | undefined {
  return and(
    isNotNull(subscriptions.stripeSubscriptionId),
    active
      ? or(
          eq(subscriptions.status, "active"),
          and(eq(subscriptions.status, "impayee"), gt(subscriptions.graceEndsAt, now)),
        )
      : undefined,
  );
}

/** « Vue d'ensemble »'s « Abonnements actifs ». */
export async function activeSubscriptionCount(now: Date): Promise<number> {
  const [row] = await db.select({ n: count() }).from(subscriptions).where(subscriptionListCondition(true, now));
  return row?.n ?? 0;
}

export type AdminSubscription = {
  id: string;
  /** Null once the account is gone. */
  familyUserId: string | null;
  family: string | null;
  plan: SubscriptionPlan;
  state: AdminSubscriptionState;
  createdAt: Date;
  currentPeriodEnd: Date | null;
  graceEndsAt: Date | null;
  cancelsAt: Date | null;
  endedAt: Date | null;
  stripeUrl: string | null;
  /** The promotion code of the first payment, and its discount in cents; null when none or not read yet. */
  promotionCode: string | null;
  amountDiscount: number | null;
};

/** One page of subscriptions, the newest first. */
export async function readSubscriptions(
  page: number,
  active: boolean,
  now: Date,
): Promise<{ rows: AdminSubscription[]; pages: number }> {
  const where = subscriptionListCondition(active, now);
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: subscriptions.id,
        familyUserId: subscriptions.userId,
        familyFirstName: users.firstName,
        familyLastName: users.lastName,
        plan: subscriptions.plan,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        graceEndsAt: subscriptions.graceEndsAt,
        cancelsAt: subscriptions.cancelsAt,
        endedAt: subscriptions.endedAt,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        promotionCode: subscriptions.promotionCode,
        amountDiscount: subscriptions.amountDiscount,
      })
      .from(subscriptions)
      .leftJoin(users, eq(users.id, subscriptions.userId))
      .where(where)
      .orderBy(desc(subscriptions.createdAt), desc(subscriptions.id))
      .limit(ADMIN_SUBSCRIPTIONS_PAGE_SIZE)
      .offset((page - 1) * ADMIN_SUBSCRIPTIONS_PAGE_SIZE),
    db.select({ n: count() }).from(subscriptions).where(where),
  ]);
  return {
    rows: rows.map(({ familyFirstName, familyLastName, status, stripeSubscriptionId, ...row }) => ({
      ...row,
      family: familyFirstName === null ? null : `${familyFirstName} ${familyLastName ?? ""}`.trim(),
      state: adminSubscriptionState({ status, graceEndsAt: row.graceEndsAt, cancelsAt: row.cancelsAt }, now),
      stripeUrl: stripeSubscriptionId ? stripeSubscriptionUrl(stripeSubscriptionId, process.env) : null,
    })),
    pages: Math.max(1, Math.ceil(total.n / ADMIN_SUBSCRIPTIONS_PAGE_SIZE)),
  };
}

/**
 * A family's line on her account page: her live subscription, else her
 * latest ended one; only a subscription Stripe created. Null when she never
 * had one.
 */
export async function familySubscriptionLine(
  userId: string,
  now: Date,
): Promise<{ plan: SubscriptionPlan; state: AdminSubscriptionState } | null> {
  const [row] = await db
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      graceEndsAt: subscriptions.graceEndsAt,
      cancelsAt: subscriptions.cancelsAt,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), isNotNull(subscriptions.stripeSubscriptionId)))
    .orderBy(sql`${subscriptions.status} = 'terminee'`, desc(subscriptions.createdAt))
    .limit(1);
  return row ? { plan: row.plan, state: adminSubscriptionState(row, now) } : null;
}

// ---------------------------------------------------------------------------
// The one-night plan (JAM-304)
// ---------------------------------------------------------------------------

/** The one-night plan's Stripe price id, from its environment variable; a missing one throws. */
function nightPassPriceId(): string {
  const value = process.env[NIGHT_PASS_PRICE_ENV];
  if (!value) throw new Error(`${NIGHT_PASS_PRICE_ENV} is not set — the one-night plan cannot be sold. See .env.example.`);
  return value;
}

/** The family's latest paid pass: the only one that can still be open, since a second one is refused while it is. */
async function latestPaidPass(userId: string): Promise<NightPass | null> {
  const [row] = await db
    .select()
    .from(nightPasses)
    .where(and(eq(nightPasses.userId, userId), eq(nightPasses.status, "payee")))
    .orderBy(desc(nightPasses.paidAt))
    .limit(1);
  return row ?? null;
}

/** The first booking the family made at or after `paidAt`: the one a pass paid then is used by. */
async function passBooking(userId: string, paidAt: Date): Promise<PassBooking | null> {
  const [row] = await db
    .select({
      status: bookings.status,
      nightDate: bookings.nightDate,
      startTime: careRequests.startTime,
      extraHours: careRequests.extraHours,
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .where(and(eq(bookings.familyUserId, userId), gte(bookings.confirmedAt, paidAt)))
    .orderBy(asc(bookings.confirmedAt))
    .limit(1);
  return row ?? null;
}

/** Whether the family's one-night pass opens her actions now (`nightPassOpen`). */
export async function nightPassOpenNow(userId: string, now: Date): Promise<boolean> {
  const pass = await latestPaidPass(userId);
  if (!pass?.paidAt) return false;
  return nightPassOpen(pass, await passBooking(userId, pass.paidAt), now);
}

/** What « Votre abonnement » says of the family's pass: open, and whether a booking already uses it. Null when none is open. */
export async function familyNightPass(userId: string, now: Date): Promise<{ booked: boolean } | null> {
  const pass = await latestPaidPass(userId);
  if (!pass?.paidAt) return null;
  const booking = await passBooking(userId, pass.paidAt);
  return nightPassOpen(pass, booking, now) ? { booked: booking !== null } : null;
}

/** Whose pass Checkout this is, for the return page: another family's reads as not found. */
export async function nightPassOwner(sessionId: string): Promise<{ userId: string | null } | null> {
  if (!isSessionId(sessionId)) return null;
  const [row] = await db
    .select({ userId: nightPasses.userId })
    .from(nightPasses)
    .where(eq(nightPasses.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return row ?? null;
}

async function passBySession(sessionId: string): Promise<NightPass | null> {
  const [row] = await db
    .select()
    .from(nightPasses)
    .where(eq(nightPasses.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return row ?? null;
}

export type NightPassStartResult =
  | { kind: "stripe"; url: string }
  /** A subscription runs: it already opens everything. */
  | { kind: "dejaAbonnee" }
  /** A pass is already open. */
  | { kind: "nuitOuverte" }
  /** The payment of a pass is still pending. */
  | { kind: "enCours" }
  | { kind: "erreur" };

/**
 * « Choisir » the one-night plan (JAM-304): refused while a subscription runs
 * or a pass is open. An earlier open Checkout of a pass is closed first; one
 * Stripe refuses to expire was paid, and is confirmed instead. Then a
 * Checkout in payment mode is opened for the plan's one-off price, with the
 * promotion code field, and recorded `en_attente`.
 */
export async function startNightPass(input: {
  user: Pick<User, "id" | "email" | "firstName" | "lastName" | "stripeCustomerId">;
  siteUrl: string;
  now: Date;
}): Promise<NightPassStartResult> {
  const { user, siteUrl, now } = input;
  if (await subscriptionRuns(user.id, now)) return { kind: "dejaAbonnee" };
  if (await nightPassOpenNow(user.id, now)) return { kind: "nuitOuverte" };

  const [open] = await db
    .select()
    .from(nightPasses)
    .where(and(eq(nightPasses.userId, user.id), eq(nightPasses.status, "en_attente")))
    .limit(1);
  if (open) {
    try {
      await stripe().checkout.sessions.expire(open.stripeCheckoutSessionId);
      await markNightPassClosed(open.stripeCheckoutSessionId, now);
    } catch (error) {
      const result = await confirmNightPassCheckout(open.stripeCheckoutSessionId, now);
      if (result.kind === "active") return { kind: "nuitOuverte" };
      if (result.kind === "enCours") return { kind: "enCours" };
      if (result.kind !== "nonPayee") {
        logError("pass checkout neither expired nor complete", { rowId: open.id }, error);
        return { kind: "erreur" };
      }
    }
  }

  let customerId: string;
  let priceId: string;
  try {
    priceId = nightPassPriceId();
    customerId = await customerFor(user);
  } catch (error) {
    logError("pass checkout not prepared", { userId: user.id }, error);
    return { kind: "erreur" };
  }

  const id = randomUUID();
  const metadata = { night_pass_row_id: id, user_id: user.id, kind: "une_nuit" };
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        locale: "fr",
        customer: customerId,
        allow_promotion_codes: true,
        payment_method_types: ["card", "bancontact"],
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: id,
        metadata,
        payment_intent_data: { metadata },
        expires_at: Math.floor(checkoutExpiry(now).getTime() / 1000),
        success_url: `${siteUrl}${SUBSCRIPTION_RETURN_PATH}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}${SUBSCRIPTION_PATH}?retour=abandonne`,
      },
      { idempotencyKey: `une-nuit-checkout-${id}` },
    );
  } catch (error) {
    logError("pass checkout not opened", { userId: user.id }, error);
    return { kind: "erreur" };
  }
  if (!session.url) {
    logError("pass checkout without a url", { userId: user.id, sessionId: session.id });
    return { kind: "erreur" };
  }

  try {
    await db.insert(nightPasses).values({
      id,
      userId: user.id,
      stripeCustomerId: customerId,
      stripeCheckoutSessionId: session.id,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    await stripe()
      .checkout.sessions.expire(session.id)
      .catch((expireError: unknown) => logError("racing pass checkout not expired", { sessionId: session.id }, expireError));
    if (isUniqueViolation(error)) return { kind: "enCours" };
    logError("pass not recorded", { userId: user.id, sessionId: session.id }, error);
    return { kind: "erreur" };
  }

  return { kind: "stripe", url: session.url };
}

/** Whether a Checkout is a one-night pass's, read from the metadata `startNightPass` puts on it. */
export function isNightPassSession(session: Pick<Stripe.Checkout.Session, "mode" | "metadata">): boolean {
  return session.mode === "payment" && session.metadata?.kind === "une_nuit";
}

/**
 * A pass Checkout that came back (the webhook, the return page): the session
 * is read from Stripe, never from the caller. Paid, the row moves to `payee`
 * once, with the amount, the payment and the promotion code. Expired, it
 * ends. Safe to repeat.
 */
export async function confirmNightPassCheckout(sessionId: string, now: Date): Promise<ConfirmResult> {
  if (!isSessionId(sessionId)) return { kind: "inconnue" };
  const row = await passBySession(sessionId);
  if (!row) return { kind: "inconnue" };
  if (row.status === "payee") return { kind: "active" };
  if (row.status === "terminee") return { kind: "nonPayee" };

  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["discounts.promotion_code"] });
  if (!isNightPassSession(session)) return { kind: "inconnue" };
  if (session.status === "expired") {
    await markNightPassClosed(sessionId, now);
    return { kind: "nonPayee" };
  }
  if (session.status !== "complete" || session.payment_status !== "paid") return { kind: "enCours" };

  await db
    .update(nightPasses)
    .set({
      status: "payee",
      paidAt: now,
      stripePaymentIntentId: idOf(session.payment_intent),
      amountTotal: session.amount_total,
      ...discountOf(session),
      updatedAt: now,
    })
    .where(and(eq(nightPasses.id, row.id), eq(nightPasses.status, "en_attente")));
  return { kind: "active" };
}

/** A pass Checkout closed or failed unpaid: its row ends, only from `en_attente`. */
export async function markNightPassClosed(sessionId: string, now: Date): Promise<void> {
  if (!isSessionId(sessionId)) return;
  await db
    .update(nightPasses)
    .set({ status: "terminee", endedAt: now, updatedAt: now })
    .where(and(eq(nightPasses.stripeCheckoutSessionId, sessionId), eq(nightPasses.status, "en_attente")));
}

export type AdminNightPass = {
  id: string;
  familyUserId: string | null;
  family: string | null;
  state: AdminNightPassState;
  paidAt: Date | null;
  amountTotal: number | null;
  promotionCode: string | null;
  amountDiscount: number | null;
  stripeUrl: string | null;
};

/** The payment's page in Stripe's dashboard, in test mode with a test key. */
function stripePaymentUrl(paymentIntentId: string): string {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const test = key.startsWith("sk_test_") || key.startsWith("rk_test_");
  return `https://dashboard.stripe.com/${test ? "test/" : ""}payments/${encodeURIComponent(paymentIntentId)}`;
}

/** One page of paid passes for the founders' list, the newest payment first. */
export async function readNightPasses(page: number, now: Date): Promise<{ rows: AdminNightPass[]; pages: number }> {
  const where = eq(nightPasses.status, "payee");
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: nightPasses.id,
        familyUserId: nightPasses.userId,
        familyFirstName: users.firstName,
        familyLastName: users.lastName,
        status: nightPasses.status,
        paidAt: nightPasses.paidAt,
        amountTotal: nightPasses.amountTotal,
        promotionCode: nightPasses.promotionCode,
        amountDiscount: nightPasses.amountDiscount,
        stripePaymentIntentId: nightPasses.stripePaymentIntentId,
      })
      .from(nightPasses)
      .leftJoin(users, eq(users.id, nightPasses.userId))
      .where(where)
      .orderBy(desc(nightPasses.paidAt), desc(nightPasses.id))
      .limit(ADMIN_SUBSCRIPTIONS_PAGE_SIZE)
      .offset((page - 1) * ADMIN_SUBSCRIPTIONS_PAGE_SIZE),
    db.select({ n: count() }).from(nightPasses).where(where),
  ]);
  const withState = await Promise.all(
    rows.map(async ({ familyFirstName, familyLastName, status, stripePaymentIntentId, ...row }) => {
      const booking = row.familyUserId && row.paidAt ? await passBooking(row.familyUserId, row.paidAt) : null;
      return {
        ...row,
        family: familyFirstName === null ? null : `${familyFirstName} ${familyLastName ?? ""}`.trim(),
        state: adminNightPassState({ status, paidAt: row.paidAt }, booking, now),
        stripeUrl: stripePaymentIntentId ? stripePaymentUrl(stripePaymentIntentId) : null,
      };
    }),
  );
  return { rows: withState, pages: Math.max(1, Math.ceil(total.n / ADMIN_SUBSCRIPTIONS_PAGE_SIZE)) };
}
