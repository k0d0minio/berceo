import { beforeAll, describe, expect, it } from "vitest";

import { profileStatusEnum } from "@/db/schema";

/**
 * Spec (recherche-et-fiches-publiques, D-14, D-75): only a validated profile
 * is ever read by the search, and nothing that reaches a professional outside
 * Berceo leaves it. The queries are built, never run: no database is touched.
 */

beforeAll(() => {
  // The client is created lazily on first touch; building a query needs a URL, never a connection.
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

function names(columns: Record<string, unknown>): string[] {
  return Object.values(columns)
    .map((column) => (column && typeof column === "object" && "name" in column ? String(column.name) : null))
    .filter((name): name is string => name !== null);
}

const HIDDEN = ["last_name", "email", "phone", "inami_number", "night_rate_eur", "extra_hour_rate_eur", "storage_key", "review_reason"];

describe("what leaves the search (D-14, D-126)", () => {
  it("a public teaser selects her id, first name, profession, bio, trainings and radius, nothing else", async () => {
    const { teaserColumns } = await import("./professionals");
    expect(Object.keys(teaserColumns).sort()).toEqual([
      "bio",
      "firstName",
      "formationsComplementaires",
      "id",
      "profession",
      "zoneRadiusKm",
      "zoneWholeBelgium",
    ]);
    for (const hidden of HIDDEN) expect(names(teaserColumns)).not.toContain(hidden);
  });

  it("a signed-in card adds her photo and nothing else", async () => {
    const { cardColumns } = await import("./professionals");
    expect(Object.keys(cardColumns).sort()).toEqual([
      "bio",
      "firstName",
      "formationsComplementaires",
      "id",
      "photoId",
      "profession",
      "zoneRadiusKm",
      "zoneWholeBelgium",
    ]);
    for (const hidden of HIDDEN) expect(names(cardColumns)).not.toContain(hidden);
  });
});

describe("only a validated profile is read (D-75)", () => {
  const others = profileStatusEnum.enumValues.filter((status) => status !== "valide");

  it("covers every other status of the enum", () => {
    expect(others.sort()).toEqual(["brouillon", "complement_demande", "en_attente", "refuse"]);
  });

  it("the search by commune holds the status to valide in its SQL", async () => {
    const { servingQuery } = await import("./professionals");
    const { sql, params } = servingQuery(["21009"]).toSQL();
    expect(sql).toMatch(/"professional_profiles"\."status" = \$\d+/);
    expect(params).toContain("valide");
    for (const status of others) expect(params).not.toContain(status);
    expect(params).toContain("21009");
  });

  // Spec (zone-rayon-lecture): the search and the commune pages list her when her radius
  // reaches the commune. Her reach holds her own communes at 0 km and every commune her radius
  // reaches above it. « Toute la Belgique » reaches every commune.
  it("the search by commune reads « Toute la Belgique » or her reach, never her chosen communes", async () => {
    const { servingQuery } = await import("./professionals");
    const { sql, params } = servingQuery(["21009", "21005"]).toSQL();
    expect(sql).toMatch(
      /\("professional_profiles"\."zone_whole_belgium" = \$\d+ or exists \(select "commune_ins" from "professional_reach" where \("professional_reach"\."profile_id" = "professional_profiles"\."id" and "professional_reach"\."commune_ins" in \(\$\d+, \$\d+\)\)\)\)/,
    );
    expect(params).toEqual(expect.arrayContaining([true, "21009", "21005"]));
    expect(sql).not.toContain("professional_communes");
  });

  it("the search by commune and the public page leave a suspended account out (D-134)", async () => {
    const { servingQuery, shortIdQuery } = await import("./professionals");
    for (const query of [servingQuery(["21009"]), shortIdQuery("3f0c9a52")]) {
      expect(query.toSQL().sql).toMatch(/not exists \(select 1 from users as su where su\.id = "professional_profiles"\."user_id" and su\.suspended_at is not null\)/);
    }
  });

  it("the public page's lookup by short id holds the status to valide and reads two rows at most", async () => {
    const { shortIdQuery } = await import("./professionals");
    const { sql, params } = shortIdQuery("3f0c9a52").toSQL();
    expect(sql).toMatch(/"professional_profiles"\."status" = \$\d+/);
    expect(sql).toMatch(/limit \$\d+/i);
    expect(params).toContain("valide");
    expect(params).toContain("3f0c9a52%");
    for (const status of others) expect(params).not.toContain(status);
  });
});

// Spec (JAM-361): the founders' list of communes counts the validated professionals who serve
// each commune, with the rule of the search. Two queries count every commune.
describe("the counts for each commune (JAM-361)", () => {
  const others = profileStatusEnum.enumValues.filter((status) => status !== "valide");
  const notSuspended =
    /not exists \(select 1 from users as su where su\.id = "professional_profiles"\."user_id" and su\.suspended_at is not null\)/;

  it("counts the validated professionals of « Toute la Belgique » once, and no suspended account", async () => {
    const { everywhereCountQuery } = await import("./professionals");
    const { sql, params } = everywhereCountQuery().toSQL();
    expect(sql).toMatch(/^select count\(\*\) from "professional_profiles"/);
    expect(sql).toMatch(/"professional_profiles"\."status" = \$\d+/);
    expect(sql).toMatch(/"professional_profiles"\."zone_whole_belgium" = \$\d+/);
    expect(sql).toMatch(notSuspended);
    expect(params).toEqual(expect.arrayContaining(["valide", true]));
    for (const status of others) expect(params).not.toContain(status);
  });

  it("counts the others for each commune of their reach, never twice with « Toute la Belgique »", async () => {
    const { reachCountsQuery } = await import("./professionals");
    const { sql, params } = reachCountsQuery().toSQL();
    expect(sql).toMatch(/^select "professional_reach"\."commune_ins", count\(\*\) from "professional_reach"/);
    expect(sql).toMatch(/inner join "professional_profiles" on "professional_profiles"\."id" = "professional_reach"\."profile_id"/);
    expect(sql).toMatch(/"professional_profiles"\."status" = \$\d+/);
    expect(sql).toMatch(notSuspended);
    expect(sql).toMatch(/group by "professional_reach"\."commune_ins"$/);
    expect(params).toEqual(expect.arrayContaining(["valide", false]));
    for (const status of others) expect(params).not.toContain(status);
    expect(sql).not.toContain("professional_communes");
  });

  it("selects a commune code and a count, and no column of a person", async () => {
    const { everywhereCountQuery, reachCountsQuery } = await import("./professionals");
    for (const query of [everywhereCountQuery(), reachCountsQuery()]) {
      const select = query.toSQL().sql.split(" from ")[0];
      for (const hidden of ["first_name", ...HIDDEN]) expect(select).not.toContain(hidden);
      expect(select).not.toContain('"id"');
    }
  });
});
