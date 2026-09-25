import { describe, expect, it } from "vitest";

import { paymentStatusEnum } from "@/db/schema";

import {
  checkoutExpiry,
  effectiveStatus,
  eurosFromCents,
  feeCents,
  isRefundable,
  isSessionId,
  refundKey,
  refundSync,
} from "./rules";

/*
 * Spec (frais-de-service): the fee is 3 % of the answer's rate, exact, 3,00 €
 * to 9,00 € (D-87); a Checkout lasts 30 minutes and an open one past its
 * expiry reads as expired (D-92); a refund takes a paid fee only, once, and a
 * refund Stripe reports is recorded as the dashboard's or as failed (D-89,
 * D-94).
 */

describe("the amount (D-87)", () => {
  it("is 3 % of the rate, in cents, never rounded", () => {
    expect(feeCents(100)).toBe(300);
    expect(feeCents(137)).toBe(411);
    expect(feeCents(300)).toBe(900);
  });

  it("reads the French way, with the cents", () => {
    expect(eurosFromCents(feeCents(137))).toBe("4,11");
    expect(eurosFromCents(feeCents(100))).toBe("3,00");
    expect(eurosFromCents(feeCents(300))).toBe("9,00");
    expect(eurosFromCents(feeCents(150))).toBe("4,50");
  });

  it("refuses a rate outside 100 to 300 €, or not whole", () => {
    expect(() => feeCents(99)).toThrow(RangeError);
    expect(() => feeCents(301)).toThrow(RangeError);
    expect(() => feeCents(150.5)).toThrow(RangeError);
  });
});

describe("an open Checkout (D-92)", () => {
  const now = new Date("2026-10-01T20:00:00Z");

  it("lasts at least Stripe's 30 minutes", () => {
    expect(checkoutExpiry(now).getTime() - now.getTime()).toBeGreaterThanOrEqual(30 * 60_000);
  });

  it("reads as expired once its expiry has passed", () => {
    const expiresAt = new Date("2026-10-01T19:59:00Z");
    expect(effectiveStatus({ status: "en_attente", expiresAt }, now)).toBe("expiree");
    expect(effectiveStatus({ status: "en_attente", expiresAt: now }, now)).toBe("expiree");
  });

  it("reads as open before, and never changes a closed one", () => {
    const expiresAt = new Date("2026-10-01T20:10:00Z");
    expect(effectiveStatus({ status: "en_attente", expiresAt }, now)).toBe("en_attente");
    const past = new Date("2026-10-01T19:00:00Z");
    expect(effectiveStatus({ status: "payee", expiresAt: past }, now)).toBe("payee");
    expect(effectiveStatus({ status: "remboursee", expiresAt: past }, now)).toBe("remboursee");
  });
});

describe("a Checkout session id", () => {
  it("accepts Stripe's test and live ids and nothing else", () => {
    expect(isSessionId("cs_test_a1B2c3")).toBe(true);
    expect(isSessionId("cs_live_a1B2c3")).toBe(true);
    expect(isSessionId("")).toBe(false);
    expect(isSessionId(null)).toBe(false);
    expect(isSessionId("cs_test_a1/../x")).toBe(false);
    expect(isSessionId("pi_test_a1B2c3")).toBe(false);
  });
});

describe("a refund (D-94)", () => {
  it("takes a paid fee, or one whose refund failed, and nothing else", () => {
    const allowed = paymentStatusEnum.enumValues.filter(isRefundable);
    expect(allowed).toEqual(["payee", "remboursement_echoue"]);
  });

  it("sends Stripe one key per payment and attempt", () => {
    const id = "6f0c1f5e-9a57-4f1b-8d1e-2b3c4d5e6f70";
    expect(refundKey(id, null)).toBe(refundKey(id, null));
    expect(refundKey(id, "re_1")).not.toBe(refundKey(id, null));
    expect(refundKey(id, "re_1")).not.toBe(refundKey(id, "re_2"));
    expect(refundKey(id, null)).not.toBe(refundKey("0c7a0e2e-3f4d-4a5b-9c6d-7e8f9a0b1c2d", null));
  });
});

describe("a refund Stripe reports (D-89)", () => {
  it("records a refund made in the dashboard on a paid fee", () => {
    expect(refundSync({ status: "payee", stripeRefundId: null }, { id: "re_1", status: "succeeded", fromApp: false })).toEqual({
      kind: "dashboard",
    });
    expect(refundSync({ status: "payee", stripeRefundId: null }, { id: "re_1", status: "pending", fromApp: false })).toEqual({
      kind: "dashboard",
    });
  });

  it("marks the refund the row carries as failed", () => {
    expect(refundSync({ status: "remboursee", stripeRefundId: "re_1" }, { id: "re_1", status: "failed", fromApp: true })).toEqual({
      kind: "echec",
    });
  });

  it("leaves the app's own refunds to the app, which knows their reason", () => {
    expect(refundSync({ status: "payee", stripeRefundId: null }, { id: "re_1", status: "succeeded", fromApp: true })).toEqual({
      kind: "rien",
    });
  });

  it("changes nothing for a refund already recorded, or another one", () => {
    expect(refundSync({ status: "remboursee", stripeRefundId: "re_1" }, { id: "re_1", status: "succeeded", fromApp: false })).toEqual({
      kind: "rien",
    });
    expect(refundSync({ status: "remboursee", stripeRefundId: "re_1" }, { id: "re_2", status: "failed", fromApp: false })).toEqual({
      kind: "rien",
    });
    expect(refundSync({ status: "expiree", stripeRefundId: null }, { id: "re_1", status: "succeeded", fromApp: false })).toEqual({
      kind: "rien",
    });
  });
});
