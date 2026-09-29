import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/db";

import { scheduleWelcomeIfDue, sendWelcomeIfDue } from "./welcome";

/**
 * Spec (comptes-welcome-email-no-retry): a family's welcome e-mail is asked
 * for after the response (D-166), on the confirmer's first click and again on
 * every visit to her home until one send goes out (D-165). Only a parent whose
 * `welcome_sent_at` is null is asked for; the link carries the origin the
 * caller read before the deferred work. The claim is one conditional UPDATE,
 * so a concurrent attempt that loses it sends nothing, and a failed send
 * releases it for the next visit.
 */

const { after, sendEmail, claimed, sets } = vi.hoisted(() => ({
  after: vi.fn(),
  sendEmail: vi.fn(async () => {}),
  claimed: { rows: [{ id: "u1" }] as { id: string }[] },
  sets: [] as Record<string, unknown>[],
}));

vi.mock("next/server", () => ({ after }));
vi.mock("@/lib/email/send", () => ({ sendEmail }));
vi.mock("@/lib/email/templates", () => ({
  welcomeFamilyEmail: (input: { url: string }) => ({ subject: "Bienvenue", url: input.url }),
}));
vi.mock("@/db", async () => ({
  users: (await vi.importActual<typeof import("@/db/schema")>("@/db/schema")).users,
  db: {
    update: () => ({
      set: (values: Record<string, unknown>) => {
        sets.push(values);
        return {
          where: () => Object.assign(Promise.resolve(), { returning: async () => claimed.rows }),
        };
      },
    }),
  },
}));

const ORIGIN = "https://uat.berceo.be";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    role: "parent",
    email: "famille@example.be",
    firstName: "Léa",
    welcomeSentAt: null,
    ...overrides,
  } as User;
}

/** Runs what `after()` was handed, as Next does once the response is sent. */
async function runDeferred(): Promise<void> {
  for (const [task] of after.mock.calls) await (task as () => Promise<void>)();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  claimed.rows = [{ id: "u1" }];
  sets.length = 0;
});

describe("scheduleWelcomeIfDue (D-165, D-166)", () => {
  it("schedules the welcome for a parent never welcomed, and sends nothing before the response", () => {
    scheduleWelcomeIfDue(user(), ORIGIN);
    expect(after).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sets).toEqual([]);
  });

  it("schedules nothing once the welcome has gone out", () => {
    scheduleWelcomeIfDue(user({ welcomeSentAt: new Date("2026-09-28T10:00:00Z") }), ORIGIN);
    expect(after).not.toHaveBeenCalled();
  });

  it("schedules nothing for a professional", () => {
    scheduleWelcomeIfDue(user({ role: "professionnel" }), ORIGIN);
    expect(after).not.toHaveBeenCalled();
  });

  it("links the e-mail to the origin read before the deferred work", async () => {
    scheduleWelcomeIfDue(user(), ORIGIN);
    await runDeferred();
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      "famille@example.be",
      expect.objectContaining({ url: `${ORIGIN}/espace/famille` }),
      "welcome-u1",
    );
  });
});

describe("sendWelcomeIfDue's claim", () => {
  it("sends nothing when a concurrent attempt already holds the claim", async () => {
    claimed.rows = [];
    await sendWelcomeIfDue(user(), ORIGIN);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("releases the claim when the send fails, so the next visit tries again", async () => {
    sendEmail.mockRejectedValueOnce(new Error("resend down"));
    await sendWelcomeIfDue(user(), ORIGIN);
    expect(sets).toHaveLength(2);
    expect(sets[0].welcomeSentAt).toBeInstanceOf(Date);
    expect(sets[1]).toEqual({ welcomeSentAt: null });
  });

  it("keeps the claim when the send succeeds", async () => {
    await sendWelcomeIfDue(user(), ORIGIN);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sets).toHaveLength(1);
  });
});
