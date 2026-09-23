import { describe, expect, it } from "vitest";

import { consentRows, consentVersions } from "./consent";

describe("consent ledger (spec: two rows, cgu and confidentialite, current version)", () => {
  it("writes one row per document with the current version", () => {
    expect(consentRows("u-1")).toEqual([
      { userId: "u-1", document: "cgu", version: consentVersions.cgu },
      {
        userId: "u-1",
        document: "confidentialite",
        version: consentVersions.confidentialite,
      },
    ]);
  });
});
