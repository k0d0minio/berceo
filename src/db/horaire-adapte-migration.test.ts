import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-306): an answer can carry a start that the professional proposes
 * in place of the family's, and a booked request keeps the start the family
 * asked for as a record. The migration adds two nullable columns and their
 * checks. It changes no existing row, and it drops and rewrites no column, so
 * it is valid on tables that hold rows.
 */
const sql = readFileSync(fileURLToPath(new URL("../../drizzle/0039_horaire-adapte.sql", import.meta.url)), "utf8");
const statements = sql.split("--> statement-breakpoint").map((statement) => statement.trim());

describe("migration 0039_horaire-adapte", () => {
  it("adds the proposed start to an answer and the requested start to a request, both nullable", () => {
    expect(sql).toContain(`ALTER TABLE "care_request_applications" ADD COLUMN "proposed_start_time" time;`);
    expect(sql).toContain(`ALTER TABLE "care_requests" ADD COLUMN "requested_start_time" time;`);
    expect(sql).not.toMatch(/NOT NULL/);
  });

  it("holds both to a half hour from 18:00 to 23:00, and the record to a start that differs", () => {
    for (const column of [`"care_request_applications"."proposed_start_time"`, `"care_requests"."requested_start_time"`]) {
      expect(sql).toContain(`${column} BETWEEN '18:00' AND '23:00'`);
      expect(sql).toContain(`date_part('minute', ${column}) IN (0, 30)`);
      expect(sql).toContain(`${column} IS NULL OR`);
    }
    expect(sql).toContain(`"care_requests"."requested_start_time" <> "care_requests"."start_time"`);
  });

  it("only adds: no row is updated, no column is dropped or retyped", () => {
    expect(statements).toHaveLength(4);
    for (const statement of statements) expect(statement).toMatch(/^ALTER TABLE "care_request(s|_applications)" ADD (COLUMN|CONSTRAINT) /);
    expect(sql).not.toMatch(/\b(UPDATE|DROP|DELETE|SET DATA TYPE)\b/);
  });
});
