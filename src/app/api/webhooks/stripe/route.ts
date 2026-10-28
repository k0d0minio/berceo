import {
  confirmSubscriptionCheckout,
  markCheckoutExpired,
  syncFromInvoice,
  syncSubscription,
} from "@/lib/abonnements/subscriptions";
import { confirmPayment, markSession, syncRefund } from "@/lib/paiements/payments";
import { verifiedEvent } from "@/lib/paiements/signature";
import { webhookSecret } from "@/lib/paiements/stripe";
import { siteOrigin } from "@/lib/site-origin";

/*
 * Stripe calls this for the fee's Checkouts and refunds (frais-de-service)
 * and for the family subscriptions (abonnements-catalogue-stripe). The
 * endpoint is registered per environment in Stripe's dashboard (UAT with
 * the test account, Production with the live one, D-100) for these events:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired,
 * refund.created, refund.updated, refund.failed,
 * customer.subscription.created, customer.subscription.updated,
 * customer.subscription.deleted, invoice.paid, invoice.payment_failed.
 * A Checkout in subscription mode goes to the subscriptions, every other
 * Checkout to the fee.
 *
 * Nothing is read before the signature is checked on the raw body: an
 * unsigned or wrongly signed call answers 400 and touches nothing. Every
 * handler is idempotent, so Stripe's retries and a replayed event change
 * nothing twice (D-102). A failure of ours answers 500, and Stripe retries.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let secret: string;
  try {
    secret = webhookSecret();
  } catch (error) {
    console.error("[paiements] webhook not configured", { error: error instanceof Error ? error.name : typeof error });
    return new Response(null, { status: 500 });
  }

  const body = await request.text();
  const event = verifiedEvent(body, request.headers.get("stripe-signature"), secret);
  if (!event) return new Response(null, { status: 400 });

  try {
    const now = new Date();
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object;
        if (session.mode === "subscription") {
          if (event.type === "checkout.session.expired") await markCheckoutExpired(session.id, now);
          else await confirmSubscriptionCheckout(session.id, now);
        } else if (event.type === "checkout.session.expired") {
          await markSession(session.id, "expiree");
        } else if (event.type === "checkout.session.async_payment_failed") {
          await markSession(session.id, "echouee");
        } else if (session.payment_status === "paid") {
          await confirmPayment(session.id, await siteOrigin(), now);
        }
        break;
      }
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        await syncRefund(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object.id, now);
        break;
      case "invoice.paid":
      case "invoice.payment_failed":
        await syncFromInvoice(event.data.object, now);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[paiements] webhook event not handled", {
      eventId: event.id,
      type: event.type,
      error: error instanceof Error ? error.name : typeof error,
    });
    return new Response(null, { status: 500 });
  }

  return Response.json({ received: true });
}

