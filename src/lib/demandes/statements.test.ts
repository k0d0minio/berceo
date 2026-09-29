import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (reservations-regles-non-appelees, D-156): the rules only the SQL
 * decides are held on the SQL itself. Her list, the priority candidates, the
 * priority write and the answers declined on a cancel. Each statement is
 * built, never run; the test reads its WHERE clause and the value bound to
 * each condition.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const FAMILY = "1f0e4b8a-6c2d-4e7f-9a3b-5d8c1e2f4a60";
const REQUEST = "2a7c9e1b-3d4f-4a6b-8c0d-1e2f3a4b5c61";
const PROFILE = "3b8d0f2c-4e5a-4b7c-9d1e-2f3a4b5c6d72";
const NOW = new Date("2026-09-28T09:15:42.123Z");

type Query = { sql: string; params: unknown[] };

/** The values bound to `<column> <op> $n` anywhere in the statement. */
function bound(query: Query, column: string, op = "="): unknown[] {
  const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped} ${op} \\$(\\d+)`, "g");
  return [...query.sql.matchAll(pattern)].map((match) => query.params[Number(match[1]) - 1]);
}

const REQUEST_STATUS = '"care_requests"."status"';
const ANSWER_STATUS = '"care_request_applications"."status"';
const NIGHT_AHEAD = '("care_requests"."night_date" + "care_requests"."start_time") > (now() AT TIME ZONE $';

describe("her list (professionalRequests)", () => {
  async function query(): Promise<Query> {
    const { herListQuery } = await import("./requests");
    return herListQuery(PROFILE).toSQL();
  }

  it("holds only open requests whose night is ahead, and returns their status", async () => {
    const q = await query();
    expect(bound(q, REQUEST_STATUS)).toEqual(["ouverte"]);
    expect(q.sql).toContain(NIGHT_AHEAD);
    expect(q.sql).toMatch(/^select .*"care_requests"\."status", coalesce/);
  });

  it("holds a request in one of her communes, or one sent to her in priority wherever it is", async () => {
    const q = await query();
    expect(q.sql).toMatch(
      /\("care_requests"\."priority_profile_id" = \$\d+ or "care_requests"\."commune_ins" in \(select "commune_ins" from "professional_communes" where "professional_communes"\."profile_id" = \$\d+\)\)/,
    );
    expect(bound(q, '"professional_communes"."profile_id"')).toEqual([PROFILE]);
    // The filter, and the priority-first order and flag: every one is her.
    expect(bound(q, '"care_requests"."priority_profile_id"')).toEqual([PROFILE, PROFILE, PROFILE]);
  });

  it("reads her own answer only, and hides a request she was declined on", async () => {
    const q = await query();
    expect(bound(q, '"care_request_applications"."profile_id"')).toEqual([PROFILE]);
    expect(q.sql).toContain(`(${ANSWER_STATUS} is null or ${ANSWER_STATUS} <> $`);
    expect(bound(q, ANSWER_STATUS, "<>")).toEqual(["non_retenue"]);
  });

  it("hides a request on a night she holds a confirmed booking", async () => {
    const q = await query();
    expect(q.sql).toMatch(
      /not exists \(select "id" from "bookings" where \("bookings"\."profile_id" = \$\d+ and "bookings"\."night_date" = "care_requests"\."night_date" and "bookings"\."status" = \$\d+\)\)/,
    );
    expect(bound(q, '"bookings"."profile_id"')).toEqual([PROFILE]);
    expect(bound(q, '"bookings"."status"')).toEqual(["confirmee"]);
  });

  it("puts the priority requests first, then the urgent ones, then the newest", async () => {
    const q = await query();
    expect(q.sql).toMatch(
      /order by coalesce\("care_requests"\."priority_profile_id" = \$\d+, false\) desc, "care_requests"\."urgent" desc, "care_requests"\."created_at" desc$/,
    );
  });
});

/** Her own open request ahead, never sent in priority, that this professional could still answer. */
function expectReachableUnsent(q: Query) {
  expect(bound(q, '"care_requests"."family_user_id"')).toEqual([FAMILY]);
  expect(bound(q, REQUEST_STATUS)).toEqual(["ouverte"]);
  expect(q.sql).toContain(NIGHT_AHEAD);
  expect(q.sql).toContain('"care_requests"."priority_sent_at" is null');
  // Not declined on it (D-70).
  expect(q.sql).toMatch(
    /not exists \(select "id" from "care_request_applications" where \("care_request_applications"\."request_id" = "care_requests"\."id" and "care_request_applications"\."profile_id" = \$\d+ and "care_request_applications"\."status" = \$\d+\)\)/,
  );
  expect(bound(q, '"care_request_applications"."profile_id"')).toEqual([PROFILE]);
  expect(bound(q, ANSWER_STATUS)).toEqual(["non_retenue"]);
  // No confirmed garde of hers that night (D-73).
  expect(q.sql).toMatch(
    /not exists \(select "id" from "bookings" where \("bookings"\."profile_id" = \$\d+ and "bookings"\."night_date" = "care_requests"\."night_date" and "bookings"\."status" = \$\d+\)\)/,
  );
  expect(bound(q, '"bookings"."profile_id"')).toEqual([PROFILE]);
  expect(bound(q, '"bookings"."status"')).toEqual(["confirmee"]);
}

describe("the priority request (D-71)", () => {
  it("offers only her open requests ahead, never sent, that the professional could answer", async () => {
    const { priorityCandidatesQuery } = await import("./requests");
    expectReachableUnsent(priorityCandidatesQuery(FAMILY, PROFILE).toSQL());
  });

  it("is written once, on the same request, to a validated professional who is not suspended", async () => {
    const { setPriorityStatement } = await import("./requests");
    const q = setPriorityStatement(FAMILY, REQUEST, PROFILE, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_requests" set "priority_profile_id" = \$1, "priority_sent_at" = \$2/);
    expect(q.params.slice(0, 2)).toEqual([PROFILE, NOW.toISOString()]);
    expect(bound(q, '"care_requests"."id"')).toEqual([REQUEST]);
    expectReachableUnsent(q);
    expect(bound(q, '"professional_profiles"."id"')).toEqual([PROFILE]);
    expect(bound(q, '"professional_profiles"."status"')).toEqual(["valide"]);
    expect(q.sql).toContain("su.suspended_at is not null");
  });
});

describe("cancelling a request (D-76)", () => {
  it("declines the answers still waiting on it, only once it is cancelled, and no other", async () => {
    const { cancelDeclinesAnswers } = await import("./requests");
    const q = cancelDeclinesAnswers(FAMILY, REQUEST, NOW).toSQL();
    expect(q.sql).toMatch(/^update "care_request_applications" set "status" = \$1, "updated_at" = \$2 where/);
    expect(q.params.slice(0, 2)).toEqual(["non_retenue", NOW.toISOString()]);
    expect(bound(q, '"care_request_applications"."request_id"')).toEqual([REQUEST]);
    expect(bound(q, ANSWER_STATUS)).toEqual(["en_attente"]);
    expect(bound(q, '"care_requests"."id"')).toEqual([REQUEST]);
    expect(bound(q, '"care_requests"."family_user_id"')).toEqual([FAMILY]);
    expect(bound(q, REQUEST_STATUS)).toEqual(["annulee"]);
    // A withdrawn, booked or already declined answer is never named.
    for (const kept of ["retiree", "retenue"]) expect(q.params).not.toContain(kept);
    expect(q.params.filter((p) => p === "non_retenue")).toHaveLength(1);
  });
});
