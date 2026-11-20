/*
 * The sleep consultation page's one setting (JAM-305, Jamie's decision): the
 * address of the founders' booking calendar is the value of the environment
 * variable `SLEEP_CONSULTATION_URL`, set in Vercel for each environment and
 * never in git. Where the variable is empty, or is not an `https://` address,
 * the page, its links and its sitemap entry do not exist in that environment.
 *
 * The calendar sends the visitor back to the confirmation page after a
 * booking (JAM-352). That address is fixed: a person sets it in the calendar,
 * so a change of it here needs the same change there. The confirmation page
 * exists only where the consultation page exists.
 */

export const SLEEP_CONSULTATION_PATH = "/consultation-sommeil"
export const SLEEP_CONSULTATION_CONFIRMATION_PATH = `${SLEEP_CONSULTATION_PATH}/confirmation`

/** The calendar's address, or null where the environment has no usable one. */
export function sleepConsultationUrl(): string | null {
  const value = process.env.SLEEP_CONSULTATION_URL?.trim()
  if (!value) return null
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  // Only a plain `https://` address: no other scheme, and no credentials in it.
  if (url.protocol !== "https:" || url.username || url.password) return null
  return url.toString()
}

export function sleepConsultationEnabled(): boolean {
  return sleepConsultationUrl() !== null
}
