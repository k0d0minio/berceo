import { eq } from "drizzle-orm";

import { db, users } from "@/db";
import { authBaseUrl } from "@/lib/auth/server";
import { handleNeonAuthWebhook, type Jwk } from "@/lib/auth/webhook";
import { sendEmail } from "@/lib/email/send";

/*
 * Neon Auth calls this for every verification and reset link (the branch's
 * webhook config subscribes `send.magic_link` to this URL), and skips its own
 * e-mail. The logic and its tests are in src/lib/auth/webhook.ts; this file
 * wires it to the JWKS, the database and Resend.
 */

export const dynamic = "force-dynamic";

// The branch's signing keys, cached; refetched when an unknown key id shows
// up (key rotation), at most once a minute.
let keys: Jwk[] = [];
let fetchedAt = 0;

async function keyFor(kid: string): Promise<Jwk | null> {
  const cached = keys.find((key) => key.kid === kid);
  if (cached) return cached;
  if (Date.now() - fetchedAt < 60_000) return null;

  fetchedAt = Date.now();
  const response = await fetch(`${authBaseUrl()}/.well-known/jwks.json`, { cache: "no-store" });
  // An unreachable JWKS is our failure, not a bad signature: throw, so the
  // route answers 500 and Neon retries instead of dropping the e-mail.
  if (!response.ok) {
    fetchedAt = 0;
    throw new Error(`JWKS fetch failed: HTTP ${response.status}`);
  }
  keys = ((await response.json()) as { keys?: Jwk[] }).keys ?? [];
  return keys.find((key) => key.kid === kid) ?? null;
}

async function firstNameFor(email: string): Promise<string | null> {
  const [row] = await db
    .select({ firstName: users.firstName })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return row?.firstName ?? null;
}

// Neon retries within 15 seconds; this instance remembers what it sent.
const seen = new Set<string>();

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (seen.size > 1000) seen.clear();

  try {
    const result = await handleNeonAuthWebhook(
      rawBody,
      request.headers,
      new URL(request.url).origin,
      { keyFor, firstNameFor, send: sendEmail, now: Date.now, seen },
    );
    return new Response(null, { status: result.status });
  } catch (error) {
    // A 5xx makes Neon retry, then fail the auth flow visibly: never a silent loss.
    console.error("[comptes] neon-auth webhook failed", error);
    return new Response(null, { status: 500 });
  }
}
