import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (annulations-table): one additive migration. A contested absence is a
 * column on `bookings`, allowed on an absence only; a voided credit is a
 * column on `credits`, and a garde holds one live credit at most. Nullable
 * columns only, so the code it replaces reads and writes as before.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0033_annulations-table.sql", import.meta.url)),
  "utf8",
);

describe("migration 0033_annulations-table", () => {
  it("adds the contest to a reported absence only", () => {
    expect(sql).toContain(`ALTER TABLE "bookings" ADD COLUMN "disputed_at" timestamp with time zone;`);
    expect(sql).toContain(`ALTER TABLE "bookings" ADD COLUMN "disputed_by_user_id" uuid;`);
    expect(sql).toMatch(
      /"bookings_dispute_on_absence" CHECK \("bookings"\."disputed_at" IS NULL OR "bookings"\."cancellation_kind" = 'absence'\)/,
    );
  });

  it("adds the voiding to a credit, and one live credit per garde", () => {
    expect(sql).toContain(`ALTER TABLE "credits" ADD COLUMN "voided_at" timestamp with time zone;`);
    expect(sql).toMatch(
      /CREATE UNIQUE INDEX "credits_booking_live_key" ON "credits" USING btree \("booking_id"\) WHERE "credits"\."booking_id" IS NOT NULL AND "credits"\."voided_at" IS NULL/,
    );
  });

  it("drops nothing and adds no column that refuses a null", () => {
    expect(sql).not.toMatch(/DROP /);
    expect(sql).not.toMatch(/NOT NULL;/);
  });
});
