import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (onboarding-professionnelle): the migration adds the five tables with
 * their enums and constraints, and the database itself refuses a night rate
 * outside 100 to 300 € (D-4) and a bio over 500 characters. The constraints
 * were also run against the run's own Neon branch at Build: 99 and 301 were
 * refused, 100 and 300 accepted (03_build/output/notes.md).
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0002_onboarding_professionnelle.sql", import.meta.url)),
  "utf8",
);

describe("migration 0002_onboarding_professionnelle", () => {
  it.each([
    "professional_profiles",
    "professional_communes",
    "professional_documents",
    "professional_declarations",
    "app_settings",
  ])("creates %s", (table) => {
    expect(sql).toContain(`CREATE TABLE "${table}"`);
  });

  it("holds the night rate between 100 and 300 in the database", () => {
    expect(sql).toMatch(/CONSTRAINT "professional_profiles_night_rate_range" CHECK \(.*BETWEEN 100 AND 300/);
  });

  it("holds the bio to 500 characters and the INAMI number to eleven digits", () => {
    expect(sql).toMatch(/CONSTRAINT "professional_profiles_bio_length" CHECK \(.*char_length.*<= 500/);
    expect(sql).toContain(`'^[0-9]{11}$'`);
  });

  it("gives one profile per professional", () => {
    expect(sql).toContain(`CONSTRAINT "professional_profiles_user_id_unique" UNIQUE("user_id")`);
  });
});
