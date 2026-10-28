import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (profil-professions-inami): the profession enum names the two student
 * years. The old value is renamed to the third year, so the rows that carried
 * it move in place. A rename, not an added value and an UPDATE: Postgres
 * refuses a new enum value in the transaction that adds it, and the migrator
 * runs every pending migration in one transaction.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0015_profession_annees_etudiantes.sql", import.meta.url)),
  "utf8",
);

describe("migration 0015_profession_annees_etudiantes", () => {
  it("renames the student value to the third year", () => {
    expect(sql).toContain(
      `ALTER TYPE "public"."profession" RENAME VALUE 'etudiante_sage_femme' TO 'etudiante_sage_femme_3e'`,
    );
  });

  it("adds the fourth year", () => {
    expect(sql).toContain(`ALTER TYPE "public"."profession" ADD VALUE 'etudiante_sage_femme_4e'`);
  });

  it("never writes a row with a value it adds", () => {
    expect(sql).not.toMatch(/\bUPDATE\b/i);
  });
});
