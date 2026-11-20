import { afterEach, describe, expect, it, vi } from "vitest";

import { common } from "@/content/common";

import {
  SLEEP_CONSULTATION_CONFIRMATION_PATH,
  SLEEP_CONSULTATION_PATH,
  sleepConsultationEnabled,
  sleepConsultationUrl,
} from "./config";

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

/**
 * Spec (JAM-352): the calendar sends the visitor back to one fixed address
 * below the consultation page. A person sets that address in the calendar.
 */
describe("the confirmation page's address", () => {
  it("is fixed, below the consultation page", () => {
    expect(SLEEP_CONSULTATION_CONFIRMATION_PATH).toBe("/consultation-sommeil/confirmation");
    expect(SLEEP_CONSULTATION_CONFIRMATION_PATH.startsWith(`${SLEEP_CONSULTATION_PATH}/`)).toBe(true);
  });

  it("has no parameter and no fragment", () => {
    expect(SLEEP_CONSULTATION_CONFIRMATION_PATH).not.toMatch(/[?#&=]/);
  });

  it("starts at the consultation page's address in the catalogue", () => {
    expect(SLEEP_CONSULTATION_PATH).toBe(common.fr.pages.consultationSommeil.href);
  });
});
