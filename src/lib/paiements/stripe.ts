import "server-only";

import Stripe from "stripe";

/**
 * The one Stripe client, on the server only (D-100). It is created on first
 * use, so importing this module (the build collecting server actions) never
 * needs the key; a call without `STRIPE_SECRET_KEY` throws, and the family
 * reads the generic « page de paiement » error. The API version is pinned to
 * the one this SDK's types describe, so a Stripe dashboard upgrade never
 * changes what the code reads. Test keys on UAT and previews, live keys on
 * Production only.
 */

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set — payments are unavailable. See .env.example.");
  }
  client = new Stripe(key, { apiVersion: "2026-08-26.dahlia", maxNetworkRetries: 2 });
  return client;
}

/** The signing secret of this environment's webhook endpoint (UAT, Production). */
export function webhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set — the webhook cannot verify Stripe. See .env.example.");
  return secret;
}
