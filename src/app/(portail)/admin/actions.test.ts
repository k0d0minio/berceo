import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/db/schema";

/*
 * Spec (verification-back-office): each server action of the admin space
 * refuses a non-admin at runtime, whatever the page showed, and does nothing
 * on their behalf. The session, the review and the settings are mocked at
 * their module boundary; no database is touched.
 */

const who = vi.hoisted(() => ({ current: { status: "signed-out" } as unknown }));

vi.mock("@/lib/auth/current-user", () => ({ currentUser: async () => who.current }));
vi.mock("@/lib/admin/review", () => ({ decide: vi.fn(async () => ({ ok: true, email: "envoye" })) }));
vi.mock("@/lib/admin/journal", () => ({
  fullName: (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`,
}));
vi.mock("@/lib/settings", () => ({ setStudentsAdmitted: vi.fn(async () => {}) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ origin: "https://uat.berceo.be" }) }));

const { decideFile, setStudents } = await import("./actions");
const { decide } = await import("@/lib/admin/review");
const { setStudentsAdmitted } = await import("@/lib/settings");

const person = (role: User["role"]) =>
  ({ status: "ok", user: { id: `${role}-1`, role, firstName: "Alix", lastName: "Test" } }) as const;

const request = {
  profileId: "3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f",
  decision: "valider",
  expected: { status: "en_attente", reviewedAt: null },
};

beforeEach(() => {
  vi.mocked(decide).mockClear();
  vi.mocked(setStudentsAdmitted).mockClear();
});

describe.each([
  ["a signed-out visitor", { status: "signed-out" }],
  ["a parent", person("parent")],
  ["a professional", person("professionnel")],
])("%s", (_name, current) => {
  beforeEach(() => {
    who.current = current;
  });

  it("cannot take a decision on a file", async () => {
    for (const decision of ["valider", "complement", "refuser"]) {
      const result = await decideFile({ ...request, decision, reason: "Un motif" });
      expect(result).toEqual({ ok: false, error: "generique" });
    }
    expect(decide).not.toHaveBeenCalled();
  });

  it("cannot flip the students switch", async () => {
    expect(await setStudents(true)).toEqual({ ok: false });
    expect(setStudentsAdmitted).not.toHaveBeenCalled();
  });
});

describe("an admin", () => {
  beforeEach(() => {
    who.current = person("admin");
  });

  it("takes a decision, with the page's expected state and this site's address", async () => {
    expect(await decideFile(request)).toEqual({ ok: true, email: "envoye" });
    expect(decide).toHaveBeenCalledWith(
      { ...request, reason: undefined },
      expect.objectContaining({ id: "admin-1" }),
      "https://uat.berceo.be",
    );
  });

  it("flips the students switch under her name", async () => {
    expect(await setStudents(true)).toEqual({ ok: true });
    expect(setStudentsAdmitted).toHaveBeenCalledWith(true, { id: "admin-1", name: "Alix Test" });
  });

  it("is refused a request that is not one", async () => {
    for (const bad of [
      { ...request, profileId: "not-a-uuid" },
      { ...request, decision: "supprimer" },
      { ...request, expected: { status: "inconnu", reviewedAt: null } },
      { ...request, expected: { status: "en_attente", reviewedAt: "hier" } },
    ]) {
      expect(await decideFile(bad)).toEqual({ ok: false, error: "generique" });
    }
    expect(decide).not.toHaveBeenCalled();
  });
});
