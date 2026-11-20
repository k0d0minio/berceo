import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (JAM-353): what a republication of a regular request does is decided by
 * the SQL alone, so the SQL is what is held. Each open night ahead of her
 * request is marked (criterion 2), no value of a night but the republication
 * changes (criterion 3), a request with a booked night is not marked
 * (criterion 4), and each answer that waits on a marked night is declined
 * (criterion 2). Each statement names the family: the id of a different
 * family's request changes nothing. Each statement is built, never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const FAMILY = "1f0e4b8a-6c2d-4e7f-9a3b-5d8c1e2f4a60";
const SERIES = "4c9e1a3d-5f6b-4c8d-8e2f-3a4b5c6d7e83";
const NOW = new Date("2026-09-28T09:15:42.123Z");

type Query = { sql: string; params: unknown[] };

/** The values bound to `<column> <op> $n` anywhere in the statement. */
function bound(query: Query, column: string, op = "="): unknown[] {
  const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped} ${op} \\$(\\d+)`, "g");
  return [...query.sql.matchAll(pattern)].map((match) => query.params[Number(match[1]) - 1]);
}

const flat = (query: Query) => query.sql.replace(/\s+/g, " ");

describe("republishing a regular request (JAM-353)", () => {
  it("marks her open nights ahead of the request, and only hers", async () => {
    const { republishSeriesStatement } = await import("./republish-series");
    const q = republishSeriesStatement(FAMILY, SERIES, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_requests" set /);
    expect(bound(q, '"care_requests"."series_id"')).toEqual([SERIES]);
    expect(bound(q, '"care_requests"."family_user_id"')).toEqual([FAMILY]);
    expect(bound(q, '"care_requests"."series_whole"')).toEqual([true]);
    expect(bound(q, '"care_requests"."status"')).toEqual(["ouverte"]);
    expect(q.sql).toContain('("care_requests"."night_date" + "care_requests"."start_time") > (now() AT TIME ZONE');
  });

  it("changes the republication of a night and no other value", async () => {
    const { republishSeriesStatement } = await import("./republish-series");
    const q = republishSeriesStatement(FAMILY, SERIES, NOW).toSQL();
    const set = q.sql.slice(0, q.sql.indexOf(" where "));
    const columns = [...set.matchAll(/"(\w+)" = /g)].map((match) => match[1]).sort();
    expect(columns).toEqual(["republish_count", "republished_at", "updated_at"]);
    expect(set).toMatch(/"republish_count" = \S*"republish_count" \+ 1/);
    expect(q.params.filter((param) => param === NOW.toISOString())).toHaveLength(2);
  });

  it("marks nothing when a night of her request is booked", async () => {
    const { republishSeriesStatement } = await import("./republish-series");
    const q = republishSeriesStatement(FAMILY, SERIES, NOW).toSQL();
    const sql = flat(q);
    expect(sql).toContain("not exists ( select 1 from care_requests booked where");
    expect(sql).toContain("and booked.status = 'attribuee'");
    expect(bound(q, "booked.series_id")).toEqual([SERIES]);
    expect(bound(q, "booked.family_user_id")).toEqual([FAMILY]);
  });

  it("marks nothing when no answer waits on one of her open nights ahead", async () => {
    const { republishSeriesStatement } = await import("./republish-series");
    const q = republishSeriesStatement(FAMILY, SERIES, NOW).toSQL();
    const sql = flat(q);
    expect(sql).toContain(
      "exists ( select 1 from care_request_applications a join care_requests night on night.id = a.request_id where",
    );
    expect(bound(q, "night.series_id")).toEqual([SERIES]);
    expect(bound(q, "night.family_user_id")).toEqual([FAMILY]);
    expect(sql).toContain("and night.series_whole");
    expect(sql).toContain("and night.status = 'ouverte'");
    expect(sql).toContain("and (night.night_date + night.start_time) > (now() AT TIME ZONE");
    expect(sql).toContain("and a.status = 'en_attente'");
  });

  it("declines each answer that waits on a night this call marked, and no other answer", async () => {
    const { republishSeriesDeclinesAnswers } = await import("./republish-series");
    const q = republishSeriesDeclinesAnswers(FAMILY, SERIES, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_request_applications" set "status" = \$1, "updated_at" = \$2 where/);
    expect(q.params.slice(0, 2)).toEqual(["non_retenue", NOW.toISOString()]);
    expect(bound(q, '"care_request_applications"."status"')).toEqual(["en_attente"]);
    expect(q.sql).toMatch(/"care_request_applications"\."request_id" in \(select \S*"id" from "care_requests" where/);
    expect(bound(q, '"care_requests"."series_id"')).toEqual([SERIES]);
    expect(bound(q, '"care_requests"."family_user_id"')).toEqual([FAMILY]);
    expect(bound(q, '"care_requests"."series_whole"')).toEqual([true]);
    expect(bound(q, '"care_requests"."status"')).toEqual(["ouverte"]);
    expect(bound(q, '"care_requests"."republished_at"')).toEqual([NOW.toISOString()]);
    for (const kept of ["retiree", "retenue"]) expect(q.params).not.toContain(kept);
  });

  it("refuses an id that is not a request id, with no statement", async () => {
    const { republishSeries } = await import("./republish-series");
    await expect(republishSeries(FAMILY, "not-an-id", NOW)).resolves.toEqual({ ok: false });
  });
});
