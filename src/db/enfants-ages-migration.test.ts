import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-303): a request holds 1 to 4 children with their own ages, one
 * feeding or more, and extra hours by half hours. The migration moves each
 * existing request to the new columns with the same values: one child, twins
 * and triplets become 1, 2 and 3 children of the stored age, the one feeding
 * becomes a list of one, and whole extra hours keep their value. It adds
 * « diversification alimentaire » and never uses it, since Postgres refuses a
 * new enum value in the transaction that adds it.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0038_enfants-alimentation-demi-heures.sql", import.meta.url)),
  "utf8",
);
const statements = sql.split("--> statement-breakpoint").map((statement) => statement.trim());
const indexOf = (part: string) => statements.findIndex((statement) => statement.includes(part));

describe("migration 0038_enfants-alimentation-demi-heures", () => {
  it("adds the fourth feeding and does not use it", () => {
    expect(sql).toContain(`ALTER TYPE "public"."feeding" ADD VALUE 'diversification_alimentaire'`);
    expect(sql.match(/diversification_alimentaire/g)).toHaveLength(2);
    expect(statements.filter((statement) => /^(ALTER|UPDATE|DROP)/m.test(statement) && statement.includes("diversification_alimentaire"))).toHaveLength(1);
  });

  it("keeps the whole extra hours and opens the half hours", () => {
    expect(sql).toContain(`ALTER TABLE "care_requests" ALTER COLUMN "extra_hours" SET DATA TYPE numeric(3, 1)`);
    expect(sql).toContain(
      `CHECK ("care_requests"."extra_hours" BETWEEN 0 AND 6 AND "care_requests"."extra_hours" * 2 = trunc("care_requests"."extra_hours" * 2))`,
    );
  });

  it("copies the children: 1, 2 or 3 children of the stored age", () => {
    const update = statements[indexOf(`UPDATE "care_requests"`)];
    expect(update).toContain(`jsonb_build_object('value', "care_requests"."baby_age_value", 'unit', "care_requests"."baby_age_unit")`);
    expect(update).toContain(`CASE "care_requests"."children" WHEN 'un_bebe' THEN 1 WHEN 'jumeaux' THEN 2 ELSE 3 END`);
  });

  it("copies the one feeding to a list of one, and an absent feeding to an empty list", () => {
    const update = statements[indexOf(`UPDATE "care_requests"`)];
    expect(update).toContain(
      `CASE WHEN "care_requests"."feeding" IS NULL THEN '{}'::"feeding"[] ELSE ARRAY["care_requests"."feeding"] END`,
    );
  });

  it("copies the values before it drops the old columns, and holds every row to 1 to 4 children after", () => {
    const copy = indexOf(`UPDATE "care_requests"`);
    expect(copy).toBeGreaterThan(indexOf(`ADD COLUMN "child_ages" jsonb`));
    expect(copy).toBeGreaterThan(indexOf(`ADD COLUMN "feedings"`));
    for (const column of ["children", "baby_age_value", "baby_age_unit", "feeding"]) {
      expect(indexOf(`DROP COLUMN "${column}"`)).toBeGreaterThan(copy);
    }
    expect(indexOf(`ALTER COLUMN "child_ages" SET NOT NULL`)).toBeGreaterThan(copy);
    expect(sql).toContain(`jsonb_array_length("care_requests"."child_ages") BETWEEN 1 AND 4`);
  });

  it("deletes no row", () => {
    expect(sql).not.toMatch(/\b(DELETE|TRUNCATE)\b/i);
  });
});
