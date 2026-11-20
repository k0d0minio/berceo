/*
 * The calendar inside the consultation page (JAM-352, Jamie's decision of
 * 2026-11-20): a plain `<iframe>` of the calendar's address, loaded only
 * after the visitor's click. No script and no stylesheet of Calendly runs in
 * Berceo's page. These are the pure rules of that frame.
 *
 * Calendly's page, inside the frame, posts a message to the parent window
 * when a booking is made. It posts only when the frame's address has the two
 * parameters that `embedAddress` adds. The message's payload has links to the
 * invitee: `isBookingMessage` reads the event's name and nothing else.
 */

/** The only origin that the calendar is framed from, and the only one a message is accepted from. */
export const CALENDLY_ORIGIN = "https://calendly.com"

/** The name of the message that Calendly posts when a booking is made. */
export const BOOKED_EVENT = "calendly.event_scheduled"

/** True where the calendar's address is a page of Calendly, so the page may frame it. */
export function canEmbed(url: string): boolean {
  try {
    return new URL(url).origin === CALENDLY_ORIGIN
  } catch {
    return false
  }
}

/**
 * The frame's address: the calendar's address with the two parameters that
 * make Calendly post its messages to the page. `host` is the host of Berceo's
 * page (`window.location.host`). The address keeps its own parameters.
 */
export function embedAddress(url: string, host: string): string {
  const address = new URL(url)
  address.searchParams.set("embed_domain", host)
  address.searchParams.set("embed_type", "Inline")
  return address.toString()
}

/**
 * True for the message of a booking that comes from Calendly. The origin must
 * be exactly Calendly's. Only the event's name is read: never the payload.
 */
export function isBookingMessage(origin: string, data: unknown): boolean {
  if (origin !== CALENDLY_ORIGIN) return false
  if (typeof data !== "object" || data === null) return false
  return (data as { event?: unknown }).event === BOOKED_EVENT
}
