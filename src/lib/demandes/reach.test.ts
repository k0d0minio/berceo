import { beforeAll, describe, expect, it } from "vitest";

import type { Recipient } from "./requests";

/**
 * Spec (zone-rayon-lecture): the urgent e-mail and the daily digest reach a
 * professional through her radius. Her reach is `professional_reach`: her own
 * communes at 0 km, every commune her radius reaches above it. « Toute la
 * Belgique » stores no reach and reaches every commune asked. The statements
 * are built, never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const IXELLES = "21009";
const ETTERBEEK = "21005";

describe("the professionals an e-mail reaches", () => {
  it("reads her reach, never her chosen communes, and only a validated account not suspended", async () => {
    const { reachingQuery } = await import("./requests");
    const { sql, params } = reachingQuery([IXELLES, ETTERBEEK]).toSQL();
    expect(sql).toContain('inner join "professional_reach" on "professional_reach"."profile_id" = "professional_profiles"."id"');
    expect(sql).toMatch(/"professional_reach"\."commune_ins" in \(\$\d+, \$\d+\)/);
    expect(sql).toMatch(/^select .*"professional_reach"\."commune_ins" from/);
    expect(sql).not.toContain("professional_communes");
    expect(params).toEqual(expect.arrayContaining(["valide", IXELLES, ETTERBEEK]));
    expect(sql).toMatch(/not exists \(select 1 from users as su where su\.id = "professional_profiles"\."user_id" and su\.suspended_at is not null\)/);
  });

  it("reads the « Toute la Belgique » profiles by their flag, with the same rules", async () => {
    const { wholeBelgiumQuery } = await import("./requests");
    const { sql, params } = wholeBelgiumQuery().toSQL();
    expect(sql).toMatch(/"professional_profiles"\."zone_whole_belgium" = \$\d+/);
    expect(params).toEqual(expect.arrayContaining(["valide", true]));
    expect(sql).not.toContain("professional_reach");
    expect(sql).toMatch(/not exists \(select 1 from users as su where su\.id = "professional_profiles"\."user_id" and su\.suspended_at is not null\)/);
  });
});

describe("the rows the e-mails group (recipientsOf)", () => {
  const radius: Recipient = { profileId: "p-radius", email: "radius@example.be", firstName: "Lea", communeIns: ETTERBEEK };
  const zero: Recipient = { profileId: "p-zero", email: "zero@example.be", firstName: "Zoe", communeIns: IXELLES };
  const belgium = { profileId: "p-be", email: "be@example.be", firstName: "Ines" };

  it("keeps the reached rows as they are: a radius and 0 km read the same table", async () => {
    const { recipientsOf } = await import("./requests");
    expect(recipientsOf([radius, zero], [], [IXELLES, ETTERBEEK])).toEqual([radius, zero]);
  });

  it("gives a « Toute la Belgique » profile one row per commune asked, and none for a commune not asked", async () => {
    const { recipientsOf } = await import("./requests");
    const rows = recipientsOf([], [belgium], [IXELLES, ETTERBEEK]);
    expect(rows).toEqual([
      { ...belgium, communeIns: IXELLES },
      { ...belgium, communeIns: ETTERBEEK },
    ]);
  });
});
