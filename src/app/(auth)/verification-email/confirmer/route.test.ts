import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

/**
 * Spec (recherche-et-fiches-publiques, D-129): a family who signed up from a
 * full profile lands back on it once she confirms her e-mail in the same
 * browser; without the cookie, or with a way back we do not accept, she lands
 * in her space; a professional always lands in hers. The cookie is cleared.
 */

const { handlerGet, row, sendWelcomeIfDue } = vi.hoisted(() => ({
  handlerGet: vi.fn(),
  row: { current: null as null | { id: string; role: "parent" | "professionnel" } },
  sendWelcomeIfDue: vi.fn(async () => {}),
}));

vi.mock("@/lib/auth/server", () => ({ getAuth: () => ({ handler: () => ({ GET: handlerGet }) }) }));
vi.mock("@/lib/auth/welcome", () => ({ sendWelcomeIfDue }));
vi.mock("@/db", async () => ({
  users: (await vi.importActual<typeof import("@/db/schema")>("@/db/schema")).users,
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => (row.current ? [row.current] : []) }) }),
    }),
  },
}));

const PROFILE = "/espace/famille/professionnelles/3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f";

function call(cookie?: string) {
  return GET(
    new NextRequest("https://uat.berceo.be/verification-email/confirmer?token=abc", {
      headers: cookie ? { cookie: `berceo_retour=${encodeURIComponent(cookie)}` } : {},
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  row.current = { id: "u1", role: "parent" };
  handlerGet.mockResolvedValue(
    new Response(JSON.stringify({ user: { id: "auth-1" } }), {
      status: 200,
      headers: { "set-cookie": "__Secure-neon-auth.session_token=s; Path=/; HttpOnly" },
    }),
  );
});

function landing(response: Response): string {
  return new URL(response.headers.get("location") ?? "").pathname;
}

describe("the e-mail confirmation's way back (D-129)", () => {
  it("sends a family with the cookie back to the full profile, and clears the cookie", async () => {
    const response = await call(PROFILE);
    expect(landing(response)).toBe(PROFILE);
    const cleared = response.headers
      .getSetCookie()
      .some((c) => c.startsWith("berceo_retour=") && /expires=thu, 01 jan 1970|max-age=0/i.test(c));
    expect(cleared).toBe(true);
  });

  it("sends a family without the cookie to her space", async () => {
    expect(landing(await call())).toBe("/espace/famille");
  });

  it("drops a way back outside a space", async () => {
    for (const bad of ["//evil.example", "https://evil.example/espace/famille", "/professionnelles/emma-3f0c9a52"]) {
      expect(landing(await call(bad))).toBe("/espace/famille");
    }
  });

  it("never sends a professional to the way back", async () => {
    row.current = { id: "u2", role: "professionnel" };
    expect(landing(await call(PROFILE))).toBe("/espace/professionnelle");
  });

  it("keeps the session cookie Neon Auth answered with", async () => {
    const response = await call(PROFILE);
    expect(response.headers.getSetCookie().some((c) => c.includes("session_token"))).toBe(true);
  });
});
