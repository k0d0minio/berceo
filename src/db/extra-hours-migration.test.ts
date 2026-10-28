import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (demande-heures-supplementaires): the migration adds the request's
 * extra hours with a default of 0, so every existing request keeps an
 * 11-hour night, and the database holds them to 0 to 6.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0020_demande_heures_supplementaires.sql", import.meta.url)),
  "utf8",
);

describe("migration 0020_demande_heures_supplementaires", () => {
  it("adds the column with default 0 for the existing requests", () => {
    expect(sql).toContain(`ALTER TABLE "care_requests" ADD COLUMN "extra_hours" smallint DEFAULT 0 NOT NULL`);
  });

  it("holds the extra hours to 0 to 6", () => {
    expect(sql).toContain(`CHECK ("care_requests"."extra_hours" BETWEEN 0 AND 6)`);
  });

  it("writes no row", () => {
    expect(sql).not.toMatch(/\bUPDATE\b/i);
  });
});
