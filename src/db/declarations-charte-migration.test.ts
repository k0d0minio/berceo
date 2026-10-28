import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Spec (declarations-charte): the declaration enum gains the change of
 * situation and the charter. The migration only adds: the rows accepted under
 * `cdc-2026-08-02` stay as they are, and a professional with that version
 * accepts the new set at her next visit. It writes no row, since Postgres
 * refuses a new enum value in the transaction that adds it.
 */
const sql = readFileSync(
  fileURLToPath(new URL("../../drizzle/0020_declarations_charte.sql", import.meta.url)),
  "utf8",
);

describe("migration 0020_declarations_charte", () => {
  it("adds the change of situation and the charter to the declarations", () => {
    expect(sql).toContain(`ALTER TYPE "public"."declaration" ADD VALUE 'changement_de_situation'`);
    expect(sql).toContain(`ALTER TYPE "public"."declaration" ADD VALUE 'charte'`);
  });

  it("only adds", () => {
    expect(sql).not.toMatch(/\b(UPDATE|DROP|DELETE|RENAME|INSERT)\b/i);
  });
});
