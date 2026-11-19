import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/db/schema";

/*
 * Spec (JAM-304): « Codes promo » refuses a non-admin at runtime, whatever the
 * page showed, and makes or deactivates nothing on their behalf. A form out of
 * bounds is refused before Stripe is called. The session and the Stripe calls
 * are mocked at their module boundary; neither Stripe nor the database is
 * touched.
 */

const who = vi.hoisted(() => ({ current: { status: "signed-out" } as unknown }));

vi.mock("@/lib/auth/current-user", () => ({ currentUser: async () => who.current }));
vi.mock("@/lib/admin/journal", () => ({
  fullName: (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`,
}));
vi.mock("@/lib/abonnements/promo-codes", () => ({
  createPromoCode: vi.fn(async (draft: { code: string }) => ({ ok: true, code: draft.code })),
  deactivatePromoCode: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createPromoCodeAction, deactivatePromoCodeAction } = await import("./actions");
const { createPromoCode, deactivatePromoCode } = await import("@/lib/abonnements/promo-codes");

const person = (role: User["role"]) =>
  ({ status: "ok", user: { id: `${role}-1`, role, firstName: "Alix", lastName: "Test" } }) as const;

const form = { code: "BIENVENUE", kind: "pourcentage", value: "10", endsOn: "", maxUses: "" };

beforeEach(() => {
  vi.mocked(createPromoCode).mockClear();
  vi.mocked(deactivatePromoCode).mockClear();
});

describe.each([
  ["a signed-out visitor", { status: "signed-out" }],
  ["a parent", person("parent")],
  ["a professional", person("professionnel")],
])("%s", (_name, current) => {
  beforeEach(() => {
    who.current = current;
  });

  it("cannot make a code", async () => {
    expect(await createPromoCodeAction(form)).toEqual({ ok: false, error: "generique" });
    expect(createPromoCode).not.toHaveBeenCalled();
  });

  it("cannot deactivate a code", async () => {
    expect(await deactivatePromoCodeAction("promo_123")).toEqual({ ok: false });
    expect(deactivatePromoCode).not.toHaveBeenCalled();
  });
});

describe("an admin", () => {
  beforeEach(() => {
    who.current = person("admin");
  });

  it("makes a code under her name", async () => {
    expect(await createPromoCodeAction(form)).toEqual({ ok: true, code: "BIENVENUE" });
    expect(createPromoCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: "BIENVENUE", percentOff: 10 }),
      { id: "admin-1", name: "Alix Test" },
      expect.any(Date),
    );
  });

  it("is refused a form out of bounds, and Stripe is not called", async () => {
    expect(await createPromoCodeAction({ ...form, code: "A" })).toEqual({ ok: false, error: "code" });
    expect(await createPromoCodeAction({ ...form, value: "150" })).toEqual({ ok: false, error: "remise" });
    expect(await createPromoCodeAction({ ...form, endsOn: "2020-01-01" })).toEqual({ ok: false, error: "fin" });
    expect(await createPromoCodeAction({ ...form, maxUses: "0" })).toEqual({ ok: false, error: "utilisations" });
    expect(createPromoCode).not.toHaveBeenCalled();
  });

  it("gets Stripe's refusal of a code that exists", async () => {
    vi.mocked(createPromoCode).mockResolvedValueOnce({ ok: false, error: "pris" });
    expect(await createPromoCodeAction(form)).toEqual({ ok: false, error: "pris" });
  });

  it("deactivates a code under her name", async () => {
    expect(await deactivatePromoCodeAction("promo_123")).toEqual({ ok: true });
    expect(deactivatePromoCode).toHaveBeenCalledWith("promo_123", { id: "admin-1", name: "Alix Test" }, expect.any(Date));
  });
});
