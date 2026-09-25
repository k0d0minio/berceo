import { confirmPayment, markSession, syncRefund } from "@/lib/paiements/payments";
import { verifiedEvent } from "@/lib/paiements/signature";
import { webhookSecret } from "@/lib/paiements/stripe";
import { siteOrigin } from "@/lib/site-origin";

/*
 * Stripe calls this for the fee's Checkouts and refunds (frais-de-service).
 * The endpoint is registered per environment in Stripe's dashboard (UAT with
 * the test account, Production with the live one, D-100) for these events:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired,
 * refund.created, refund.updated, refund.failed.
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
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "paid") await confirmPayment(session.id, await siteOrigin(), new Date());
        break;
      }
      case "checkout.session.expired":
        await markSession(event.data.object.id, "expiree");
        break;
      case "checkout.session.async_payment_failed":
        await markSession(event.data.object.id, "echouee");
        break;
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        await syncRefund(event.data.object);
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
