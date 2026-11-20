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

// Spec (zone-rayon-lecture): she answers a request in any commune her radius reaches. The read
// before the answer and the INSERT hold the same predicate: « Toute la Belgique », or her reach.
describe("the commune an answer reaches", () => {
  const PROFILE = "3b8d0f2c-4e5a-4b7c-9d1e-2f3a4b5c6d72";

  it("reads « Toute la Belgique » or her reach, her radius and her own communes, never her chosen communes", async () => {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const { careRequests } = await import("@/db");
    const { reachesCommune } = await import("./answers");
    const q = new PgDialect().sqlToQuery(reachesCommune(PROFILE, careRequests.communeIns));
    const sql = q.sql.replace(/\s+/g, " ").trim();
    expect(sql).toBe(
      '( exists (select 1 from professional_profiles zp where zp.id = $1 and zp.zone_whole_belgium) or exists (select 1 from professional_reach pr where pr.profile_id = $2 and pr.commune_ins = "care_requests"."commune_ins") )',
    );
    expect(q.params).toEqual([PROFILE, PROFILE]);
    expect(sql).not.toContain("professional_communes");
  });

  it("binds nothing inside the INSERT, where the profile and the request are its own rows", async () => {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const { sql: raw } = await import("drizzle-orm");
    const { reachesCommune } = await import("./answers");
    const q = new PgDialect().sqlToQuery(reachesCommune(raw`p.id`, raw`r.commune_ins`));
    expect(q.sql.replace(/\s+/g, " ")).toContain("zp.id = p.id and zp.zone_whole_belgium");
    expect(q.sql.replace(/\s+/g, " ")).toContain("pr.profile_id = p.id and pr.commune_ins = r.commune_ins");
    expect(q.params).toEqual([]);
  });
});

describe("the rates saved on her answers (JAM-344)", () => {
  it("reads only her own answers still waiting, on the requests asked for", async () => {
    const { savedRatesQuery } = await import("./answers");
    const HER = "5d0f2b4e-6a7c-4d9e-8f3a-4b5c6d7e8f94";
    const q = savedRatesQuery(HER, [REQUEST]).toSQL();
    // Her rates (JAM-344) and the start she proposed (JAM-306).
    expect(q.sql).toMatch(/^select "care_request_applications"\."request_id", "care_request_applications"\."night_rate_eur", "care_request_applications"\."extra_hour_rate_eur", "care_request_applications"\."proposed_start_time" from "care_request_applications"/);
    expect(q.sql).toContain(
      'inner join "professional_profiles" on "professional_profiles"."id" = "care_request_applications"."profile_id"',
    );
    expect(bound(q, '"professional_profiles"."user_id"')).toEqual([HER]);
    expect(bound(q, ANSWER_STATUS)).toEqual(["en_attente"]);
    expect(q.params).toContain(REQUEST);
    for (const other of ["retiree", "retenue", "non_retenue"]) expect(q.params).not.toContain(other);
  });
});

/**
 * Spec (JAM-306): the booking of an answer that proposes a different start
 * gives the night that start, and keeps the start the family asked for. One
 * statement does it, in the booking's own batch, and only for the booked
 * answer of that request. An answer with no proposal changes neither column.
 */
describe("the start of a booked night (JAM-306)", () => {
  it("takes the booked answer's proposed start and keeps the family's as a record", async () => {
    const { bookingSetsTheStart } = await import("./bookings");
    const q = bookingSetsTheStart(REQUEST, CHOSEN, NOW).toSQL();
    const sql = q.sql.replace(/\s+/g, " ");
    expect(sql).toMatch(/^update "care_requests" set /);
    // The proposal is read from the booked answer of this request, nowhere else.
    const proposed =
      /\( select pa\.proposed_start_time from care_request_applications pa where pa\.id = \$\d+ and pa\.request_id = \$\d+ and pa\.status = 'retenue' \)/;
    expect(sql.match(new RegExp(proposed, "g"))).toHaveLength(2);
    // The new start is the proposal, or the old start. The right side reads the row as it was.
    expect(sql).toMatch(/"start_time" = coalesce\(nullif\(\( select pa\.proposed_start_time .*?\), "start_time"\), "start_time"\)/);
    // The record is the old start, written only when a proposal replaces it.
    expect(sql).toMatch(
      /"requested_start_time" = case when nullif\(\( select pa\.proposed_start_time .*?\), "start_time"\) is not null then "start_time" else "requested_start_time" end/,
    );
    expect(q.params).toContain("attribuee");
    expect(q.params.filter((param) => param === CHOSEN)).toHaveLength(2);
    // Only the open request of the booking, once the booking exists.
    expect(bound(q, '"care_requests"."id"')).toEqual([REQUEST]);
    expect(bound(q, '"care_requests"."status"')).toEqual(["ouverte"]);
    expect(sql).toMatch(/exists \(select 1 from "bookings" where "bookings"\."request_id" = \$\d+\)/);
  });

  it("reads her proposal for each night of a regular request from the list of the form", async () => {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const { seriesProposal } = await import("./answers");
    const dialect = new PgDialect();
    const none = dialect.sqlToQuery(seriesProposal([]));
    expect(none.sql).toBe("null::time");
    expect(none.params).toEqual([]);

    const OTHER = "6e1a3c5f-7b8d-4e0f-9a4b-5c6d7e8f9a05";
    const q = dialect.sqlToQuery(seriesProposal([[REQUEST, "20:00"], [OTHER, "18:30"]]));
    expect(q.sql.replace(/\s+/g, " ")).toBe(
      "(select h.start from (values ($1::uuid, $2::time), ($3::uuid, $4::time)) as h(request_id, start) where h.request_id = ok.id)",
    );
    // Every value is bound: nothing of the form reaches the SQL text.
    expect(q.params).toEqual([REQUEST, "20:00", OTHER, "18:30"]);
  });
});

/**
 * Spec (JAM-349): she changes or removes her proposed start on her waiting
 * answer, in one statement. The row is hers by her profile id, and only an
 * answer that waits on an open night ahead is written. The change moves
 * `answered_at`, so the booking refuses a fee that the family opened on the
 * proposal of before, and `answer_count`, so the family's e-mail of the change has a new
 * key. Each statement is built, never run.
 */
describe("a proposed start changed in place (JAM-349)", () => {
  const PROFILE = "3b8d0f2c-4e5a-4b7c-9d1e-2f3a4b5c6d72";
  const SERIES = "7f2b4d6a-8c9e-4f1a-8b5c-6d7e8f9a0b16";
  const AT = NOW.toISOString();

  async function built(statement: import("drizzle-orm").SQL) {
    const { PgDialect } = await import("drizzle-orm/pg-core");
    const q = new PgDialect().sqlToQuery(statement);
    return { sql: q.sql.replace(/\s+/g, " ").trim(), params: q.params };
  }

  it("writes the new start on her own waiting answer of one night, and moves the answer's time and count", async () => {
    const { changeProposalStatement } = await import("./answers");
    const { TIME_ZONE } = await import("@/lib/demandes/rules");
    const q = await built(changeProposalStatement(PROFILE, REQUEST, "20:30", AT));
    expect(q.sql).toMatch(
      /^update care_request_applications a set proposed_start_time = nullif\(\$1::time, r\.start_time\), answered_at = \$2::timestamptz, answer_count = a\.answer_count \+ 1, updated_at = \$3::timestamptz from care_requests r, professional_profiles p where a\.request_id = \$4 and a\.profile_id = \$5 and a\.status = 'en_attente'/,
    );
    expect(q.params.slice(0, 5)).toEqual(["20:30", AT, AT, REQUEST, PROFILE]);
    // An open request of one night, ahead at the family's start and at the new one.
    expect(q.sql).toContain("and r.id = a.request_id and r.status = 'ouverte'");
    expect(q.sql).toContain("and not r.series_whole");
    expect(q.sql).toMatch(/\(r\.night_date \+ r\.start_time\) > \(now\(\) at time zone \$\d+\)/);
    expect(q.sql).toMatch(/\(r\.night_date \+ coalesce\(\$\d+::time, r\.start_time\)\) > \(now\(\) at time zone \$\d+\)/);
    expect(q.params.filter((param) => param === TIME_ZONE)).toHaveLength(2);
    // Her profile is validated, and her account is not suspended.
    expect(q.sql).toContain("and p.id = a.profile_id and p.status = 'valide'");
    expect(q.sql).toContain(
      "and not exists (select 1 from users as su where su.id = p.user_id and su.suspended_at is not null)",
    );
    // The same start writes nothing: the family is told of a change only.
    expect(q.sql).toMatch(/and a\.proposed_start_time is distinct from nullif\(\$\d+::time, r\.start_time\) returning a\.id, a\.answer_count, r\.night_date::text as night_date, r\.start_time::text as start_time, r\.extra_hours, a\.proposed_start_time::text as proposed$/);
    // The form's value is bound each time: nothing of it reaches the SQL text.
    expect(q.params.filter((param) => param === "20:30")).toHaveLength(3);
    expect(q.sql).not.toContain("20:30");
    // A booked, declined or withdrawn answer matches nothing.
    for (const other of ["retenue", "non_retenue", "retiree"]) expect(q.sql).not.toContain(`'${other}'`);
  });

  it("removes the proposal with no value", async () => {
    const { changeProposalStatement } = await import("./answers");
    const q = await built(changeProposalStatement(PROFILE, REQUEST, null, AT));
    expect(q.params.filter((param) => param === null)).toHaveLength(3);
    expect(q.sql).toContain("set proposed_start_time = nullif($1::time, r.start_time)");
  });

  it("writes each night of a regular request or no night, and moves each night's time and count", async () => {
    const { changeSeriesProposalsStatement } = await import("./answers");
    const OTHER = "6e1a3c5f-7b8d-4e0f-9a4b-5c6d7e8f9a05";
    const q = await built(changeSeriesProposalsStatement(PROFILE, SERIES, [[REQUEST, "20:30"], [OTHER, "18:30"]], AT));
    // Her waiting answers on the open nights ahead of this request, with the start asked for each.
    expect(q.sql).toMatch(/^with nights as \( select a\.id, r\.night_date, r\.start_time, r\.extra_hours, a\.proposed_start_time as saved, nullif\(\(select h\.start from \(values \(\$1::uuid, \$2::time\), \(\$3::uuid, \$4::time\)\) as h\(request_id, start\) where h\.request_id = r\.id\), r\.start_time\) as wanted/);
    expect(q.params.slice(0, 4)).toEqual([REQUEST, "20:30", OTHER, "18:30"]);
    expect(q.sql).toMatch(/where a\.profile_id = \$5 and a\.status = 'en_attente' and r\.series_id = \$6 and r\.series_whole and r\.status = 'ouverte'/);
    expect(q.params.slice(4, 6)).toEqual([PROFILE, SERIES]);
    expect(q.sql).toContain(
      "and p.status = 'valide' and not exists (select 1 from users as su where su.id = p.user_id and su.suspended_at is not null)",
    );
    // Every night's answer moves, the unchanged nights too: one confirmation books them all.
    expect(q.sql).toMatch(/update care_request_applications a set proposed_start_time = n\.wanted, answered_at = \$\d+::timestamptz, answer_count = a\.answer_count \+ 1, updated_at = \$\d+::timestamptz from nights n where a\.id = n\.id and a\.status = 'en_attente'/);
    expect(q.params.filter((param) => param === AT)).toHaveLength(2);
    // No night changes: nothing is written. One new start that has passed: nothing is written.
    expect(q.sql).toContain("and exists (select 1 from nights c where c.wanted is distinct from c.saved)");
    expect(q.sql).toMatch(/and not exists \( select 1 from nights late where \(late\.night_date \+ coalesce\(late\.wanted, late\.start_time\)\) <= \(now\(\) at time zone \$\d+\) \)/);
    // The statement returns each night with what it wrote, and whether the start changed: the e-mail names those nights.
    expect(q.sql).toMatch(
      /returning a\.id, a\.answer_count, n\.night_date::text as night_date, n\.start_time::text as start_time, n\.extra_hours, n\.wanted::text as proposed, \(n\.wanted is distinct from n\.saved\) as changed$/,
    );
    for (const other of ["retenue", "non_retenue", "retiree"]) expect(q.sql).not.toContain(`'${other}'`);
  });

  it("puts each night back to the family's start when the form proposes none", async () => {
    const { changeSeriesProposalsStatement } = await import("./answers");
    const q = await built(changeSeriesProposalsStatement(PROFILE, SERIES, [], AT));
    expect(q.sql).toContain("nullif(null::time, r.start_time) as wanted");
    expect(q.params.slice(0, 2)).toEqual([PROFILE, SERIES]);
  });
});
