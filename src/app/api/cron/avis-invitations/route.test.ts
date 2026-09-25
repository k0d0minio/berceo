import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

/**
 * Spec (avis-etoiles, D-120): the invitation route answers 401 and sends
 * nothing without the right bearer secret, and hands the clock and its own
 * origin to the invitations otherwise. The invitations themselves are covered
 * in src/lib/avis.
 */

const { sendInvitations } = vi.hoisted(() => ({ sendInvitations: vi.fn() }));
vi.mock("@/lib/avis/notify", () => ({ sendInvitations }));

const ROUTE = "https://uat.berceo.be/api/cron/avis-invitations";

function call(authorization?: string) {
  return POST(
    new NextRequest(ROUTE, {
      method: "POST",
      headers: authorization ? { authorization } : {},
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "le-secret-de-uat");
  sendInvitations.mockResolvedValue({ sent: 2, failed: 0 });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the invitation route", () => {
  it("answers 401 and sends nothing without the secret", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("Bearer mauvais")).status).toBe(401);
    expect((await call("le-secret-de-uat")).status).toBe(401);
    expect(sendInvitations).not.toHaveBeenCalled();
  });

  it("answers 401 when the environment has no secret at all", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    expect(sendInvitations).not.toHaveBeenCalled();
  });

  it("sends the invitations with its own origin when the secret matches", async () => {
    const response = await call("Bearer le-secret-de-uat");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 2, failed: 0 });
    expect(sendInvitations).toHaveBeenCalledWith(expect.any(Date), "https://uat.berceo.be");
  });

  it("answers 500 when the invitations fail", async () => {
    sendInvitations.mockRejectedValue(new Error("database"));
    expect((await call("Bearer le-secret-de-uat")).status).toBe(500);
  });
});
