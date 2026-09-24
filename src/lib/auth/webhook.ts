import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

import {
  resetPasswordEmail,
  verificationEmail,
  type RenderedEmail,
} from "@/lib/email/templates";

/**
 * Neon Auth's webhook, verified and handled. Neon signs each delivery with
 * Ed25519 as a detached JWS (`header..signature`) over
 * `base64url(timestamp + "." + base64url(rawBody))`, with the public key in the
 * branch's JWKS. An unsigned, wrongly signed or stale request is refused (401)
 * and sends nothing.
 *
 * Only `send.magic_link` is subscribed (D-30: links, not codes). The e-mail
 * carries our own URL built from the raw token, so following it lands on this
 * site, where the session cookie can be set:
 * - `email-verification` → /verification-email/confirmer?token=…
 * - `forget-password` → /nouveau-mot-de-passe?token=…
 *
 * Everything the handler touches outside itself is passed in, so the tests can
 * run it without a network, a database or Resend.
 */

export const MAX_AGE_MS = 5 * 60 * 1000;

export type Jwk = JsonWebKey & { kid?: string };

export class WebhookRejected extends Error {}

function b64url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export type SignatureHeaders = {
  signature: string | null;
  kid: string | null;
  timestamp: string | null;
};

export function signatureHeaders(headers: Headers): SignatureHeaders {
  return {
    signature: headers.get("x-neon-signature"),
    kid: headers.get("x-neon-signature-kid"),
    timestamp: headers.get("x-neon-timestamp"),
  };
}

/** Throws `WebhookRejected` unless the body was signed by `jwk` less than five minutes ago. */
export function verifySignature(
  rawBody: string,
  { signature, timestamp }: SignatureHeaders,
  jwk: Jwk,
  now: number,
): void {
  if (!signature || !timestamp) throw new WebhookRejected("missing signature headers");

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt) || Math.abs(now - sentAt) > MAX_AGE_MS) {
    throw new WebhookRejected("stale or malformed timestamp");
  }

  const [headerB64, detached, signatureB64] = signature.split(".");
  if (!headerB64 || detached !== "" || !signatureB64) {
    throw new WebhookRejected("not a detached JWS");
  }

  const signingInput = `${headerB64}.${b64url(`${timestamp}.${b64url(rawBody)}`)}`;
  let valid = false;
  try {
    const key = createPublicKey({ key: jwk, format: "jwk" });
    valid = verify(null, Buffer.from(signingInput), key, Buffer.from(signatureB64, "base64url"));
  } catch {
    valid = false;
  }
  if (!valid) throw new WebhookRejected("bad signature");
}

type MagicLinkEvent = {
  event_id: string;
  event_type: "send.magic_link";
  user?: { email?: string; name?: string | null };
  event_data: { link_type: string; token: string };
};

export type WebhookDeps = {
  /** The key for `kid`, or null when the JWKS has none. */
  keyFor: (kid: string) => Promise<Jwk | null>;
  /** The first name on the `users` row for this address, if the row exists yet. */
  firstNameFor: (email: string) => Promise<string | null>;
  send: (to: string, email: RenderedEmail, idempotencyKey: string) => Promise<void>;
  now: () => number;
  /** Event ids already handled by this instance (Resend's key covers the rest). */
  seen: Set<string>;
};

export type WebhookResult = { status: 200 | 401 | 400; sent: boolean };

/**
 * The sign-up's `users` row is written after Neon Auth answers, and Neon calls
 * this webhook before it answers, so on the very first e-mail the row may not
 * exist yet: fall back to the first word of the name given to Neon Auth.
 */
async function prenomFor(event: MagicLinkEvent, deps: WebhookDeps): Promise<string | null> {
  const email = event.user?.email;
  const fromRow = email ? await deps.firstNameFor(email) : null;
  if (fromRow) return fromRow;
  const fromName = event.user?.name?.trim().split(/\s+/)[0];
  return fromName || null;
}

export async function handleNeonAuthWebhook(
  rawBody: string,
  headers: Headers,
  siteUrl: string,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  const sig = signatureHeaders(headers);
  try {
    if (!sig.kid) throw new WebhookRejected("missing key id");
    const jwk = await deps.keyFor(sig.kid);
    if (!jwk) throw new WebhookRejected("unknown key id");
    verifySignature(rawBody, sig, jwk, deps.now());
  } catch (error) {
    if (error instanceof WebhookRejected) return { status: 401, sent: false };
    throw error;
  }

  let event: { event_id?: string; event_type?: string };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { status: 400, sent: false };
  }

  if (event.event_type !== "send.magic_link" || !event.event_id) {
    return { status: 200, sent: false };
  }
  const magic = event as MagicLinkEvent;
  const to = magic.user?.email;
  const token = magic.event_data?.token;
  if (!to || !token) return { status: 400, sent: false };

  if (deps.seen.has(magic.event_id)) return { status: 200, sent: false };

  const prenom = await prenomFor(magic, deps);
  const withToken = (path: string) => `${siteUrl}${path}?token=${encodeURIComponent(token)}`;

  let email: RenderedEmail;
  switch (magic.event_data.link_type) {
    case "email-verification":
      email = verificationEmail({ siteUrl, prenom, url: withToken("/verification-email/confirmer") });
      break;
    case "forget-password":
      email = resetPasswordEmail({ siteUrl, prenom, url: withToken("/nouveau-mot-de-passe") });
      break;
    default:
      // Magic-link sign-in is not offered; nothing to send.
      return { status: 200, sent: false };
  }

  await deps.send(to, email, `neon-auth-${magic.event_id}`);
  deps.seen.add(magic.event_id);
  return { status: 200, sent: true };
}
