import { describe, expect, it } from "vitest";

import {
  CONTACT_LIMIT,
  CONTACT_LIMIT_PREFIX,
  CONTACT_WINDOW_MS,
  isExpired,
  limitKey,
  nextCounter,
  SHARED_KEY,
  visitorAddress,
  windowExpiry,
  withinLimit,
} from "./rate-limit";

/**
 * Spec (JAM-341, Jamie, 2026-11-20): 5 messages for each hour and each
 * visitor, a counter whose key is a keyed hash of the address and never the
 * address, and no row that stays after its hour.
 */

const headers = (value: string | null) => ({
  get: (name: string) => (name === "x-forwarded-for" ? value : null),
});

const SECRET = "un-secret-de-test";
const now = new Date("2026-11-20T10:00:00.000Z");
const before = (ms: number) => new Date(now.getTime() - ms);

describe("the limit and the window", () => {
  it("is 5 messages for one hour", () => {
    expect(CONTACT_LIMIT).toBe(5);
    expect(CONTACT_WINDOW_MS).toBe(3_600_000);
  });

  it("lets the fifth message go and refuses the sixth", () => {
    expect(withinLimit(1)).toBe(true);
    expect(withinLimit(5)).toBe(true);
    expect(withinLimit(6)).toBe(false);
  });
});

describe("the visitor's address", () => {
  it("is the first entry of x-forwarded-for", () => {
    expect(visitorAddress(headers("203.0.113.7"))).toBe("203.0.113.7");
    expect(visitorAddress(headers(" 203.0.113.7 , 10.0.0.1, 10.0.0.2"))).toBe("203.0.113.7");
  });

  it("reads one IPv6 address the same in each case", () => {
    expect(visitorAddress(headers("2001:DB8::1"))).toBe("2001:db8::1");
  });

  it("is null with no header or an empty one", () => {
    expect(visitorAddress(headers(null))).toBeNull();
    expect(visitorAddress(headers(""))).toBeNull();
    expect(visitorAddress(headers(" , 10.0.0.1"))).toBeNull();
  });
});

describe("the key of a counter", () => {
  it("is the prefix and a 64-character hash, never the address", () => {
    const key = limitKey("203.0.113.7", SECRET);
    expect(key).toMatch(new RegExp(`^${CONTACT_LIMIT_PREFIX}[0-9a-f]{64}$`));
    expect(key).not.toContain("203.0.113.7");
  });

  it("is the same for one visitor and different for two", () => {
    expect(limitKey("203.0.113.7", SECRET)).toBe(limitKey("203.0.113.7", SECRET));
    expect(limitKey("203.0.113.7", SECRET)).not.toBe(limitKey("203.0.113.8", SECRET));
  });

  it("changes with the secret", () => {
    expect(limitKey("203.0.113.7", SECRET)).not.toBe(limitKey("203.0.113.7", "un-autre-secret"));
  });

  it("is the shared key with no address", () => {
    expect(limitKey(null, SECRET)).toBe(SHARED_KEY);
  });

  it("is the shared key with no secret: an address is never hashed without a key", () => {
    expect(limitKey("203.0.113.7", null)).toBe(SHARED_KEY);
    expect(limitKey("203.0.113.7", undefined)).toBe(SHARED_KEY);
    expect(limitKey("203.0.113.7", "")).toBe(SHARED_KEY);
  });

  it("keeps the shared key under the prefix, so the clean-up removes it too", () => {
    expect(SHARED_KEY.startsWith(CONTACT_LIMIT_PREFIX)).toBe(true);
  });
});

describe("the clean-up", () => {
  it("removes a counter whose window started one hour ago or more", () => {
    expect(windowExpiry(now)).toEqual(before(CONTACT_WINDOW_MS));
    expect(isExpired(before(CONTACT_WINDOW_MS), now)).toBe(true);
    expect(isExpired(before(CONTACT_WINDOW_MS + 1), now)).toBe(true);
  });

  it("keeps a counter inside its hour", () => {
    expect(isExpired(before(CONTACT_WINDOW_MS - 1), now)).toBe(false);
    expect(isExpired(now, now)).toBe(false);
  });
});

describe("the counter after one more message", () => {
  it("starts at 1 with no row", () => {
    expect(nextCounter(null, now)).toEqual({ count: 1, startedAt: now });
  });

  it("adds 1 inside the window and keeps the start", () => {
    const startedAt = before(10 * 60 * 1000);
    expect(nextCounter({ count: 4, startedAt }, now)).toEqual({ count: 5, startedAt });
  });

  it("starts again at 1 when the hour is over", () => {
    const startedAt = before(CONTACT_WINDOW_MS);
    expect(nextCounter({ count: 9, startedAt }, now)).toEqual({ count: 1, startedAt: now });
  });

  it("refuses the sixth message of one hour and takes the first of the next", () => {
    let row: { count: number; startedAt: Date } | null = null;
    const results: boolean[] = [];
    for (let i = 0; i < 6; i += 1) {
      row = nextCounter(row, new Date(now.getTime() + i * 1000));
      results.push(withinLimit(row.count));
    }
    expect(results).toEqual([true, true, true, true, true, false]);
    const later = nextCounter(row, new Date(now.getTime() + CONTACT_WINDOW_MS));
    expect(withinLimit(later.count)).toBe(true);
  });
});
