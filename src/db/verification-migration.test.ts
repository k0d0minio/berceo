import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (verification-back-office): the migration adds the founders' decision
 * columns and the admin journal, and the database itself refuses any change
 * to a journal entry. The trigger was also run against the run's own Neon
 * branch at Build: UPDATE, DELETE and TRUNCATE were refused and the row stayed
 * (03_build/output/notes.md).
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0004_verification_back_office.sql", import.meta.url)),
  "utf8",
);

describe("migration 0004_verification_back_office", () => {
  it("adds the reason and the moment of the last decision to a professional's file", () => {
    expect(sql).toContain(`ALTER TABLE "professional_profiles" ADD COLUMN "review_reason" text`);
    expect(sql).toContain(`ALTER TABLE "professional_profiles" ADD COLUMN "reviewed_at" timestamp with time zone`);
  });

  it("creates the journal with its actions and indexes, and no foreign key", () => {
    expect(sql).toMatch(/CREATE TYPE "public"\."admin_action" AS ENUM\('profil_valide', 'complement_demande', 'profil_refuse', 'reglage_etudiantes', 'documents_supprimes'\)/);
    expect(sql).toContain(`CREATE TABLE "admin_journal"`);
    expect(sql).toContain(`"admin_journal_occurred_at_idx"`);
    expect(sql).toContain(`"admin_journal_subject_user_id_idx"`);
    expect(sql).not.toMatch(/admin_journal[^;]*FOREIGN KEY/);
  });

  it("refuses UPDATE and DELETE on the journal with a trigger that raises", () => {
    expect(sql).toMatch(/CREATE FUNCTION "admin_journal_refuse_change"\(\)[\s\S]*RAISE EXCEPTION/);
    expect(sql).toMatch(
      /CREATE TRIGGER "admin_journal_no_update_or_delete" BEFORE UPDATE OR DELETE ON "admin_journal" FOR EACH ROW EXECUTE FUNCTION "admin_journal_refuse_change"\(\)/,
    );
  });

  it("refuses TRUNCATE too", () => {
    expect(sql).toMatch(/BEFORE TRUNCATE ON "admin_journal" FOR EACH STATEMENT/);
  });
});
