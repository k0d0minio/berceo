import { describe, expect, it } from "vitest";

import { creditRecap, feeLine } from "./format";

/**
 * Spec (credits-au-paiement): the récapitulatif names the part her Berceo
 * credit pays and the rest Stripe asks, from the share the server computed.
 * A credit that pays the whole fee leaves no rest. No credit, no line.
 */
describe("creditRecap", () => {
  // A rate of 150 € makes a fee of 450 cents.
  it("names the credit part and the rest", () => {
    expect(feeLine(150)).toBe("4,50 €");
    expect(creditRecap(150, new Map([[450, 200]]))).toEqual({ credit: "2,00 €", reste: "2,50 €" });
  });

  it("leaves no rest when the credit pays the whole fee", () => {
    expect(creditRecap(150, new Map([[450, 450]]))).toEqual({ credit: "4,50 €", reste: null });
  });

  it("names nothing when the credit pays nothing", () => {
    expect(creditRecap(150, new Map([[450, 0]]))).toEqual({});
    expect(creditRecap(150, new Map())).toEqual({});
  });
});
