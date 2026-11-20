import { afterEach, describe, expect, it, vi } from "vitest";

import { sleepConsultationEnabled, sleepConsultationUrl } from "./config";

/**
 * Spec (JAM-305, the sleep consultation page): the calendar's address is the
 * environment variable `SLEEP_CONSULTATION_URL`. No page, no link and no
 * sitemap entry exist where it is empty or is not an `https://` address.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the sleep consultation's address", () => {
  it("is the value of the variable", () => {
    vi.stubEnv("SLEEP_CONSULTATION_URL", "https://calendar.example.com/berceo/sommeil");
    expect(sleepConsultationUrl()).toBe("https://calendar.example.com/berceo/sommeil");
    expect(sleepConsultationEnabled()).toBe(true);
  });

  it("ignores the spaces around the value", () => {
    vi.stubEnv("SLEEP_CONSULTATION_URL", "  https://calendar.example.com/berceo \n");
    expect(sleepConsultationUrl()).toBe("https://calendar.example.com/berceo");
  });

  it("is null where the variable is not set", () => {
    vi.stubEnv("SLEEP_CONSULTATION_URL", undefined);
    expect(sleepConsultationUrl()).toBeNull();
    expect(sleepConsultationEnabled()).toBe(false);
  });

  it.each(["", "   "])("is null where the variable is empty (%j)", (value) => {
    vi.stubEnv("SLEEP_CONSULTATION_URL", value);
    expect(sleepConsultationUrl()).toBeNull();
    expect(sleepConsultationEnabled()).toBe(false);
  });

  it.each([
    "http://calendar.example.com/berceo",
    "calendar.example.com/berceo",
    "//calendar.example.com/berceo",
    "/consultation",
    "javascript:alert(1)",
    "mailto:someone@example.com",
    "https://",
    "https://user:secret@calendar.example.com/berceo",
    "not an address",
  ])("is null where the value is not an https address (%s)", (value) => {
    vi.stubEnv("SLEEP_CONSULTATION_URL", value);
    expect(sleepConsultationUrl()).toBeNull();
    expect(sleepConsultationEnabled()).toBe(false);
  });
});
