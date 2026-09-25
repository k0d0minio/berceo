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

const HIDDEN = ["last_name", "email", "phone", "inami_number", "night_rate_eur", "storage_key", "review_reason"];

describe("what leaves the search (D-14, D-126)", () => {
  it("a public teaser selects her id, first name, profession and bio, nothing else", async () => {
    const { teaserColumns } = await import("./professionals");
    expect(Object.keys(teaserColumns).sort()).toEqual(["bio", "firstName", "id", "profession"]);
    for (const hidden of HIDDEN) expect(names(teaserColumns)).not.toContain(hidden);
  });

  it("a signed-in card adds her photo and nothing else", async () => {
    const { cardColumns } = await import("./professionals");
    expect(Object.keys(cardColumns).sort()).toEqual(["bio", "firstName", "id", "photoId", "profession"]);
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
