import { describe, expect, it } from "vitest";

import { authOutcome } from "./errors";

describe("Neon Auth error codes", () => {
  it("never says which of the e-mail or the password was wrong", () => {
    for (const code of ["INVALID_EMAIL_OR_PASSWORD", "INVALID_PASSWORD", "USER_NOT_FOUND"]) {
      expect(authOutcome({ code })).toBe("identifiants");
    }
  });

  it("reads an existing account and an unverified address", () => {
    expect(authOutcome({ code: "USER_ALREADY_EXISTS" })).toBe("existe");
    expect(authOutcome({ code: "EMAIL_NOT_VERIFIED" })).toBe("nonVerifie");
  });

  it("falls back to the generic message for anything unknown", () => {
    expect(authOutcome({ code: "NETWORK_TIMEOUT" })).toBe("generique");
    expect(authOutcome(null)).toBe("generique");
  });
});
