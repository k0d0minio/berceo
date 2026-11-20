import { describe, expect, it } from "vitest";

import { BOOKED_EVENT, CALENDLY_ORIGIN, canEmbed, embedAddress, isBookingMessage } from "./embed";

/**
 * Spec (JAM-352): the calendar is framed only from Calendly, the frame's
 * address has the two parameters that make Calendly post its messages, and a
 * booking's message is accepted only from Calendly's exact origin, by its
 * name, with nothing read of its payload.
 */

describe("the calendar that the page may frame", () => {
  it.each(["https://calendly.com/berceo/sommeil", "https://calendly.com/berceo/sommeil?month=2027-01"])(
    "is a page of Calendly (%s)",
    (url) => {
      expect(canEmbed(url)).toBe(true);
    },
  );

  it.each([
    "https://calendar.example.com/berceo",
    "https://calendly.com.example.com/berceo",
    "https://www.calendly.com/berceo",
    "https://evil.example/calendly.com",
    "http://calendly.com/berceo",
    "not an address",
    "",
  ])("is no other address (%s)", (url) => {
    expect(canEmbed(url)).toBe(false);
  });
});

describe("the frame's address", () => {
  it("adds the page's host and the inline type", () => {
    const address = new URL(embedAddress("https://calendly.com/berceo/sommeil", "uat.berceo.be"));
    expect(address.origin + address.pathname).toBe("https://calendly.com/berceo/sommeil");
    expect(address.searchParams.get("embed_domain")).toBe("uat.berceo.be");
    expect(address.searchParams.get("embed_type")).toBe("Inline");
  });

  it("keeps the parameters of the calendar's address and adds nothing else", () => {
    const address = new URL(embedAddress("https://calendly.com/berceo/sommeil?hide_gdpr_banner=1", "localhost:3000"));
    expect([...address.searchParams.keys()].sort()).toEqual(["embed_domain", "embed_type", "hide_gdpr_banner"]);
    expect(address.searchParams.get("embed_domain")).toBe("localhost:3000");
  });
});

describe("the message of a booking", () => {
  const booked = { event: BOOKED_EVENT, payload: { invitee: { uri: "https://api.example/invitee" } } };

  it("is accepted from Calendly's origin, by its name", () => {
    expect(isBookingMessage(CALENDLY_ORIGIN, booked)).toBe(true);
    expect(isBookingMessage("https://calendly.com", { event: "calendly.event_scheduled" })).toBe(true);
  });

  it.each([
    "https://www.calendly.com",
    "https://calendly.com.example.com",
    "http://calendly.com",
    "https://calendly.com:8443",
    "https://uat.berceo.be",
    "null",
    "",
  ])("is refused from another origin (%j)", (origin) => {
    expect(isBookingMessage(origin, booked)).toBe(false);
  });

  it.each([
    ["another event of Calendly", { event: "calendly.date_and_time_selected" }],
    ["a page height event", { event: "calendly.page_height", payload: { height: "900px" } }],
    ["no event name", { payload: {} }],
    ["a string", "calendly.event_scheduled"],
    ["null", null],
    ["undefined", undefined],
    ["a number", 3],
  ])("is refused for %s", (_what, data) => {
    expect(isBookingMessage(CALENDLY_ORIGIN, data)).toBe(false);
  });

  it("never reads the payload", () => {
    const data = {
      event: BOOKED_EVENT,
      get payload(): never {
        throw new Error("the payload was read");
      },
    };
    expect(isBookingMessage(CALENDLY_ORIGIN, data)).toBe(true);
  });
});
