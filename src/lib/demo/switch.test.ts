import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  DEMO_SWITCH,
  demoAddress,
  demoEnvFrom,
  demoSignInAllowed,
  demoSignInDecision,
  demoSwitchOn,
  isDemoAddress,
  isLocalHost,
  type DemoEnv,
} from "./switch";

/** `npm run demo:dev` on a laptop: the switch on, no Vercel, a development server. */
const LOCAL: DemoEnv = { flag: "1", nodeEnv: "development" };

describe("the demo switch is off everywhere but local (JAM-462)", () => {
  it("is on for a local development server with the switch", () => {
    expect(demoSwitchOn(LOCAL)).toBe(true);
  });

  it("is off when the switch is absent or not exactly 1", () => {
    expect(demoSwitchOn({ nodeEnv: "development" })).toBe(false);
    expect(demoSwitchOn({ ...LOCAL, flag: "true" })).toBe(false);
    expect(demoSwitchOn({ ...LOCAL, flag: "0" })).toBe(false);
  });

  it("is off on every Vercel environment, even with the switch on", () => {
    for (const vercelEnv of ["production", "preview", "development"]) {
      expect(demoSwitchOn({ ...LOCAL, vercelEnv })).toBe(false);
    }
    expect(demoSwitchOn({ ...LOCAL, vercel: "1" })).toBe(false);
  });

  it("is off on a production build, even on a laptop", () => {
    expect(demoSwitchOn({ ...LOCAL, nodeEnv: "production" })).toBe(false);
  });

  it("reads the four variables by their names", () => {
    expect(
      demoEnvFrom({ [DEMO_SWITCH]: "1", VERCEL: "1", VERCEL_ENV: "preview", NODE_ENV: "production" }),
    ).toEqual({ flag: "1", vercel: "1", vercelEnv: "preview", nodeEnv: "production" });
  });
});

describe("the demo sign-in works only on a local development host", () => {
  it("accepts localhost, 127.0.0.1, [::1] and *.localhost, with or without a port", () => {
    for (const host of ["localhost", "localhost:3000", "127.0.0.1:3000", "[::1]:3000", "[::1]", "berceo.localhost:3000"]) {
      expect(isLocalHost(host)).toBe(true);
    }
  });

  it("refuses UAT, production, a preview and look-alike hosts", () => {
    for (const host of [
      "uat.berceo.be",
      "uat.berceo.eu",
      "www.berceo.be",
      "www.berceo.eu",
      "berceo-git-claude-jam-462-kodominio.vercel.app",
      "localhost.berceo.be",
      "localhost.evil.com:3000",
      "evil.com/localhost",
      "127.0.0.1.nip.io",
      "",
      null,
      undefined,
    ]) {
      expect(isLocalHost(host)).toBe(false);
    }
  });

  it("refuses UAT, preview and production even when their variables carry the switch", () => {
    const deployed: [DemoEnv, string][] = [
      [{ flag: "1", vercel: "1", vercelEnv: "production", nodeEnv: "production" }, "www.berceo.be"],
      [{ flag: "1", vercel: "1", vercelEnv: "preview", nodeEnv: "production" }, "uat.berceo.be"],
      [{ flag: "1", vercel: "1", vercelEnv: "preview", nodeEnv: "production" }, "berceo-git-x-kodominio.vercel.app"],
      // A forged Host header does not help on Vercel: the environment refuses first.
      [{ flag: "1", vercel: "1", vercelEnv: "production", nodeEnv: "production" }, "localhost:3000"],
    ];
    for (const [env, host] of deployed) {
      expect(demoSignInAllowed(env, host)).toBe(false);
      expect(demoSignInDecision({ env, host, compte: "famille-serenite", retour: null })).toEqual({ kind: "refuse" });
    }
  });

  it("refuses a local server when the switch is off", () => {
    expect(
      demoSignInDecision({ env: { nodeEnv: "development" }, host: "localhost:3000", compte: "admin-camille", retour: null }),
    ).toEqual({ kind: "refuse" });
  });

  it("signs in a demo account by its name or its address on a local server", () => {
    expect(
      demoSignInDecision({ env: LOCAL, host: "localhost:3000", compte: "famille-serenite", retour: "/espace/famille" }),
    ).toEqual({ kind: "sign-in", email: "test+famille-serenite@jamienisbet.com", retour: "/espace/famille" });
    expect(
      demoSignInDecision({ env: LOCAL, host: "localhost:3000", compte: "Test+Pro-Amelie@jamienisbet.com", retour: null }),
    ).toEqual({ kind: "sign-in", email: "test+pro-amelie@jamienisbet.com", retour: null });
  });

  it("never signs in an account outside the demo set", () => {
    for (const compte of [
      "jamie@jamienisbet.com",
      "test+x@jamienisbet.com.evil.com",
      "test+x@example.com",
      "test+@jamienisbet.com",
      "fondatrice@berceo.be",
      "../admin",
      "",
      null,
    ]) {
      expect(demoSignInDecision({ env: LOCAL, host: "localhost:3000", compte, retour: null })).toEqual({ kind: "refuse" });
    }
  });
});

describe("the demo addresses", () => {
  it("are test+<name>@jamienisbet.com", () => {
    expect(demoAddress("pro-amelie")).toBe("test+pro-amelie@jamienisbet.com");
    expect(isDemoAddress("test+famille-une-nuit@jamienisbet.com")).toBe(true);
    expect(isDemoAddress("test+Famille@jamienisbet.com")).toBe(false);
    expect(() => demoAddress("not valid")).toThrow();
  });
});

describe("each entry point of the demo asks the walls", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

  it("the sign-in route decides with demoSignInDecision", () => {
    expect(read("../../app/api/demo/connexion/route.ts")).toContain("demoSignInDecision(");
  });

  it("the session, the proxy and the e-mail read the switch", () => {
    expect(read("./session.ts")).toContain("demoSignInAllowed(");
    expect(read("../../proxy.ts")).toContain("demoSignInAllowed(");
    expect(read("../email/send.ts")).toContain("demoSwitchOn(");
  });
});
