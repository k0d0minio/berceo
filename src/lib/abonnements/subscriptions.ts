import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { after } from "next/server";
import type Stripe from "stripe";

import { db, subscriptions, users, type Subscription, type SubscriptionPlan, type User } from "@/db";
import { isUniqueViolation, UUID } from "@/lib/demandes/requests";
import { isSessionId } from "@/lib/paiements/rules";
import { stripe } from "@/lib/paiements/stripe";
import { siteOrigin } from "@/lib/site-origin";

import { notifyGracePeriod } from "./notify";
import { SUBSCRIPTION_PATH, SUBSCRIPTION_PORTAL_RETURN_PATH, SUBSCRIPTION_RETURN_PATH } from "./paths";
import {
  cancelsAt,
  checkoutExpiry,
  familyMay,
  graceEndsAt,
  hasActiveSubscription,
  LIVE,
  planOfPrice,
  PRICE_ENV,
  statusFromStripe,
  testClocksEnabled,
  type FamilyAction,
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

/** Whether a Checkout of the family's ever completed: a row Stripe gave a subscription, whatever its status since. */
export async function hasCompletedCheckout(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), isNotNull(subscriptions.stripeSubscriptionId)))
    .limit(1);
  return row !== undefined;
}

/** Whether the family is subscribed now: `hasActiveSubscription` on her live row. */
export async function isSubscribed(userId: string, now: Date): Promise<boolean> {
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
