import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

/**
 * Spec (demande-de-garde, D-61): the digest route answers 401 and sends nothing
 * without the right bearer secret, and hands the clock and its own origin to
 * the digest otherwise. The digest itself is covered in src/lib/demandes.
 */

const { sendRequestDigest } = vi.hoisted(() => ({ sendRequestDigest: vi.fn() }));
vi.mock("@/lib/demandes/notify", () => ({ sendRequestDigest }));

const ROUTE = "https://uat.berceo.be/api/cron/demandes-digest";

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
  sendRequestDigest.mockResolvedValue({ requests: 2, professionals: 1, failed: 0 });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the digest route", () => {
  it("answers 401 and sends nothing without the secret", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("Bearer mauvais")).status).toBe(401);
    expect((await call("le-secret-de-uat")).status).toBe(401);
    expect(sendRequestDigest).not.toHaveBeenCalled();
  });

  it("answers 401 when the environment has no secret at all", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    expect(sendRequestDigest).not.toHaveBeenCalled();
  });

  it("runs the digest with its own origin when the secret matches", async () => {
    const response = await call("Bearer le-secret-de-uat");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ requests: 2, professionals: 1, failed: 0 });
    expect(sendRequestDigest).toHaveBeenCalledWith(expect.any(Date), "https://uat.berceo.be");
  });
});
