import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (profil-zone-rayon-saisie): one migration adds her radius, the flag of
 * « Toute la Belgique » and the table of her reached communes. The database
 * refuses a radius outside the seven choices. Every existing profile starts at
 * 0 km, so her reach is filled with her communes.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0027_zone-rayon.sql", import.meta.url)),
  "utf8",
);

describe("migration 0027_zone-rayon", () => {
  it("adds the radius at 0 km and the flag off, on every profile", () => {
    expect(sql).toContain(`ADD COLUMN "zone_radius_km" smallint DEFAULT 0 NOT NULL`);
    expect(sql).toContain(`ADD COLUMN "zone_whole_belgium" boolean DEFAULT false NOT NULL`);
  });

  it("holds the radius to 0, 10, 20, 30, 40 or 50, and to 0 for « Toute la Belgique »", () => {
    expect(sql).toMatch(/"professional_profiles_zone_radius" CHECK \(.*IN \(0, 10, 20, 30, 40, 50\)\)/);
    expect(sql).toMatch(/"professional_profiles_zone_whole_belgium" CHECK \(NOT .*"zone_whole_belgium" OR .*"zone_radius_km" = 0\)/);
  });

  it("creates the reach, one row per profile and commune, removed with the profile", () => {
    expect(sql).toContain(`CREATE TABLE "professional_reach"`);
    expect(sql).toContain(`PRIMARY KEY("profile_id","commune_ins")`);
    expect(sql).toMatch(/REFERENCES "public"\."professional_profiles"\("id"\) ON DELETE cascade/);
    expect(sql).toContain(`CREATE INDEX "professional_reach_commune_ins_idx"`);
  });

  it("fills the reach of each existing profile with her communes, after the table exists", () => {
    const table = sql.indexOf(`CREATE TABLE "professional_reach"`);
    const fill = sql.indexOf(`INSERT INTO "professional_reach" ("profile_id", "commune_ins")`);
    expect(fill).toBeGreaterThan(table);
    expect(sql).toMatch(/SELECT "profile_id", "commune_ins" FROM "professional_communes"/);
  });
});
