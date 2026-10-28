import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (profil-tarifs): the night rate starts at 130 € with no ceiling, and
 * the extra hour has its own rate. Profiles under 130 € are raised to it
 * before the check is added. Answers, bookings and payments keep the rate they
 * carry, so their floor stays 100 € and only their ceiling goes.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0017_profil_tarifs.sql", import.meta.url)),
  "utf8",
);

describe("migration 0017_profil_tarifs", () => {
  it("drops every 100 to 300 € range", () => {
    for (const name of [
      "professional_profiles_night_rate_range",
      "care_request_applications_night_rate_range",
      "bookings_night_rate_range",
      "payments_amount_range",
    ]) {
      expect(sql).toContain(`DROP CONSTRAINT "${name}"`);
    }
    expect(sql).not.toMatch(/BETWEEN/);
  });

  it("raises a profile under 130 € before it holds the floor", () => {
    const raise = sql.indexOf(`UPDATE "professional_profiles" SET "night_rate_eur" = 130`);
    const floor = sql.indexOf(`CONSTRAINT "professional_profiles_night_rate_min"`);
    expect(raise).toBeGreaterThan(-1);
    expect(floor).toBeGreaterThan(raise);
    expect(sql).toMatch(/"professional_profiles_night_rate_min" CHECK \(.*>= 130\)/);
  });

  it("keeps 100 € as the floor of answers, bookings and payments", () => {
    expect(sql).toMatch(/"care_request_applications_night_rate_min" CHECK \(.*>= 100\)/);
    expect(sql).toMatch(/"bookings_night_rate_min" CHECK \(.*>= 100\)/);
    expect(sql).toMatch(/"payments_amount_min" CHECK \(.*>= 300\)/);
  });

  it("adds the extra hour's rate, nullable, from 1 €", () => {
    for (const table of ["professional_profiles", "care_request_applications", "bookings"]) {
      expect(sql).toContain(`ALTER TABLE "${table}" ADD COLUMN "extra_hour_rate_eur" integer;`);
      expect(sql).toMatch(new RegExp(`"${table}_extra_hour_rate_min" CHECK \\(.*>= 1\\)`));
    }
  });

  it("changes no answer, booking or payment row", () => {
    expect(sql).not.toMatch(/UPDATE "(care_request_applications|bookings|payments)"/);
  });
});
