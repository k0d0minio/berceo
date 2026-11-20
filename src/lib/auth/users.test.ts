import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Spec (JAM-342): the sign-up asks `userExistsByEmail` before it makes an
 * identity, and `isEmailTaken` tells a unique violation on the address's
 * constraint from each other failed write. The database is mocked at `@/db`.
 */

const m = vi.hoisted(() => ({
  rows: vi.fn(async (): Promise<{ id: string }[]> => []),
  where: vi.fn(),
}));

vi.mock("@/db", async () => {
  const schema = await vi.importActual<typeof import("@/db/schema")>("@/db/schema");
  return {
    users: schema.users,
    db: {
      select: () => ({
        from: () => ({
          where: (condition: unknown) => {
            m.where(condition);
            return { limit: m.rows };
          },
        }),
      }),
    },
  };
});

const { isEmailTaken, userExistsByEmail } = await import("./users");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("userExistsByEmail", () => {
  it("is true when a users row carries the address", async () => {
    m.rows.mockResolvedValue([{ id: "u-1" }]);
    expect(await userExistsByEmail("julie.dupont@exemple.be")).toBe(true);
    expect(m.where).toHaveBeenCalledTimes(1);
  });

  it("is false when no row carries it", async () => {
    m.rows.mockResolvedValue([]);
    expect(await userExistsByEmail("julie.dupont@exemple.be")).toBe(false);
  });
});

describe("isEmailTaken", () => {
  const violation = { code: "23505", constraint: "users_email_unique" };

  it("reads the driver's error", () => {
    expect(isEmailTaken(violation)).toBe(true);
  });

  it("reads the cause of Drizzle's wrapped error", () => {
    expect(isEmailTaken(Object.assign(new Error("Failed query"), { cause: violation }))).toBe(true);
  });

  it("reads the constraint in the message when the driver names none", () => {
    const message = 'duplicate key value violates unique constraint "users_email_unique"';
    expect(isEmailTaken({ code: "23505", message })).toBe(true);
  });

  it.each([
    ["a unique violation on a different constraint", { code: "23505", constraint: "users_auth_user_id_unique" }],
    ["a different Postgres error on the same constraint", { code: "23514", constraint: "users_email_unique" }],
    ["an error with no code", new Error("connection reset")],
    ["null", null],
    ["a string", "23505 users_email_unique"],
  ])("is false for %s", (_what, error) => {
    expect(isEmailTaken(error)).toBe(false);
  });
});
