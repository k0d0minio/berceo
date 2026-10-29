import { describe, expect, it } from "vitest";

import {
  balanceCents,
  CREDIT_MONTHS,
  CREDIT_ORIGINS,
  creditState,
  expiryOf,
  isExpired,
  remainingCents,
  spendingPlan,
  type SpendableCredit,
} from "./rules";

/**
 * Spec (credits-registre, the answers [9.2]): a credit lasts 24 months from
 * its issue. The balance at a moment ignores expired credits and spent
 * amounts. A credit pays its part of a later fee, the earliest expiry first,
 * and the rest goes through the Checkout.
 */
const now = new Date("2026-11-01T10:00:00Z");

function credit(over: Partial<SpendableCredit> = {}): SpendableCredit {
  return {
    id: "a",
    amountCents: 450,
    spentCents: 0,
    issuedAt: new Date("2026-10-01T10:00:00Z"),
    expiresAt: new Date("2028-10-01T10:00:00Z"),
    ...over,
  };
}

describe("expiryOf", () => {
  it("is 24 months after the issue, to the hour", () => {
    expect(CREDIT_MONTHS).toBe(24);
    expect(expiryOf(new Date("2026-10-29T03:15:00Z")).toISOString()).toBe("2028-10-29T03:15:00.000Z");
  });

  it("rolls a 29 February into March", () => {
    expect(expiryOf(new Date("2028-02-29T12:00:00Z")).toISOString()).toBe("2030-03-01T12:00:00.000Z");
  });
});

describe("creditState and remainingCents", () => {
  it("reads disponible with its remainder before the expiry", () => {
    const c = credit({ spentCents: 150 });
    expect(creditState(c, now)).toBe("disponible");
    expect(remainingCents(c, now)).toBe(300);
  });

  it("reads expire with nothing left from the expiry on", () => {
    const c = credit({ expiresAt: now });
    expect(isExpired(c, now)).toBe(true);
    expect(creditState(c, now)).toBe("expire");
    expect(remainingCents(c, now)).toBe(0);
    expect(creditState(credit({ expiresAt: new Date(now.getTime() + 1) }), now)).toBe("disponible");
  });

  it("reads utilise once spent to the last cent, even past the expiry", () => {
    const c = credit({ spentCents: 450, expiresAt: new Date("2026-01-01T00:00:00Z") });
    expect(creditState(c, now)).toBe("utilise");
    expect(remainingCents(c, now)).toBe(0);
  });
});

describe("balanceCents", () => {
  it("sums what the credits can still pay and ignores expired and spent ones", () => {
    const list = [
      credit({ id: "a" }),
      credit({ id: "b", spentCents: 100 }),
      credit({ id: "c", expiresAt: new Date("2026-10-31T00:00:00Z") }),
      credit({ id: "d", spentCents: 450 }),
    ];
    expect(balanceCents(list, now)).toBe(800);
    expect(balanceCents([], now)).toBe(0);
  });
});

describe("spendingPlan", () => {
  it("takes the earliest expiry first, then the earliest issue, and leaves the rest to the Checkout", () => {
    const list = [
      credit({ id: "late", expiresAt: new Date("2028-12-01T00:00:00Z") }),
      credit({ id: "soon", amountCents: 300, expiresAt: new Date("2027-01-01T00:00:00Z") }),
      credit({ id: "old", issuedAt: new Date("2026-09-01T00:00:00Z") }),
    ];
    expect(spendingPlan(list, 1000, now)).toEqual({
      takes: [
        { id: "soon", cents: 300 },
        { id: "old", cents: 450 },
        { id: "late", cents: 250 },
      ],
      restCents: 0,
    });
    expect(spendingPlan(list, 1500, now)).toEqual({
      takes: [
        { id: "soon", cents: 300 },
        { id: "old", cents: 450 },
        { id: "late", cents: 450 },
      ],
      restCents: 300,
    });
  });

  it("takes only the remainder of a partly spent credit and skips expired and spent ones", () => {
    const list = [
      credit({ id: "part", spentCents: 400 }),
      credit({ id: "gone", expiresAt: new Date("2026-10-01T00:00:00Z") }),
      credit({ id: "done", spentCents: 450 }),
    ];
    expect(spendingPlan(list, 300, now)).toEqual({ takes: [{ id: "part", cents: 50 }], restCents: 250 });
  });

  it("takes nothing for nothing, and refuses a negative or broken amount", () => {
    expect(spendingPlan([credit()], 0, now)).toEqual({ takes: [], restCents: 0 });
    expect(() => spendingPlan([credit()], -1, now)).toThrow(RangeError);
    expect(() => spendingPlan([credit()], 1.5, now)).toThrow(RangeError);
  });
});

describe("CREDIT_ORIGINS", () => {
  it("names the table's lines, then the founders' hand", () => {
    expect(CREDIT_ORIGINS).toEqual([
      "annulation_famille",
      "annulation_professionnelle",
      "absence_professionnelle",
      "annulation_berceo",
      "geste_berceo",
    ]);
  });
});
