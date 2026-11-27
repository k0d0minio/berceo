import { describe, expect, it } from "vitest";

import type { UserRole } from "@/db/schema";

import { databaseRefusal, parseSeedArgs, seedRole, type SeedArgs } from "./seed-test-roles";

const ok = ["--email", "test+berceo-admin@jamienisbet.com", "--role", "admin", "--target", "uat"];

describe("parseSeedArgs", () => {
  it("reads the three flags", () => {
    expect(parseSeedArgs(ok)).toEqual({
      ok: true,
      args: { email: "test+berceo-admin@jamienisbet.com", role: "admin", target: "uat" },
    });
  });

  it("reads the inline form and normalizes the address", () => {
    const result = parseSeedArgs([
      "--email=Test+Berceo-Admin@JamieNisbet.com",
      "--role=admin",
      "--target=local",
    ]);
    expect(result.ok && result.args.email).toBe("test+berceo-admin@jamienisbet.com");
  });

  it("refuses a missing flag", () => {
    expect(parseSeedArgs(ok.slice(0, 4)).ok).toBe(false);
  });

  it.each([
    "admin@jamienisbet.com",
    "test+berceo-admin@example.com",
    "test+other-admin@jamienisbet.com",
    "test+berceo-admin@jamienisbet.com.evil.be",
  ])("refuses the address %s", (email) => {
    expect(parseSeedArgs(["--email", email, "--role", "admin", "--target", "uat"]).ok).toBe(false);
  });

  it("refuses an unknown role and the target production", () => {
    expect(parseSeedArgs([...ok.slice(0, 2), "--role", "root", "--target", "uat"]).ok).toBe(false);
    expect(parseSeedArgs([...ok.slice(0, 4), "--target", "production"]).ok).toBe(false);
  });
});

describe("databaseRefusal", () => {
  const uat = "postgres://u:p@ep-uat.eu-central-1.aws.neon.tech/neondb";

  it("accepts a database that is not production", () => {
    expect(databaseRefusal({ DATABASE_URL: uat, VERCEL_TARGET_ENV: "uat" })).toBeNull();
  });

  it("refuses a missing or invalid address", () => {
    expect(databaseRefusal({})).not.toBeNull();
    expect(databaseRefusal({ DATABASE_URL: "not a url" })).not.toBeNull();
  });

  it("refuses the production environment of Vercel", () => {
    expect(databaseRefusal({ DATABASE_URL: uat, VERCEL_ENV: "production" })).not.toBeNull();
    expect(databaseRefusal({ DATABASE_URL: uat, VERCEL_TARGET_ENV: "production" })).not.toBeNull();
  });

  it("refuses the host of PRODUCTION_DATABASE_URL", () => {
    expect(
      databaseRefusal({
        DATABASE_URL: uat,
        PRODUCTION_DATABASE_URL: "postgres://x:y@EP-UAT.eu-central-1.aws.neon.tech/other",
      }),
    ).not.toBeNull();
  });
});

describe("seedRole", () => {
  function store(role: UserRole | null) {
    const calls: string[] = [];
    return {
      calls,
      roleOf: async () => role,
      makeAdmin: async (email: string) => {
        calls.push(email);
      },
    };
  }
  const admin: SeedArgs = { email: "test+berceo-admin@jamienisbet.com", role: "admin", target: "uat" };

  it("makes a parent account admin", async () => {
    const s = store("parent");
    expect((await seedRole(admin, s)).ok).toBe(true);
    expect(s.calls).toEqual([admin.email]);
  });

  it("changes nothing on the second run", async () => {
    const s = store("admin");
    expect((await seedRole(admin, s)).ok).toBe(true);
    expect(s.calls).toEqual([]);
  });

  it("fails on an unknown account", async () => {
    expect((await seedRole(admin, store(null))).ok).toBe(false);
  });

  it("confirms a sign-up role and never changes a persona", async () => {
    const pro: SeedArgs = { ...admin, role: "professionnel" };
    expect((await seedRole(pro, store("professionnel"))).ok).toBe(true);
    const s = store("parent");
    expect((await seedRole(pro, s)).ok).toBe(false);
    expect(s.calls).toEqual([]);
  });
});
