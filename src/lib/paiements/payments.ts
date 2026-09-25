import "server-only";

import { randomUUID } from "node:crypto";

import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { after } from "next/server";
import type Stripe from "stripe";

import { admin } from "@/content/admin";
import { paiement } from "@/content/paiement";
import { fill, words } from "@/content/locale";
import {
  careRequestApplications,
  db,
  payments,
  professionalProfiles,
  users,
  type Payment,
  type PaymentStatus,
  type RefundReason,
} from "@/db";
import type { Person } from "@/lib/admin/journal";
import { formatDate } from "@/lib/demandes/format";
import { isUniqueViolation, UUID } from "@/lib/demandes/requests";
import { acceptAnswer, acceptCheck } from "@/lib/reservations/bookings";
import { notifyBooking } from "@/lib/reservations/notify";
import type { AcceptRefusal } from "@/lib/reservations/rules";

import { notifyRefund } from "./notify";
import { PAYMENT_ABANDON_PATH, PAYMENT_RETURN_PATH } from "./paths";
import {
  APP_REFUND,
  checkoutExpiry,
  eurosFromCents,
  feeCents,
  isRefundable,
  isSessionId,
  PAYMENTS_PAGE_SIZE,
  REFUNDABLE,
  refundFailed,
  refundKey,
  refundSync,
} from "./rules";
import { stripe } from "./stripe";

/**
 * The service fee (frais-de-service): the only reads and writes of `payments`
 * (bar the booking link `acceptAnswer` writes in its own transaction) and the
 * only calls to Stripe. « Accepter et réserver » opens a Checkout
 * (`startCheckout`); a paid Checkout books through `confirmPayment`, called
 * by the webhook and by the return page, whichever comes first (D-102); a
 * refund is always `refundFee` (D-94). Each rule of ./rules.ts is held again
 * in the SQL of the write it governs.
 */

const t = words(paiement);

function logError(what: string, context: Record<string, unknown>, error?: unknown): void {
  console.error(`[paiements] ${what}`, {
    ...context,
    ...(error === undefined
      ? {}
      : {
          error: error instanceof Error ? error.name : typeof error,
          // Drizzle wraps Postgres' error: its code (23505, 23514) is on the cause.
          code:
            (error as { code?: unknown } | null)?.code ??
            (error as { cause?: { code?: unknown } } | null)?.cause?.code,
        }),
  });
}


// ---------------------------------------------------------------------------
// Opening a Checkout
// ---------------------------------------------------------------------------

export type StartResult =
  | { kind: "stripe"; url: string }
  /** An earlier Checkout for this request turned out paid: confirm that one instead. */
  | { kind: "dejaPaye"; sessionId: string }
  | { kind: "refus"; reason: AcceptRefusal | "introuvable" | "conflit" }
  | { kind: "erreur" };

/**
 * « Confirmer et régler les frais de service » (D-102, D-92): the rules first,
 * exactly as a booking reads them; then the request's open Checkout, if any,
 * is closed; then a new one is opened at Stripe for 3 % of the answer's rate,
 * and recorded `en_attente`. Nothing about the request or its answers changes.
 */
export async function startCheckout(input: {
  user: { id: string; email: string };
  requestId: string;
  applicationId: string;
  siteUrl: string;
  now: Date;
}): Promise<StartResult> {
  const { user, requestId, applicationId, siteUrl, now } = input;
  const check = await acceptCheck(user.id, requestId, applicationId, now);
  if (!check.ok) return { kind: "refus", reason: check.reason };

  // A fee already paid for this request and still being settled: confirm it,
  // never charge a second one.
  const [inFlight] = await db
    .select({ stripeSessionId: payments.stripeSessionId })
    .from(payments)
    .where(and(eq(payments.requestId, requestId), eq(payments.status, "payee"), isNull(payments.bookingId)))
    .limit(1);
  if (inFlight) return { kind: "dejaPaye", sessionId: inFlight.stripeSessionId };

  // One open Checkout per request (D-92): the last one is closed first.
  const open = await db
    .select({ id: payments.id, stripeSessionId: payments.stripeSessionId })
    .from(payments)
    .where(and(eq(payments.requestId, requestId), eq(payments.status, "en_attente")));
  for (const row of open) {
    const closed = await closeCheckout(row);
    if (closed === "payee") return { kind: "dejaPaye", sessionId: row.stripeSessionId };
  }

  const id = randomUUID();
  const amountCents = feeCents(check.nightRateEur);
  const expiresAt = checkoutExpiry(now);
  const metadata = { payment_id: id, request_id: requestId, application_id: applicationId };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        locale: "fr",
        payment_method_types: ["card", "bancontact"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: amountCents,
              product_data: {
                name: t.checkout.produit,
                description: fill(t.checkout.description, { date: formatDate(check.nightDate) }),
              },
            },
          },
        ],
        customer_email: user.email,
        client_reference_id: id,
        metadata,
        payment_intent_data: { metadata },
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        success_url: `${siteUrl}${PAYMENT_RETURN_PATH}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}${PAYMENT_ABANDON_PATH}?paiement=${id}`,
      },
      { idempotencyKey: `frais-checkout-${id}` },
    );
  } catch (error) {
    logError("checkout not opened", { requestId, applicationId }, error);
    return { kind: "erreur" };
  }
  if (!session.url) {
    logError("checkout without a url", { requestId, sessionId: session.id });
    return { kind: "erreur" };
  }

  try {
    await db.insert(payments).values({
      id,
      requestId,
      applicationId,
      familyUserId: user.id,
      nightDate: check.nightDate,
      nightRateEur: check.nightRateEur,
      amountCents,
      stripeSessionId: session.id,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    // Two clicks racing: the other Checkout stands, this one is closed at once.
    await stripe()
      .checkout.sessions.expire(session.id)
      .catch((expireError: unknown) => logError("racing checkout not expired", { sessionId: session.id }, expireError));
    if (isUniqueViolation(error)) return { kind: "refus", reason: "conflit" };
    logError("payment not recorded", { requestId, sessionId: session.id }, error);
    return { kind: "erreur" };
  }

  return { kind: "stripe", url: session.url };
}

/**
 * Closes an open Checkout at Stripe and records it `expiree`. Stripe refuses to
 * expire one that is no longer open: read it then, and say whether it was paid
 * (the caller confirms it) or had expired on its own.
 */
async function closeCheckout(row: { id: string; stripeSessionId: string }): Promise<"expiree" | "payee"> {
  try {
    await stripe().checkout.sessions.expire(row.stripeSessionId);
  } catch (error) {
    const session = await stripe().checkout.sessions.retrieve(row.stripeSessionId);
    if (session.payment_status === "paid") return "payee";
    if (session.status !== "expired") {
      logError("checkout neither expired nor paid", { paymentId: row.id, status: session.status }, error);
      throw error;
    }
  }
  await db
    .update(payments)
    .set({ status: "expiree", updatedAt: new Date() })
    .where(and(eq(payments.id, row.id), eq(payments.status, "en_attente")));
  return "expiree";
}

// ---------------------------------------------------------------------------
// The payment lands
// ---------------------------------------------------------------------------

export type ConfirmResult =
  | { kind: "reservee"; bookingId: string; requestId: string | null }
  | { kind: "enCours"; requestId: string | null }
  | { kind: "remboursee"; requestId: string | null }
  /** Paid, not bookable, and Stripe refused the refund: the founders see it on /admin/paiements. */
  | { kind: "remboursementEnAttente"; requestId: string | null }
  | { kind: "nonPayee"; requestId: string | null }
  | { kind: "inconnue" };

/** What a payment already past `en_attente` means for the family coming back. */
function outcome(row: Pick<Payment, "status" | "bookingId" | "requestId">): ConfirmResult {
  const requestId = row.requestId;
  switch (row.status) {
    case "payee":
      return row.bookingId ? { kind: "reservee", bookingId: row.bookingId, requestId } : { kind: "enCours", requestId };
    case "remboursee":
      return row.bookingId ? { kind: "reservee", bookingId: row.bookingId, requestId } : { kind: "remboursee", requestId };
    // A refund Stripe refused is not a refund: the founders see it on /admin/paiements.
    case "remboursement_echoue":
      return row.bookingId
        ? { kind: "reservee", bookingId: row.bookingId, requestId }
        : { kind: "remboursementEnAttente", requestId };
    default:
      return { kind: "nonPayee", requestId };
  }
}

async function paymentBySession(sessionId: string): Promise<Payment | null> {
  const [row] = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId)).limit(1);
  return row ?? null;
}

function paymentIntentId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * The booking a paid Checkout makes, once (D-102, D-103). The session is read
 * from Stripe, never from the caller; a conditional update takes the payment
 * `en_attente → payee`. A paid payment with no booking yet is settled by
 * whoever comes: the webhook, the return page, its « Actualiser » link, or
 * Stripe's retry after a failure of ours. Settling is safe to repeat: the
 * booking holds its rules in SQL (one booking per request, only against this
 * paid row), the e-mails leave from the caller that made the booking, and the
 * refund has one Stripe idempotency key.
 */
export async function confirmPayment(sessionId: string, siteUrl: string, now: Date): Promise<ConfirmResult> {
  if (!isSessionId(sessionId)) return { kind: "inconnue" };
  const row = await paymentBySession(sessionId);
  if (!row) return { kind: "inconnue" };
  if (row.status === "payee" && !row.bookingId) return settle(row, siteUrl, now);
  if (row.status !== "en_attente" && row.status !== "expiree") return outcome(row);

  const session = await stripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    if (session.status === "expired") await markSession(sessionId, "expiree");
    return { kind: "nonPayee", requestId: row.requestId };
  }
  if (session.amount_total !== row.amountCents || session.currency !== row.currency) {
    logError("paid amount differs from the fee", { paymentId: row.id, amount: session.amount_total });
    throw new Error("paid amount differs from the fee");
  }

  const [taken] = await db
    .update(payments)
    .set({
      status: "payee",
      paidAt: now,
      stripePaymentIntentId: paymentIntentId(session.payment_intent),
      updatedAt: now,
    })
    .where(and(eq(payments.id, row.id), inArray(payments.status, ["en_attente", "expiree"])))
    .returning();
  if (!taken) {
    const again = await paymentBySession(sessionId);
    if (again?.status === "payee" && !again.bookingId) return settle(again, siteUrl, now);
    return again ? outcome(again) : { kind: "inconnue" };
  }
  return settle(taken, siteUrl, now);
}

/**
 * A paid fee without a booking: book it, or refund it when the booking can no
 * longer be made (D-103). A refusal is read again before refunding: another
 * caller may have just booked it, and a booked fee is never refunded here.
 */
async function settle(payment: Payment, siteUrl: string, now: Date): Promise<ConfirmResult> {
  const { requestId, applicationId, familyUserId } = payment;
  const booked =
    requestId && applicationId && familyUserId
      ? await acceptAnswer(familyUserId, requestId, applicationId, payment.id, now)
      : ({ ok: false, reason: "introuvable" } as const);

  if (booked.ok) {
    const { bookingId, declined } = booked;
    after(() => notifyBooking(bookingId, declined, siteUrl));
    return { kind: "reservee", bookingId, requestId };
  }

  const [current] = await db.select().from(payments).where(eq(payments.id, payment.id)).limit(1);
  if (!current) return { kind: "inconnue" };
  if (current.bookingId || current.status !== "payee") return outcome(current);

  const refund = await refundFee(payment.id, "reservation_impossible", now);
  if (!refund.ok) {
    // A paid fee neither booked nor refunded: never silent, the founders must see it.
    logError("paid fee neither booked nor refunded", { paymentId: payment.id, reason: refund.reason });
    const [again] = await db.select().from(payments).where(eq(payments.id, payment.id)).limit(1);
    return again ? outcome(again) : { kind: "inconnue" };
  }
  if (refund.status !== "remboursee") return { kind: "remboursementEnAttente", requestId };
  if (refund.recorded) after(() => notifyRefund(payment.id, siteUrl));
  return { kind: "remboursee", requestId };
}

/** The webhook's word on a Checkout that closed unpaid: `expiree` or `echouee`, only from `en_attente`. */
export async function markSession(sessionId: string, status: "expiree" | "echouee"): Promise<void> {
  if (!isSessionId(sessionId)) return;
  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(payments.stripeSessionId, sessionId), eq(payments.status, "en_attente")));
}

export type AbandonResult =
  | { kind: "abandonnee"; requestId: string | null }
  | { kind: "dejaPaye"; sessionId: string }
  | { kind: "inconnue" };

/**
 * « Retour » on Stripe's page (D-92): her own open Checkout is closed at once.
 * One that turned out paid in the meantime is confirmed instead.
 */
export async function abandonCheckout(paymentId: string, userId: string): Promise<AbandonResult> {
  if (!UUID.test(paymentId)) return { kind: "inconnue" };
  const [row] = await db
    .select({ id: payments.id, status: payments.status, stripeSessionId: payments.stripeSessionId, requestId: payments.requestId })
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.familyUserId, userId)))
    .limit(1);
  if (!row) return { kind: "inconnue" };
  if (row.status === "en_attente" && (await closeCheckout(row)) === "payee") {
    return { kind: "dejaPaye", sessionId: row.stripeSessionId };
  }
  return { kind: "abandonnee", requestId: row.requestId };
}

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

export type RefundResult =
  | {
      ok: true;
      status: Extract<PaymentStatus, "remboursee" | "remboursement_echoue">;
      /** False when another caller had already recorded this same refund. */
      recorded: boolean;
    }
  | { ok: false; reason: "introuvable" | "statut" };

/** Who asked for a refund from the back office, for the journal (D-101). */
export type RefundBy = { admin: Person; motif: string };

/**
 * The one refund (D-94): the whole fee, a `payee` payment only (or one whose
 * refund failed, to try again), one Stripe idempotency key per payment and
 * attempt, so however many callers ask, Stripe refunds once. It records the
 * refund's id, moment and reason; a refund asked from the back office writes
 * its `frais_rembourses` journal line in the same statement as the record, so
 * one is never without the other. A caller that finds this same refund already
 * recorded by another answers ok, and records nothing twice. It never touches
 * the booking: cancelling one is cycle-de-garde-et-annulation's, which calls
 * this with `annulation_professionnelle`.
 */
export async function refundFee(
  paymentId: string,
  reason: RefundReason,
  now: Date,
  by?: RefundBy,
): Promise<RefundResult> {
  const [row] = await db
    .select({
      payment: payments,
      family: { id: users.id, firstName: users.firstName, lastName: users.lastName },
    })
    .from(payments)
    .leftJoin(users, eq(users.id, payments.familyUserId))
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!row) return { ok: false, reason: "introuvable" };
  const { payment } = row;
  if (!isRefundable(payment.status) || !payment.stripePaymentIntentId) return { ok: false, reason: "statut" };

  const previous = payment.status === "remboursement_echoue" ? payment.stripeRefundId : null;
  const refund = await stripe().refunds.create(
    { payment_intent: payment.stripePaymentIntentId, metadata: { ...APP_REFUND, payment_id: payment.id } },
    { idempotencyKey: refundKey(payment.id, previous) },
  );
  const status = refundFailed(refund.status) ? "remboursement_echoue" : "remboursee";
  if (status === "remboursement_echoue") logError("refund failed at Stripe", { paymentId: payment.id });

  let recorded: boolean;
  if (by) {
    const family = row.family;
    const at = now.toISOString();
    const detail = fill(words(admin).paiements.detailJournal, {
      montant: eurosFromCents(payment.amountCents),
      motif: by.motif,
    });
    const written = await db.execute<{ id: string }>(sql`
      with done as (
        update payments
        set status = ${status}::payment_status, stripe_refund_id = ${refund.id}, refunded_at = ${at}::timestamptz,
            refund_reason = ${reason}::refund_reason, updated_at = ${at}::timestamptz
        where id = ${payment.id} and status in ('payee', 'remboursement_echoue') -- REFUNDABLE, ./rules.ts
        returning id
      )
      insert into admin_journal (occurred_at, action, subject_user_id, subject_name, admin_user_id, admin_name, detail)
      select ${at}::timestamptz, 'frais_rembourses'::admin_action, ${family?.id ?? null}::uuid,
             ${family ? `${family.firstName} ${family.lastName}`.trim() : null}, ${by.admin.id}::uuid,
             ${by.admin.name}, ${detail}
      from done
      returning id
    `);
    recorded = written.rows.length > 0;
  } else {
    const updated = await db
      .update(payments)
      .set({ status, stripeRefundId: refund.id, refundedAt: now, refundReason: reason, updatedAt: now })
      .where(and(eq(payments.id, payment.id), inArray(payments.status, [...REFUNDABLE])))
      .returning({ id: payments.id });
    recorded = updated.length > 0;
  }

  if (!recorded) {
    // Another caller got there first: fine if it recorded this very refund.
    const [again] = await db
      .select({ stripeRefundId: payments.stripeRefundId })
      .from(payments)
      .where(eq(payments.id, payment.id))
      .limit(1);
    if (again?.stripeRefundId !== refund.id) return { ok: false, reason: "statut" };
  }
  return { ok: true, status, recorded };
}

/**
 * A refund Stripe reports (webhook, D-101): one made in the dashboard is
 * recorded `remboursee`, reason `stripe`; a failure of the refund the row
 * carries marks it `remboursement_echoue`. The app's own refunds are left to
 * `refundFee`.
 */
export async function syncRefund(refund: Stripe.Refund): Promise<void> {
  const intent = paymentIntentId(refund.payment_intent);
  if (!intent) return;
  const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, intent)).limit(1);
  if (!payment) return;

  const sync = refundSync(payment, {
    id: refund.id,
    status: refund.status,
    fromApp: refund.metadata?.source === APP_REFUND.source,
  });
  if (sync.kind === "dashboard") {
    const at = new Date(refund.created * 1000);
    await db
      .update(payments)
      .set({ status: "remboursee", stripeRefundId: refund.id, refundedAt: at, refundReason: "stripe", updatedAt: new Date() })
      .where(and(eq(payments.id, payment.id), eq(payments.status, "payee")));
  } else if (sync.kind === "echec") {
    await db
      .update(payments)
      .set({ status: "remboursement_echoue", updatedAt: new Date() })
      .where(
        and(eq(payments.id, payment.id), eq(payments.status, "remboursee"), eq(payments.stripeRefundId, refund.id)),
      );
    logError("refund failed at Stripe", { paymentId: payment.id });
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Whose payment a session is, and for which request: to check who is coming back from Stripe. */
export async function paymentOwner(
  sessionId: string,
): Promise<{ familyUserId: string | null; requestId: string | null } | null> {
  if (!isSessionId(sessionId)) return null;
  const row = await paymentBySession(sessionId);
  return row ? { familyUserId: row.familyUserId, requestId: row.requestId } : null;
}

export type BookingFee = { id: string; status: PaymentStatus; amountCents: number };

/**
 * The fee that made each of these bookings, by booking id: a cancelled garde's
 * page says whether it was refunded, the professional's cancellation refunds it
 * (cycle-de-garde-et-annulation, D-2), the founders' absences list shows it. A
 * booking made before the fee existed has none.
 */
export async function bookingFees(bookingIds: string[]): Promise<Map<string, BookingFee>> {
  const ids = bookingIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      bookingId: payments.bookingId,
      id: payments.id,
      status: payments.status,
      amountCents: payments.amountCents,
    })
    .from(payments)
    .where(inArray(payments.bookingId, ids));
  return new Map(
    rows.flatMap(({ bookingId, ...fee }) => (bookingId ? [[bookingId, fee] as const] : [])),
  );
}

export type AdminPayment = Pick<
  Payment,
  | "id"
  | "createdAt"
  | "nightDate"
  | "nightRateEur"
  | "amountCents"
  | "status"
  | "expiresAt"
  | "stripePaymentIntentId"
  | "refundedAt"
  | "refundReason"
> & {
  family: string | null;
  professional: string | null;
};

const professionalUser = alias(users, "professional_user");

/** One page of every fee, newest first, for the founders (D-93). */
export async function readPayments(page: number): Promise<{ rows: AdminPayment[]; pages: number }> {
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: payments.id,
        createdAt: payments.createdAt,
        nightDate: payments.nightDate,
        nightRateEur: payments.nightRateEur,
        amountCents: payments.amountCents,
        status: payments.status,
        expiresAt: payments.expiresAt,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        refundedAt: payments.refundedAt,
        refundReason: payments.refundReason,
        familyFirstName: users.firstName,
        familyLastName: users.lastName,
        professional: professionalUser.firstName,
      })
      .from(payments)
      .leftJoin(users, eq(users.id, payments.familyUserId))
      .leftJoin(careRequestApplications, eq(careRequestApplications.id, payments.applicationId))
      .leftJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
      .leftJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
      .orderBy(desc(payments.createdAt), desc(payments.id))
      .limit(PAYMENTS_PAGE_SIZE)
      .offset((page - 1) * PAYMENTS_PAGE_SIZE),
    db.select({ n: count() }).from(payments),
  ]);
  return {
    rows: rows.map(({ familyFirstName, familyLastName, ...rest }) => ({
      ...rest,
      family: familyFirstName === null ? null : `${familyFirstName} ${familyLastName ?? ""}`.trim(),
    })),
    pages: Math.max(1, Math.ceil(total.n / PAYMENTS_PAGE_SIZE)),
  };
}
