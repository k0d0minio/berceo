import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (triage/professionnelle-declarations-boucle): the version of her last
 * acceptance is read through a comparison Drizzle qualifies with both table
 * names. A single-table select renders every column inside a `sql` field by
 * its bare name. A correlated subquery written there compared `"profile_id"`
 * with `"id"`, two columns of `professional_declarations`, found no version,
 * and sent every submitted file to the re-acceptance page in a loop. The
 * statement is built, never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const USER = "4c9e1f3d-5a6b-4c8d-0e2f-3a4b5c6d7e83";

type Query = { sql: string; params: unknown[] };

async function query(): Promise<Query> {
  const { renewalQuery } = await import("./declarations");
  return renewalQuery(USER).toSQL();
}

describe("renewalQuery", () => {
  it("compares her declarations' profile_id with the profile's id under both table names", async () => {
    const { sql } = await query();
    expect(sql).toContain('"professional_declarations"."profile_id" = "professional_profiles"."id"');
    // The regression: a bare "id" is a column of professional_declarations, not of the profile.
    expect(sql).not.toMatch(/[^.]"profile_id" = "id"/);
  });

  it("reads her status and the version of her latest acceptance, for her user id", async () => {
    const q = await query();
    expect(q.sql).toMatch(/^select "professional_profiles"\."status", "professional_declarations"\."version" from "professional_profiles"/);
    expect(q.sql).toContain('"professional_profiles"."user_id" = $1');
    expect(q.params[0]).toBe(USER);
    expect(q.sql).toMatch(/order by "professional_declarations"\."accepted_at" desc limit \$2$/);
  });
});
