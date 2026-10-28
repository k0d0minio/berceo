import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (demande-enfants-alimentation): the children enum gains « Triplés », a
 * new enum names the three feedings, and the request gains a nullable feeding
 * column. The migration only adds: Drizzle cannot drop an enum value, and a
 * request published before keeps its row with no feeding. It writes no row,
 * since Postgres refuses a new enum value in the transaction that adds it.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0016_enfants_alimentation.sql", import.meta.url)),
  "utf8",
);

describe("migration 0016_enfants_alimentation", () => {
  it("adds triplets to the children", () => {
    expect(sql).toContain(`ALTER TYPE "public"."care_request_children" ADD VALUE 'triples'`);
  });

  it("creates the feeding enum with its three answers", () => {
    expect(sql).toContain(
      `CREATE TYPE "public"."feeding" AS ENUM('allaitement_maternel', 'lait_infantile', 'allaitement_mixte')`,
    );
  });

  it("adds the feeding column without a default or NOT NULL, so existing requests keep working", () => {
    expect(sql).toContain(`ALTER TABLE "care_requests" ADD COLUMN "feeding" "feeding";`);
    expect(sql).not.toMatch(/NOT NULL|DEFAULT/i);
  });

  it("only adds", () => {
    expect(sql).not.toMatch(/\b(UPDATE|DROP|DELETE|RENAME)\b/i);
  });
});
