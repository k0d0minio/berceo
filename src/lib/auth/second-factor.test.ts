import { describe, expect, it } from "vitest";

import {
  afterWrongTry,
  codeExpiry,
  codeState,
  deviceExpiry,
  mayResend,
  needsSecondFactor,
  normalizeCode,
} from "./second-factor";

/*
 * Spec (comptes-2fa): a professional and a founder give a code, a family
 * never; the code lives 10 minutes and dies on the fifth wrong try; one code
 * per 60 seconds; a device is trusted 30 days.
 */

const NOW = new Date("2026-11-02T20:00:00Z");
const at = (seconds: number) => new Date(NOW.getTime() + seconds * 1000);

describe("who gives a code", () => {
  it("asks a professional and a founder, never a family", () => {
    expect(needsSecondFactor("professionnel")).toBe(true);
    expect(needsSecondFactor("admin")).toBe(true);
    expect(needsSecondFactor("parent")).toBe(false);
  });
});

describe("the typed code", () => {
  it("keeps six digits, with or without spaces", () => {
    expect(normalizeCode("123456")).toBe("123456");
    expect(normalizeCode(" 123 456 ")).toBe("123456");
  });

  it("refuses anything else", () => {
    expect(normalizeCode("12345")).toBeNull();
    expect(normalizeCode("1234567")).toBeNull();
    expect(normalizeCode("12a456")).toBeNull();
    expect(normalizeCode("")).toBeNull();
  });
});

describe("the code's life", () => {
  it("expires 10 minutes after it is made", () => {
    expect(codeExpiry(NOW)).toEqual(at(600));
    expect(codeState({ expiresAt: at(600), attempts: 0 }, at(599))).toBe("live");
    expect(codeState({ expiresAt: at(600), attempts: 0 }, at(600))).toBe("expired");
  });

  it("is dead after five wrong tries, and the fifth try kills it", () => {
    expect(codeState({ expiresAt: at(600), attempts: 4 }, NOW)).toBe("live");
    expect(codeState({ expiresAt: at(600), attempts: 5 }, NOW)).toBe("dead");
    expect(afterWrongTry(4)).toBe("live");
    expect(afterWrongTry(5)).toBe("dead");
  });

  it("is expired before it is dead", () => {
    expect(codeState({ expiresAt: NOW, attempts: 5 }, NOW)).toBe("expired");
  });
});

describe("the resend gap", () => {
  it("lets the first code leave, then one every 60 seconds", () => {
    expect(mayResend(null, NOW)).toBe(true);
    expect(mayResend(NOW, at(59))).toBe(false);
    expect(mayResend(NOW, at(60))).toBe(true);
  });
});

describe("the trusted device", () => {
  it("lasts 30 days from the code", () => {
    expect(deviceExpiry(NOW)).toEqual(new Date("2026-12-02T20:00:00Z"));
  });
});
