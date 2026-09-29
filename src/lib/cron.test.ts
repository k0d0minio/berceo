import { describe, expect, it } from "vitest";

import { isCronRequest } from "./cron";

describe("the cron's secret", () => {
  const secret = "s".repeat(32);

  it("accepts only the bearer of the configured secret", () => {
    expect(isCronRequest(`Bearer ${secret}`, secret)).toBe(true);
    expect(isCronRequest(`Bearer ${"t".repeat(32)}`, secret)).toBe(false);
    expect(isCronRequest(secret, secret)).toBe(false);
    expect(isCronRequest(null, secret)).toBe(false);
  });

  it("accepts nothing when no secret is configured", () => {
    expect(isCronRequest("Bearer ", undefined)).toBe(false);
    expect(isCronRequest("Bearer ", "")).toBe(false);
    expect(isCronRequest("Bearer short", "short")).toBe(false);
  });
});
