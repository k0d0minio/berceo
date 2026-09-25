import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (back-office-admin, D-140): one additive migration. A suspension and a
 * deletion are columns on `users` (a deleted row is always suspended), the
 * handled marker is on `bookings` (only on a cancelled garde), and the journal
 * gains five actions; its table and its trigger are not touched, so it still
 * refuses any change (checked against the run's Neon branch at Build,
 * 03_build/output/notes.md).
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0012_back_office_admin.sql", import.meta.url)),
  "utf8",
);

describe("migration 0012_back_office_admin", () => {
  it("adds the suspension and the deletion to an account, a deleted one staying suspended", () => {
    expect(sql).toContain(`ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone`);
    expect(sql).toContain(`ALTER TABLE "users" ADD COLUMN "suspended_by" uuid`);
    expect(sql).toContain(`ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone`);
    expect(sql).toMatch(/"users_deleted_suspended" CHECK \("users"\."deleted_at" IS NULL OR "users"\."suspended_at" IS NOT NULL\)/);
  });

  it("adds the handled marker to a cancelled garde only", () => {
    expect(sql).toContain(`ALTER TABLE "bookings" ADD COLUMN "report_handled_at" timestamp with time zone`);
    expect(sql).toMatch(/"bookings_report_handled" CHECK \("bookings"\."report_handled_at" IS NULL OR "bookings"\."status" = 'annulee'\)/);
  });

  it("adds the five actions and leaves the journal itself alone", () => {
    for (const action of ["compte_suspendu", "compte_reactive", "compte_supprime", "utilisateur_contacte", "signalement_traite"]) {
      expect(sql).toContain(`ALTER TYPE "public"."admin_action" ADD VALUE '${action}'`);
    }
    expect(sql).not.toMatch(/admin_journal/);
    expect(sql).not.toMatch(/DROP /);
  });
});
