import "server-only";

import { randomUUID } from "node:crypto";

import { and, count, desc, eq, gte, inArray, isNull, sql, type SQL } from "drizzle-orm";
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
import { journalInsertAfter, type Person } from "@/lib/admin/journal";
import {
  confirmHoldStatement,
  creditPartHeld,
  feeHasLiveCredit,
  holdStatements,
  isHoldConflict,
  planCreditPart,
  releaseHoldOfSessionStatement,
  releaseHoldStatement,
  type CreditPart,
} from "@/lib/credits/credits";
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
 * fee's calls to Stripe (the subscriptions make theirs in
 * `src/lib/abonnements/`). « Accepter et réserver » opens a Checkout
 * (`startCheckout`); a paid Checkout books through `confirmPayment`, called
 * by the webhook and by the return page, whichever comes first (D-102); a
 * refund is always `refundFee` (D-94). Each rule of ./rules.ts is held again
 * in the SQL of the write it governs.
 *
 * A family's Berceo credit pays first (credits-au-paiement). A balance that
 * covers the fee writes it `payee` with no Checkout, and books at once. A
 * smaller one is held by the open Checkout, which asks the rest. Every way out
 * of `en_attente` but the payment, and every refund, gives the held part back
 * in the statement batch that writes the status (`src/lib/credits/`).
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
  /** Her credit paid the whole fee: no Checkout, the fee was settled at once. */
  | { kind: "credit"; result: ConfirmResult }
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
    .select()
    .from(payments)
    .where(and(eq(payments.requestId, requestId), eq(payments.status, "payee"), isNull(payments.bookingId)))
    .limit(1);
  if (inFlight) {
    // A fee her credit paid whole has no Checkout to come back from: settle it here.
    if (!inFlight.stripeSessionId) return { kind: "credit", result: await settle(inFlight, siteUrl, now) };
    return { kind: "dejaPaye", sessionId: inFlight.stripeSessionId };
  }

  // One open Checkout per request (D-92): the last one is closed first.
  const open = await openCheckouts(eq(payments.requestId, requestId));
  for (const row of open) {
    const closed = await closeCheckout(row);
    if (closed === "payee") return { kind: "dejaPaye", sessionId: row.stripeSessionId };
  }
  // Her other Checkouts past their expiry still hold credit when no webhook said so
  // (previews never get it, D-92): close them, so her balance is whole again.
  await releaseStaleHolds(user.id, siteUrl, now);

  const id = randomUUID();
  const amountCents = feeCents(check.nightRateEur);
  const part = await planCreditPart(user.id, amountCents, now);
  if (part.creditCents === amountCents) {
    return payWithCredit({ id, user, requestId, applicationId, check, amountCents, part, siteUrl, now });
  }

  const chargeCents = amountCents - part.creditCents;
  const expiresAt = checkoutExpiry(now);
  const metadata = { payment_id: id, request_id: requestId, application_id: applicationId };
  const date = formatDate(check.nightDate);

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
              unit_amount: chargeCents,
              product_data: {
                name: t.checkout.produit,
                description:
                  part.creditCents > 0
                    ? fill(t.checkout.descriptionCredit, {
                        date,
                        montant: fill(t.recapitulatif.montant, { montant: eurosFromCents(part.creditCents) }),
                      })
                    : fill(t.checkout.description, { date }),
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
    // The fee and the credit it holds land together, or neither does.
    await db.batch([
      db.insert(payments).values({
        id,
        requestId,
        applicationId,
        familyUserId: user.id,
        nightDate: check.nightDate,
        nightRateEur: check.nightRateEur,
        amountCents,
        creditCents: part.creditCents,
        stripeSessionId: session.id,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      }),
      ...holdStatements(part, id, "reservee", now).map((statement) => db.execute(statement)),
    ]);
  } catch (error) {
    // Two clicks racing: the other Checkout stands, this one is closed at once.
    await stripe()
      .checkout.sessions.expire(session.id)
      .catch((expireError: unknown) => logError("racing checkout not expired", { sessionId: session.id }, expireError));
    if (isUniqueViolation(error)) return { kind: "refus", reason: "conflit" };
    // Her credit changed between the plan and the hold (another tab): she tries again.
    if (isHoldConflict(error)) logError("credit changed before the hold", { requestId });
    else logError("payment not recorded", { requestId, sessionId: session.id }, error);
    return { kind: "erreur" };
  }

  return { kind: "stripe", url: session.url };
}

/**
 * Her credit covers the fee (credits-au-paiement): the fee is written `payee`
 * with no Checkout, and its credit part confirmed, in one batch. Then it is
 * settled like a paid Checkout: booked, or its credit given back when the
 * booking can no longer be made (D-103).
 */
async function payWithCredit(input: {
  id: string;
  user: { id: string };
  requestId: string;
  applicationId: string;
  check: { nightDate: string; nightRateEur: number };
  amountCents: number;
  part: CreditPart;
  siteUrl: string;
  now: Date;
}): Promise<StartResult> {
  const { id, user, requestId, applicationId, check, amountCents, part, siteUrl, now } = input;
  let payment: Payment | undefined;
  try {
    const [inserted] = await db.batch([
      db
        .insert(payments)
        .values({
          id,
          requestId,
          applicationId,
          familyUserId: user.id,
          nightDate: check.nightDate,
          nightRateEur: check.nightRateEur,
          amountCents,
          creditCents: amountCents,
          stripeSessionId: null,
          status: "payee",
          paidAt: now,
          expiresAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning(),
      ...holdStatements(part, id, "confirmee", now).map((statement) => db.execute(statement)),
    ]);
    payment = inserted[0];
  } catch (error) {
    if (isUniqueViolation(error)) return { kind: "refus", reason: "conflit" };
    if (isHoldConflict(error)) logError("credit changed before the hold", { requestId });
    else logError("credit payment not recorded", { requestId }, error);
    return { kind: "erreur" };
  }
  if (!payment) return { kind: "erreur" };
  return { kind: "credit", result: await settle(payment, siteUrl, now) };
}

type OpenCheckout = { id: string; stripeSessionId: string };

/** The open Checkouts that match `where`. Each one has a session: a fee with none is never open. */
async function openCheckouts(where: SQL | undefined): Promise<OpenCheckout[]> {
  const rows = await db
    .select({ id: payments.id, stripeSessionId: payments.stripeSessionId })
    .from(payments)
    .where(and(eq(payments.status, "en_attente"), where));
  return rows.flatMap((row) => (row.stripeSessionId ? [{ id: row.id, stripeSessionId: row.stripeSessionId }] : []));
}

/**
 * Her open Checkouts past their expiry that hold credit: closed at Stripe and
 * released, or confirmed when one turns out paid.
 */
async function releaseStaleHolds(familyUserId: string, siteUrl: string, now: Date): Promise<void> {
  const stale = await openCheckouts(
    and(
      eq(payments.familyUserId, familyUserId),
      sql`${payments.creditCents} > 0`,
      sql`${payments.expiresAt} <= ${now.toISOString()}::timestamptz`,
    ),
  );
  for (const row of stale) {
    if ((await closeCheckout(row)) === "payee") await confirmPayment(row.stripeSessionId, siteUrl, now);
  }
}

/**
 * Closes an open Checkout at Stripe and records it `expiree`. Stripe refuses to
 * expire one that is no longer open: read it then, and say whether it was paid
 * (the caller confirms it) or had expired on its own.
 */
async function closeCheckout(row: OpenCheckout): Promise<"expiree" | "payee"> {
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
  const now = new Date();
  await db.batch([
    db
      .update(payments)
      .set({ status: "expiree", updatedAt: now })
      .where(and(eq(payments.id, row.id), eq(payments.status, "en_attente"))),
    db.execute(releaseHoldStatement(row.id, now)),
  ]);
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
  // Stripe asked only what her credit did not pay (credits-au-paiement).
  if (session.amount_total !== row.amountCents - row.creditCents || session.currency !== row.currency) {
    logError("paid amount differs from the fee", { paymentId: row.id, amount: session.amount_total });
    throw new Error("paid amount differs from the fee");
  }

  const [[taken]] = await db.batch([
    db
      .update(payments)
      .set({
        status: "payee",
        paidAt: now,
        stripePaymentIntentId: paymentIntentId(session.payment_intent),
        updatedAt: now,
      })
      .where(and(eq(payments.id, row.id), inArray(payments.status, ["en_attente", "expiree"])))
      .returning(),
    db.execute(confirmHoldStatement(row.id, now)),
  ]);
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
  // A Checkout that closed, gave its credit back, then turned out paid holds too
  // little: it books nothing, and its card part is refunded (credits-au-paiement).
  const held = await creditPartHeld(payment.id, payment.creditCents);
  const booked =
    held && requestId && applicationId && familyUserId
      ? await acceptAnswer(familyUserId, requestId, applicationId, payment.id, now)
      : ({ ok: false, reason: "introuvable" } as const);

  if (booked.ok) {
    const { bookingId, declined } = booked;
    const fee = { amountCents: payment.amountCents, creditCents: payment.creditCents };
    after(() => notifyBooking(bookingId, declined, siteUrl, fee));
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
  const now = new Date();
  await db.batch([
    db
      .update(payments)
      .set({ status, updatedAt: now })
      .where(and(eq(payments.stripeSessionId, sessionId), eq(payments.status, "en_attente"))),
    // Her credit held by this Checkout goes back to her (credits-au-paiement).
    db.execute(releaseHoldOfSessionStatement(sessionId, now)),
  ]);
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
  const { stripeSessionId } = row;
  if (row.status === "en_attente" && stripeSessionId && (await closeCheckout({ id: row.id, stripeSessionId })) === "payee") {
    return { kind: "dejaPaye", sessionId: stripeSessionId };
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
  | { ok: false; reason: "introuvable" | "statut" | "credit" };

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
 * the booking. A fee that became a live credit is refused before Stripe
 * (annulations-table): one fee is never both credited and refunded. No end of a
 * garde calls it any more; `annulation_professionnelle` stays for the fees
 * refunded before the founders' table.
 *
 * A fee a credit paid in part refunds its card part at Stripe, and its credit
 * part goes back to the credit it came from (credits-au-paiement, Jamie
 * 2026-10-29). A fee the credit paid whole calls no Stripe: the record gives
 * the credit back alone. A credit is never refunded to a card.
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
      credited: feeHasLiveCredit(payments.id),
    })
    .from(payments)
    .leftJoin(users, eq(users.id, payments.familyUserId))
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!row) return { ok: false, reason: "introuvable" };
  const { payment } = row;
  const cardCents = payment.amountCents - payment.creditCents;
  if (!isRefundable(payment.status)) return { ok: false, reason: "statut" };
  if (cardCents > 0 && !payment.stripePaymentIntentId) return { ok: false, reason: "statut" };
  if (row.credited) return { ok: false, reason: "credit" };

  let refund: { id: string | null; status: string | null } = { id: null, status: null };
  if (cardCents > 0 && payment.stripePaymentIntentId) {
    const previous = payment.status === "remboursement_echoue" ? payment.stripeRefundId : null;
    // The PaymentIntent holds the card part only: Stripe refunds that, never the credit.
    const made = await stripe().refunds.create(
      { payment_intent: payment.stripePaymentIntentId, metadata: { ...APP_REFUND, payment_id: payment.id } },
      { idempotencyKey: refundKey(payment.id, previous) },
    );
    refund = { id: made.id, status: made.status };
  }
  const status = refundFailed(refund.status) ? "remboursement_echoue" : "remboursee";
  if (status === "remboursement_echoue") logError("refund failed at Stripe", { paymentId: payment.id });

  let recorded: boolean;
  if (by) {
    const family = row.family;
    const detail = fill(words(admin).paiements.detailJournal, {
      montant: eurosFromCents(payment.amountCents),
      motif: by.motif,
    });
    const at = now.toISOString();
    const written = await journalInsertAfter(
      sql`done as (
        update payments
        set status = ${status}::payment_status, stripe_refund_id = ${refund.id}, refunded_at = ${at}::timestamptz,
            refund_reason = ${reason}::refund_reason, updated_at = ${at}::timestamptz
        where id = ${payment.id} and status in ('payee', 'remboursement_echoue') -- REFUNDABLE, ./rules.ts
        returning id
      )`,
      "done",
      {
        action: "frais_rembourses",
        subject: family ? { id: family.id, name: `${family.firstName} ${family.lastName}`.trim() } : null,
        admin: by.admin,
        detail,
        at: now,
      },
    );
    recorded = written.rows.length > 0;
    // The journal's statement is one; the credit part follows it, guarded on the status it wrote.
    if (payment.creditCents > 0) await db.execute(releaseHoldStatement(payment.id, now));
  } else {
    const [updated] = await db.batch([
      db
        .update(payments)
        .set({ status, stripeRefundId: refund.id, refundedAt: now, refundReason: reason, updatedAt: now })
        .where(and(eq(payments.id, payment.id), inArray(payments.status, [...REFUNDABLE])))
        .returning({ id: payments.id }),
      db.execute(releaseHoldStatement(payment.id, now)),
    ]);
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
    const now = new Date();
    await db.batch([
      db
        .update(payments)
        .set({ status: "remboursee", stripeRefundId: refund.id, refundedAt: at, refundReason: "stripe", updatedAt: now })
        .where(and(eq(payments.id, payment.id), eq(payments.status, "payee"))),
      // A refund made in Stripe's dashboard gives the credit part back too (credits-au-paiement).
      db.execute(releaseHoldStatement(payment.id, now)),
    ]);
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

export type BookingFee = {
  id: string;
  status: PaymentStatus;
  amountCents: number;
  /** The part a Berceo credit paid (credits-au-paiement). */
  creditCents: number;
};

/**
 * The fee that made each of these bookings, by booking id: a cancelled garde's
 * page says what became of it, the founders' list of reports shows it. A
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
      creditCents: payments.creditCents,
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
  | "creditCents"
  | "status"
  | "expiresAt"
  | "stripePaymentIntentId"
  | "refundedAt"
  | "refundReason"
> & {
  family: string | null;
  professional: string | null;
  /** Owed back to the family after the professional cancelled (D-162). */
  toRefund: boolean;
  /** Turned into a live credit by the founders' table (annulations-table): never refunded on top. */
  credited: boolean;
};

const professionalUser = alias(users, "professional_user");

/**
 * The fees paid at or after `since` (back-office-admin, D-133): the overview's
 * « Paiements récents » counts with this condition and its link lists with it,
 * so the number and the list cannot disagree. No `since`, every payment.
 */
function paidSince(since: Date | null) {
  return since ? gte(payments.paidAt, since) : undefined;
}

/**
 * A fee Berceo still owes (D-162): refundable, its booking cancelled by the
 * professional, kind `annulation` (D-2), and no live credit made of it. Since
 * the founders' table (annulations-table) such a cancellation turns the fee
 * into a credit, so only a cancellation made before it still waits here. An
 * absence is the founders' call (D-106), never flagged. The row mark, the
 * « À rembourser » filter and the overview's count all read this one
 * condition (D-133, D-164).
 */
function awaitingRefund() {
  return sql<boolean>`(${inArray(payments.status, [...REFUNDABLE])} and exists (
    select 1 from bookings as rb
    where rb.id = ${payments.bookingId}
      and rb.status = 'annulee'
      and rb.cancelled_by = 'professionnelle'
      and rb.cancellation_kind = 'annulation'
  ) and not ${feeHasLiveCredit(payments.id)})`;
}

/** How many fees Berceo still owes: the overview's « frais à rembourser » line. */
export async function awaitingRefundCount(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(payments).where(awaitingRefund());
  return row?.n ?? 0;
}

/** How many fees were paid at or after `since`: the overview's « Paiements récents ». */
export async function paymentCountSince(since: Date): Promise<number> {
  const [row] = await db.select({ n: count() }).from(payments).where(paidSince(since));
  return row?.n ?? 0;
}

/**
 * One page of the fees, newest first, for the founders (D-93): every fee, the
 * ones paid since a moment (D-133), or only the ones to refund (D-164).
 */
export type PaymentsView = { kind: "tous" } | { kind: "depuis"; since: Date } | { kind: "aRembourser" };

function viewWhere(view: PaymentsView) {
  if (view.kind === "depuis") return paidSince(view.since);
  if (view.kind === "aRembourser") return awaitingRefund();
  return undefined;
}

export async function readPayments(
  page: number,
  view: PaymentsView = { kind: "tous" },
): Promise<{ rows: AdminPayment[]; pages: number }> {
  const where = viewWhere(view);
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: payments.id,
        createdAt: payments.createdAt,
        nightDate: payments.nightDate,
        nightRateEur: payments.nightRateEur,
        amountCents: payments.amountCents,
        creditCents: payments.creditCents,
        status: payments.status,
        expiresAt: payments.expiresAt,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        refundedAt: payments.refundedAt,
        refundReason: payments.refundReason,
        familyFirstName: users.firstName,
        familyLastName: users.lastName,
        professional: professionalUser.firstName,
        toRefund: awaitingRefund(),
        credited: feeHasLiveCredit(payments.id),
      })
      .from(payments)
      .leftJoin(users, eq(users.id, payments.familyUserId))
      .leftJoin(careRequestApplications, eq(careRequestApplications.id, payments.applicationId))
      .leftJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
      .leftJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
      .where(where)
      .orderBy(desc(payments.createdAt), desc(payments.id))
      .limit(PAYMENTS_PAGE_SIZE)
      .offset((page - 1) * PAYMENTS_PAGE_SIZE),
    db.select({ n: count() }).from(payments).where(where),
  ]);
  return {
    rows: rows.map(({ familyFirstName, familyLastName, ...rest }) => ({
      ...rest,
      family: familyFirstName === null ? null : `${familyFirstName} ${familyLastName ?? ""}`.trim(),
    })),
    pages: Math.max(1, Math.ceil(total.n / PAYMENTS_PAGE_SIZE)),
  };
}
