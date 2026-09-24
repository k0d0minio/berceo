import { describe, expect, it, vi } from "vitest";

import type { UserRole } from "@/db/schema";

import { emailFromArgs, grantAdmin, type GrantStore } from "./grant-admin";

/** Spec: admin:grant turns an existing account into an admin and refuses an unknown address. */

function store(roles: Record<string, UserRole>): GrantStore {
  return {
    roleOf: async (email) => roles[email] ?? null,
    makeAdmin: vi.fn(async (email: string) => {
      roles[email] = "admin";
    }),
  };
}

describe("admin:grant", () => {
  it("promotes an existing account", async () => {
    const s = store({ "alix@exemple.be": "parent" });
    const result = await grantAdmin("alix@exemple.be", s);
    expect(result).toEqual({ ok: true, email: "alix@exemple.be", before: "parent", changed: true });
    expect(s.makeAdmin).toHaveBeenCalledWith("alix@exemple.be");
  });

  it("refuses an unknown address and changes nothing", async () => {
    const s = store({});
    expect(await grantAdmin("personne@exemple.be", s)).toEqual({ ok: false, reason: "unknown" });
    expect(s.makeAdmin).not.toHaveBeenCalled();
  });

  it("leaves an admin as it is", async () => {
    const s = store({ "jordane@exemple.be": "admin" });
    const result = await grantAdmin("jordane@exemple.be", s);
    expect(result).toMatchObject({ ok: true, changed: false });
    expect(s.makeAdmin).not.toHaveBeenCalled();
  });

  it("asks for an address when none is given", async () => {
    expect(await grantAdmin(null, store({}))).toEqual({ ok: false, reason: "usage" });
  });

  it("reads --email in both forms, lower-cased", () => {
    expect(emailFromArgs(["--email", "Alix@Exemple.be"])).toBe("alix@exemple.be");
    expect(emailFromArgs(["--email=alix@exemple.be"])).toBe("alix@exemple.be");
    expect(emailFromArgs([])).toBeNull();
  });
});
