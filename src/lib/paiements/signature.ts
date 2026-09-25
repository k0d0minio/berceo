import Stripe from "stripe";

/**
 * The webhook's first act (D-90): an event is read only from a body Stripe
 * signed with this endpoint's secret. `null` for anything else, a missing
 * header, a wrong signature, a body altered after signing, or a timestamp
 * older than Stripe's five-minute tolerance: the route answers 400 and
 * touches nothing. The body must be the raw text, never re-serialised JSON.
 * Pure (no network, no key), so the tests sign their own events.
 */
export function verifiedEvent(body: string, signature: string | null, secret: string): Stripe.Event | null {
  if (!signature || !secret) return null;
  try {
    return Stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return null;
  }
}
