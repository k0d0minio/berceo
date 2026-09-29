import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

/**
 * Spec (recherche-et-fiches-publiques, D-129): a family who signed up from a
 * full profile lands back on it once she confirms her e-mail in the same
 * browser; without the cookie, or with a way back we do not accept, she lands
 * in her space; a professional always lands in hers. The cookie is cleared.
 *
 * Spec (comptes-welcome-email-no-retry): the welcome is scheduled after the
 * redirect, never awaited (D-166); a failed `users` read still hands over
 * Neon's session cookies and lands on sign-in, never a 500.
 */

const { handlerGet, row, scheduleWelcomeIfDue } = vi.hoisted(() => ({
  handlerGet: vi.fn(),
  row: {
    current: null as null | { id: string; role: "parent" | "professionnel" },
    fails: false,
  },
  scheduleWelcomeIfDue: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ getAuth: () => ({ handler: () => ({ GET: handlerGet }) }) }));
vi.mock("@/lib/auth/welcome", () => ({ scheduleWelcomeIfDue }));
vi.mock("@/db", async () => ({
  users: (await vi.importActual<typeof import("@/db/schema")>("@/db/schema")).users,
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            if (row.fails) throw new Error("connection terminated");
            return row.current ? [row.current] : [];
          },
        }),
      }),
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
  vi.spyOn(console, "error").mockImplementation(() => {});
  row.current = { id: "u1", role: "parent" };
  row.fails = false;
  // A fresh response per call: a body can be read once.
  handlerGet.mockImplementation(
    async () =>
      new Response(JSON.stringify({ user: { id: "auth-1" } }), {
        status: 200,
        headers: { "set-cookie": "__Secure-neon-auth.session_token=s; Path=/; HttpOnly" },
      }),
  );
});

function landing(response: Response): string {
  return new URL(response.headers.get("location") ?? "").pathname;
}

function target(response: Response): string {
  const url = new URL(response.headers.get("location") ?? "");
  return url.pathname + url.search;
}

function hasSession(response: Response): boolean {
  return response.headers.getSetCookie().some((c) => c.includes("session_token"));
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

describe("the confirmer's other landings", () => {
  it("sends a verified identity with no users row to sign-in, told the account is unavailable", async () => {
    row.current = null;
    expect(target(await call())).toBe("/connexion?erreur=compte");
  });

  it("sends an expired or forged token to sign-in, told the link is no longer valid", async () => {
    handlerGet.mockImplementation(async () => new Response(null, { status: 400 }));
    expect(target(await call())).toBe("/connexion?lien=invalide");
  });

  it("sends a second click, which brings no new session, to sign-in, told it is done", async () => {
    handlerGet.mockImplementation(
      async () => new Response(JSON.stringify({ user: { id: "auth-1" } }), { status: 200 }),
    );
    expect(target(await call())).toBe("/connexion?verifie=1");
  });

  it("sends a link without a token to sign-in, told the link is no longer valid", async () => {
    const response = await GET(new NextRequest("https://uat.berceo.be/verification-email/confirmer"));
    expect(target(response)).toBe("/connexion?lien=invalide");
  });
});

describe("the welcome e-mail on the first click (D-166)", () => {
  it("is scheduled for the verified row with this deployment's origin, not sent in the request", async () => {
    await call();
    expect(scheduleWelcomeIfDue).toHaveBeenCalledTimes(1);
    expect(scheduleWelcomeIfDue).toHaveBeenCalledWith(row.current, "https://uat.berceo.be");
  });

  it("is not scheduled when the identity has no users row", async () => {
    row.current = null;
    await call();
    expect(scheduleWelcomeIfDue).not.toHaveBeenCalled();
  });
});

describe("a failed users read after Neon consumed the token", () => {
  it("lands on sign-in, told it is done, with Neon's session cookies still set", async () => {
    row.fails = true;
    const response = await call(PROFILE);
    expect(response.status).toBe(307);
    expect(target(response)).toBe("/connexion?verifie=1");
    expect(hasSession(response)).toBe(true);
    expect(scheduleWelcomeIfDue).not.toHaveBeenCalled();
  });

  it("logs one [comptes] line with the identity's id and no error body", async () => {
    row.fails = true;
    await call();
    expect(console.error).toHaveBeenCalledTimes(1);
    const [message, context] = vi.mocked(console.error).mock.calls[0];
    expect(message).toMatch(/^\[comptes\] /);
    expect(context).toEqual({ authUserId: "auth-1", error: "Error" });
  });
});
