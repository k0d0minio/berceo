import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (JAM-306): a conversation belongs to one answer. The start of the night
 * it shows is the start that answer proposes, else the start the family asked
 * for. It never shows the start another professional proposed and the family
 * booked. On the booked answer it is the start the two sides agreed on.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

describe("the start of the night a conversation reads (JAM-306)", () => {
  it("is its own answer's proposal while it waits or is booked, then the family's own start, then the request's start", async () => {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const { conversationStart } = await import("./conversations");
    const q = new PgDialect().sqlToQuery(conversationStart);
    expect(q.sql).toBe(
      `coalesce(case when "care_request_applications"."status" in ('en_attente', 'retenue') then "care_request_applications"."proposed_start_time" end, "care_requests"."requested_start_time", "care_requests"."start_time")`,
    );
    expect(q.params).toEqual([]);
  });
});
