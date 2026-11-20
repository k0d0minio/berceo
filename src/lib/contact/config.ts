/*
 * The contact page's one setting (JAM-327, Jamie's answer to question 2): the
 * address a message goes to is the value of the environment variable
 * `CONTACT_EMAIL`, set in Vercel for each environment and never in git. The
 * site never shows it. Where the variable is empty, the page and its links do
 * not exist in that environment.
 */

export const CONTACT_PATH = "/contact"

/** The address the form sends to, or null where the environment has none. */
export function contactRecipient(): string | null {
  const value = process.env.CONTACT_EMAIL?.trim()
  return value ? value : null
}

export function contactEnabled(): boolean {
  return contactRecipient() !== null
}

/**
 * The key of the send limit's hash (JAM-341): the server secret
 * `NEON_AUTH_COOKIE_SECRET`, which each environment with accounts has. The
 * limit adds a label of its own to what it hashes, so the hash is of no use
 * against a session cookie. Null where the environment has none: all visitors
 * then share one counter (`rate-limit.ts`).
 */
export function limitSecret(): string | null {
  const value = process.env.NEON_AUTH_COOKIE_SECRET?.trim()
  return value ? value : null
}
