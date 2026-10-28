import { describe, expect, it } from "vitest";

import { abonnements } from "@/content/abonnements";
import { subscriptionPlanEnum, subscriptionStatusEnum } from "@/db/schema";

import {
  cancelsAt,
  checkoutExpiry,
  FAMILY_ACTIONS,
  familyMay,
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
  subscriptionState,
  testClocksEnabled,
} from "./rules";

/*
 * Spec (abonnements-catalogue-stripe): four plans, their Stripe prices named
 * by environment variables; the row follows Stripe's status (active after
 * payment, past due after a failed renewal, ended after a cancellation); a
 * failed renewal opens 7 days of grace, counted from the first failure; one
 * rule, `hasActiveSubscription`, says whether a family is subscribed.
 *
 * Spec (abonnements-espace-echec-paiement): « Votre abonnement » shows the
 * status, active, cancelled at the period's end, in its grace period or
 * suspended after it; a cancellation's date comes from Stripe; a new Stripe
 * customer gets a test clock only with a test key and STRIPE_TEST_CLOCKS=1.
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

/*
 * Spec (abonnements-acces): an active subscription, or one in its grace
 * period, opens publishing, editing, booking, the priority request, the full
 * profile and writing. Without one, a family does none of these, except
 * writing in the booked answer's conversation, which stays open until the
 * night is over. A pending first payment opens nothing.
 */
describe("what a subscription opens", () => {
  const gate = (row: Parameters<typeof hasActiveSubscription>[0], booked = false) =>
    FAMILY_ACTIONS.filter((action) => familyMay(action, { subscribed: hasActiveSubscription(row, now), booked }));

  it("names the six gated actions", () => {
    expect([...FAMILY_ACTIONS]).toEqual(["publier", "modifier", "reserver", "priorite", "profil", "ecrire"]);
  });

  it("opens every action for an active subscription", () => {
    expect(gate({ status: "active", graceEndsAt: null })).toEqual([...FAMILY_ACTIONS]);
  });

  it("opens every action in the grace period, and none once it ends", () => {
    const graceEnd = new Date(now.getTime() + day);
    expect(gate({ status: "impayee", graceEndsAt: graceEnd })).toEqual([...FAMILY_ACTIONS]);
    expect(gate({ status: "impayee", graceEndsAt: new Date(now.getTime() - 1) })).toEqual([]);
  });

  it("closes each action without a subscription, a pending one or an ended one", () => {
    const rows = [null, { status: "en_attente", graceEndsAt: null }, { status: "terminee", graceEndsAt: null }] as const;
    for (const row of rows) {
      const subscribed = hasActiveSubscription(row, now);
      for (const action of FAMILY_ACTIONS) expect(familyMay(action, { subscribed })).toBe(false);
    }
  });

  it("keeps writing open in a booked answer's conversation, and nothing else", () => {
    expect(gate(null, true)).toEqual(["ecrire"]);
    expect(gate({ status: "terminee", graceEndsAt: null }, true)).toEqual(["ecrire"]);
    expect(familyMay("ecrire", { subscribed: false, booked: false })).toBe(false);
  });
});

describe("the cancellation date", () => {
  const periodEnd = new Date(now.getTime() + 30 * day);

  it("is the period's end when the portal cancels at the period's end", () => {
    expect(cancelsAt({ cancelAt: null, cancelAtPeriodEnd: true }, periodEnd, "active")).toEqual(periodEnd);
  });

  it("is Stripe's cancel_at when Stripe gives one", () => {
    const at = Math.floor((now.getTime() + 10 * day) / 1000);
    expect(cancelsAt({ cancelAt: at, cancelAtPeriodEnd: false }, periodEnd, "active")).toEqual(new Date(at * 1000));
    expect(cancelsAt({ cancelAt: at, cancelAtPeriodEnd: true }, periodEnd, "impayee")).toEqual(new Date(at * 1000));
  });

  it("is null while the subscription renews, and on a row that does not run", () => {
    expect(cancelsAt({ cancelAt: null, cancelAtPeriodEnd: false }, periodEnd, "active")).toBeNull();
    expect(cancelsAt({ cancelAt: null, cancelAtPeriodEnd: true }, periodEnd, "terminee")).toBeNull();
    expect(cancelsAt({ cancelAt: 1, cancelAtPeriodEnd: true }, periodEnd, "en_attente")).toBeNull();
  });
});

describe("the status on « Votre abonnement »", () => {
  const graceEnd = new Date(now.getTime() + day);

  it("reads active while the subscription renews, cancelled once a cancellation is set", () => {
    expect(subscriptionState({ status: "active", graceEndsAt: null, cancelsAt: null }, now)).toBe("active");
    expect(subscriptionState({ status: "active", graceEndsAt: null, cancelsAt: graceEnd }, now)).toBe("resiliee");
  });

  it("reads the grace period inside the 7 days, suspended once they end", () => {
    const row = { status: "impayee" as const, graceEndsAt: graceEnd, cancelsAt: null };
    expect(subscriptionState(row, now)).toBe("grace");
    expect(subscriptionState(row, graceEnd)).toBe("suspendue");
    expect(subscriptionState({ ...row, cancelsAt: graceEnd }, now)).toBe("grace");
  });

  it("agrees with the gate: the grace period opens it, suspended closes it", () => {
    const row = { status: "impayee" as const, graceEndsAt: graceEnd, cancelsAt: null };
    for (const at of [now, graceEnd]) {
      expect(subscriptionState(row, at) === "grace").toBe(hasActiveSubscription(row, at));
    }
  });

  it("says nothing of a pending or an ended row", () => {
    expect(subscriptionState({ status: "en_attente", graceEndsAt: null, cancelsAt: null }, now)).toBeNull();
    expect(subscriptionState({ status: "terminee", graceEndsAt: null, cancelsAt: null }, now)).toBeNull();
  });
});

describe("the test clocks", () => {
  it("run with a test key and STRIPE_TEST_CLOCKS=1", () => {
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "sk_test_abc", STRIPE_TEST_CLOCKS: "1" })).toBe(true);
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "rk_test_abc", STRIPE_TEST_CLOCKS: "1" })).toBe(true);
  });

  it("never run with a live key, whatever the variable says", () => {
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "sk_live_abc", STRIPE_TEST_CLOCKS: "1" })).toBe(false);
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "rk_live_abc", STRIPE_TEST_CLOCKS: "1" })).toBe(false);
  });

  it("stay off without the variable, or with another value", () => {
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "sk_test_abc" })).toBe(false);
    expect(testClocksEnabled({ STRIPE_SECRET_KEY: "sk_test_abc", STRIPE_TEST_CLOCKS: "true" })).toBe(false);
    expect(testClocksEnabled({ STRIPE_TEST_CLOCKS: "1" })).toBe(false);
  });
});
