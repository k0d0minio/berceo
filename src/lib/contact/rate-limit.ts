import { createHmac } from "node:crypto";

/*
 * The contact form's send limit (JAM-341, Jamie, 2026-11-20): 5 messages for
 * each hour and each visitor. Pure rules: the server action in `send.ts` calls
 * them, and so does the test. The counter itself is one row of `app_settings`,
 * written by `countInWindow` of `src/lib/settings/`.
 *
 * An IP address is personal data. The key of a counter is a keyed hash
 * (HMAC-SHA-256) of the address, never the address. Nothing here stores or
 * logs the address. A row lives for one hour at most after its first message:
 * each read of the limit removes the rows whose hour is over.
 */

/** How many messages one visitor can send in one window. */
export const CONTACT_LIMIT = 5;

/** The window: one hour, counted from the visitor's first message. */
export const CONTACT_WINDOW_MS = 60 * 60 * 1000;

/** Each counter's key starts with this, so the clean-up finds only counters. */
export const CONTACT_LIMIT_PREFIX = "contact_limite:";

/**
 * The one key that every visitor shares when the address or the secret is
 * missing. The limit then holds for all of them together: it never opens.
 */
export const SHARED_KEY = `${CONTACT_LIMIT_PREFIX}tous`;

/** Keeps this use of the secret apart from each other use of it. */
const HMAC_LABEL = "berceo:contact:limite:v1:";

/**
 * The visitor's address: the first entry of `x-forwarded-for`, which Vercel
 * sets to the client's address and overwrites, so a visitor cannot forge it.
 * Null when the header is absent or empty.
 */
export function visitorAddress(headers: { get(name: string): string | null }): string | null {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim().toLowerCase();
  return first ? first : null;
}

/**
 * The key of a visitor's counter. With no address or no secret, the shared
 * key: an address is never hashed without a key, because a plain hash of an
 * IPv4 address is reversed in seconds.
 */
export function limitKey(address: string | null, secret: string | null | undefined): string {
  if (!address || !secret) return SHARED_KEY;
  const hash = createHmac("sha256", secret).update(`${HMAC_LABEL}${address}`).digest("hex");
  return `${CONTACT_LIMIT_PREFIX}${hash}`;
}

/** A window that started at or before this instant is over at `now`. */
export function windowExpiry(now: Date): Date {
  return new Date(now.getTime() - CONTACT_WINDOW_MS);
}

/** Whether a counter whose window started at `startedAt` is over, and its row removed. */
export function isExpired(startedAt: Date, now: Date): boolean {
  return startedAt.getTime() <= windowExpiry(now).getTime();
}

/**
 * The counter after one more message. This is the rule that the SQL statement
 * of `countInWindow` applies: no row or an expired row starts a window at 1,
 * a live row adds 1 and keeps its start.
 */
export function nextCounter(
  row: { count: number; startedAt: Date } | null,
  now: Date,
): { count: number; startedAt: Date } {
  if (!row || isExpired(row.startedAt, now)) return { count: 1, startedAt: now };
  return { count: row.count + 1, startedAt: row.startedAt };
}

/** Whether the message that made the counter reach `count` can go. */
export function withinLimit(count: number): boolean {
  return count <= CONTACT_LIMIT;
}
