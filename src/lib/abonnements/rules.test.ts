import { describe, expect, it } from "vitest";

import { abonnements } from "@/content/abonnements";
import { subscriptionPlanEnum, subscriptionStatusEnum } from "@/db/schema";

import {
  checkoutExpiry,
  GRACE_DAYS,
  graceEndsAt,
  hasActiveSubscription,
  isLive,
  isPlan,
  LIVE,
  planOfPrice,
  PLANS,
  planToFinish,
  PRICE_ENV,
  statusFromStripe,
} from "./rules";

/*
 * Spec (abonnements-catalogue-stripe): four plans, their Stripe prices named
 * by environment variables; the row follows Stripe's status (active after
 * payment, past due after a failed renewal, ended after a cancellation); a
 * failed renewal opens 7 days of grace, counted from the first failure; one
 * rule, `hasActiveSubscription`, says whether a family is subscribed.
 */

const now = new Date("2026-11-10T12:00:00Z");
const day = 24 * 60 * 60_000;

describe("the four plans", () => {
  it("are the devis' four, in its order, as the schema and the catalogue hold them", () => {
    expect(PLANS).toEqual(["decouverte", "parenthese", "serenite", "premium"]);
    expect([...subscriptionPlanEnum.enumValues]).toEqual([...PLANS]);
    expect(abonnements.fr.plans.map((plan) => plan.name)).toEqual(["Découverte", "Parenthèse", "Sérénité", "Premium"]);
  });

  it("accepts a plan's key and nothing else", () => {
    for (const plan of PLANS) expect(isPlan(plan)).toBe(true);
    expect(isPlan("Premium")).toBe(false);
    expect(isPlan("")).toBe(false);
    expect(isPlan(null)).toBe(false);
  });

  it("name each price by its own environment variable", () => {
    expect(Object.values(PRICE_ENV)).toEqual([
      "STRIPE_PRICE_DECOUVERTE",
      "STRIPE_PRICE_PARENTHESE",
      "STRIPE_PRICE_SERENITE",
      "STRIPE_PRICE_PREMIUM",
    ]);
  });

  it("find the plan of a price from the environment, and no plan for another price", () => {
    const env = {
      STRIPE_PRICE_DECOUVERTE: "price_d",
      STRIPE_PRICE_PARENTHESE: "price_p",
      STRIPE_PRICE_SERENITE: "price_s",
      STRIPE_PRICE_PREMIUM: "price_x",
    };
    expect(planOfPrice("price_s", env)).toBe("serenite");
    expect(planOfPrice("price_x", env)).toBe("premium");
    expect(planOfPrice("price_other", env)).toBeNull();
    expect(planOfPrice(null, env)).toBeNull();
    expect(planOfPrice("price_d", {})).toBeNull();
  });
});

describe("the status transitions", () => {
  it("read active after the payment", () => {
    expect(statusFromStripe("active")).toBe("active");
    expect(statusFromStripe("trialing")).toBe("active");
  });

  it("read pending while the first payment is", () => {
    expect(statusFromStripe("incomplete")).toBe("en_attente");
  });

  it("read past due after a failed renewal", () => {
    expect(statusFromStripe("past_due")).toBe("impayee");
    expect(statusFromStripe("unpaid")).toBe("impayee");
  });

  it("read ended after a cancellation, an expired first payment, or anything unknown", () => {
    expect(statusFromStripe("canceled")).toBe("terminee");
    expect(statusFromStripe("incomplete_expired")).toBe("terminee");
    expect(statusFromStripe("paused")).toBe("terminee");
    expect(statusFromStripe("something_new")).toBe("terminee");
  });

  it("only produce statuses the schema knows", () => {
    const known = new Set<string>(subscriptionStatusEnum.enumValues);
    for (const s of ["active", "trialing", "incomplete", "past_due", "unpaid", "canceled", "incomplete_expired", "paused"]) {
      expect(known.has(statusFromStripe(s))).toBe(true);
    }
  });

  it("hold one live row per family: pending, active and past due, never ended", () => {
    expect([...LIVE]).toEqual(["en_attente", "active", "impayee"]);
    expect(isLive("terminee")).toBe(false);
    for (const status of LIVE) expect(isLive(status)).toBe(true);
  });
});

describe("the grace period", () => {
  it("lasts 7 days from the first failed renewal", () => {
    const end = graceEndsAt({ status: "active", graceEndsAt: null }, "impayee", now);
    expect(GRACE_DAYS).toBe(7);
    expect(end?.getTime()).toBe(now.getTime() + 7 * day);
  });

  it("is never extended by a later failed retry", () => {
    const first = new Date(now.getTime() + 5 * day);
    const later = new Date(now.getTime() + 3 * day);
    expect(graceEndsAt({ status: "impayee", graceEndsAt: first }, "impayee", later)).toEqual(first);
  });

  it("ends once the renewal is paid or the subscription ends", () => {
    const current = { status: "impayee" as const, graceEndsAt: new Date(now.getTime() + day) };
    expect(graceEndsAt(current, "active", now)).toBeNull();
    expect(graceEndsAt(current, "terminee", now)).toBeNull();
    expect(graceEndsAt({ status: "en_attente", graceEndsAt: null }, "active", now)).toBeNull();
  });

  it("starts again on a new failure after a paid renewal", () => {
    const paid = graceEndsAt({ status: "impayee", graceEndsAt: now }, "active", now);
    const later = new Date(now.getTime() + 30 * day);
    expect(graceEndsAt({ status: "active", graceEndsAt: paid }, "impayee", later)?.getTime()).toBe(
      later.getTime() + 7 * day,
    );
  });
});

describe("hasActiveSubscription", () => {
  it("is true for an active subscription", () => {
    expect(hasActiveSubscription({ status: "active", graceEndsAt: null }, now)).toBe(true);
  });

  it("is true for a past due one inside its grace period, false once it ends", () => {
    const graceEnd = new Date(now.getTime() + day);
    expect(hasActiveSubscription({ status: "impayee", graceEndsAt: graceEnd }, now)).toBe(true);
    expect(hasActiveSubscription({ status: "impayee", graceEndsAt: graceEnd }, graceEnd)).toBe(false);
    expect(hasActiveSubscription({ status: "impayee", graceEndsAt: new Date(now.getTime() - 1) }, now)).toBe(false);
    expect(hasActiveSubscription({ status: "impayee", graceEndsAt: null }, now)).toBe(false);
  });

  it("is false for a pending or an ended subscription, and for none", () => {
    expect(hasActiveSubscription({ status: "en_attente", graceEndsAt: null }, now)).toBe(false);
    expect(hasActiveSubscription({ status: "terminee", graceEndsAt: null }, now)).toBe(false);
    expect(hasActiveSubscription(null, now)).toBe(false);
    expect(hasActiveSubscription(undefined, now)).toBe(false);
  });
});

describe("a subscription Checkout", () => {
  it("lasts at least Stripe's 30 minutes", () => {
    expect(checkoutExpiry(now).getTime() - now.getTime()).toBeGreaterThanOrEqual(30 * 60_000);
  });
});

/*
 * Spec (abonnements-inscription-famille): a family who left the Checkout of
 * the plan she picked at sign-up sees one call to finish it; once a Checkout
 * of hers completed, the call is gone for good.
 */
describe("the plan a family's home asks her to finish", () => {
  it("is the plan picked at sign-up while no Checkout completed", () => {
    expect(planToFinish("serenite", false)).toBe("serenite");
  });

  it("is none once a Checkout completed, whatever the subscription became", () => {
    expect(planToFinish("serenite", true)).toBeNull();
  });

  it("is none for a family who signed up before the plans were part of sign-up", () => {
    expect(planToFinish(null, false)).toBeNull();
  });
});
