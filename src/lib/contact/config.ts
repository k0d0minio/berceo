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
