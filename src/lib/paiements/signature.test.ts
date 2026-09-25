import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { verifiedEvent } from "./signature";

/*
 * Spec (frais-de-service): the webhook refuses a call without a valid Stripe
 * signature and reads only what Stripe signed with this endpoint's secret.
 */

const secret = "whsec_test_frais_de_service";
const body = JSON.stringify({
  id: "evt_test_1",
  object: "event",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_1", object: "checkout.session" } },
});
const sign = (payload: string, key = secret) => Stripe.webhooks.generateTestHeaderString({ payload, secret: key });

describe("the webhook's signature check", () => {
  it("reads an event Stripe signed with the endpoint's secret", () => {
    const event = verifiedEvent(body, sign(body), secret);
    expect(event?.id).toBe("evt_test_1");
    expect(event?.type).toBe("checkout.session.completed");
  });

  it("refuses a call without a signature", () => {
    expect(verifiedEvent(body, null, secret)).toBeNull();
    expect(verifiedEvent(body, "", secret)).toBeNull();
  });

  it("refuses a signature made with another secret", () => {
    expect(verifiedEvent(body, sign(body, "whsec_someone_else"), secret)).toBeNull();
  });

  it("refuses a body changed after it was signed", () => {
    const changed = body.replace("cs_test_1", "cs_test_2");
    expect(verifiedEvent(changed, sign(body), secret)).toBeNull();
  });

  it("refuses a signature older than Stripe's tolerance", () => {
    const old = Stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret,
      timestamp: Math.floor(Date.now() / 1000) - 60 * 60,
    });
    expect(verifiedEvent(body, old, secret)).toBeNull();
  });

  it("refuses when the endpoint has no secret", () => {
    expect(verifiedEvent(body, sign(body), "")).toBeNull();
  });
});
