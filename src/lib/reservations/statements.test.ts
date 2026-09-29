import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (reservations-regles-non-appelees, D-167): what republishing and
 * accepting do to the answers is decided by the SQL alone, so the SQL is what
 * is held. Republishing declines every waiting answer; accepting declines the
 * other waiting answers on the request and withdraws the booked professional's
 * waiting answers elsewhere that night (D-70, D-73). Each statement is built,
 * never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const FAMILY = "1f0e4b8a-6c2d-4e7f-9a3b-5d8c1e2f4a60";
const REQUEST = "2a7c9e1b-3d4f-4a6b-8c0d-1e2f3a4b5c61";
const CHOSEN = "4c9e1a3d-5f6b-4c8d-8e2f-3a4b5c6d7e83";
const NOW = new Date("2026-09-28T09:15:42.123Z");

type Query = { sql: string; params: unknown[] };

/** The values bound to `<column> <op> $n` anywhere in the statement. */
function bound(query: Query, column: string, op = "="): unknown[] {
  const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped} ${op} \\$(\\d+)`, "g");
  return [...query.sql.matchAll(pattern)].map((match) => query.params[Number(match[1]) - 1]);
}

const ANSWER_STATUS = '"care_request_applications"."status"';

describe("republishing a request (D-70)", () => {
  it("declines the answers still waiting on it, only once this call marked it republished", async () => {
    const { republishDeclinesAnswers } = await import("./answers");
    const q = republishDeclinesAnswers(FAMILY, REQUEST, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_request_applications" set "status" = \$1, "updated_at" = \$2 where/);
    expect(q.params.slice(0, 2)).toEqual(["non_retenue", NOW.toISOString()]);
    expect(bound(q, '"care_request_applications"."request_id"')).toEqual([REQUEST]);
    expect(bound(q, ANSWER_STATUS)).toEqual(["en_attente"]);
    expect(bound(q, '"care_requests"."family_user_id"')).toEqual([FAMILY]);
    expect(bound(q, '"care_requests"."republished_at"')).toEqual([NOW.toISOString()]);
    for (const kept of ["retiree", "retenue"]) expect(q.params).not.toContain(kept);
  });
});

describe("accepting an answer", () => {
  it("declines the other answers still waiting on the request, never the chosen one, once it is booked", async () => {
    const { acceptDeclinesOthers } = await import("./bookings");
    const q = acceptDeclinesOthers(REQUEST, CHOSEN, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_request_applications" set "status" = \$1, "updated_at" = \$2 where/);
    expect(q.params.slice(0, 2)).toEqual(["non_retenue", NOW.toISOString()]);
    expect(bound(q, '"care_request_applications"."request_id"')).toEqual([REQUEST]);
    expect(bound(q, '"care_request_applications"."id"', "<>")).toEqual([CHOSEN]);
    expect(bound(q, ANSWER_STATUS)).toEqual(["en_attente"]);
    expect(q.sql).toMatch(/exists \(select 1 from "bookings" where "bookings"\."request_id" = \$\d+\)/);
    expect(bound(q, '"bookings"."request_id"')).toEqual([REQUEST]);
    for (const kept of ["retiree", "retenue"]) expect(q.params).not.toContain(kept);
  });

  it("withdraws her answers still waiting on other requests of the booked night (D-73)", async () => {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const { acceptWithdrawsHersThatNight } = await import("./bookings");
    const q = new PgDialect().sqlToQuery(acceptWithdrawsHersThatNight(REQUEST, NOW.toISOString()));
    const sql = q.sql.replace(/\s+/g, " ").trim();
    expect(sql).toMatch(/^update care_request_applications a set status = 'retiree', updated_at = \$1::timestamptz/);
    expect(q.params[0]).toBe(NOW.toISOString());
    // The booking made on this request names her and the night.
    expect(sql).toContain("from bookings b, care_requests r where b.request_id = $2");
    expect(sql).toContain("and a.profile_id = b.profile_id");
    expect(sql).toContain("and r.id = a.request_id and r.night_date = b.night_date");
    // Only her waiting answers, and never the one on the request just booked.
    expect(sql).toContain("and a.status = 'en_attente'");
    expect(sql).toContain("and a.request_id <> $3");
    expect(q.params.slice(1)).toEqual([REQUEST, REQUEST]);
  });
});
