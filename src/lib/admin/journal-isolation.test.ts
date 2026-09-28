import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (admin-sql-helpers-dedupe, D-151): the journal's column list is written
 * once. Every raw insert into `admin_journal` goes through `journal.ts`
 * (`journalInsertIf`, `journalInsertAfter`); no other source file writes one.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));
const JOURNAL = join("lib", "admin", "journal.ts");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("only the journal module inserts into admin_journal", () => {
  const files = sources(src).filter((file) => relative(src, file) !== JOURNAL);

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    const text = readFileSync(file, "utf8");
    expect(text).not.toMatch(/insert\s+into\s+(admin_journal|\$\{adminJournal\})/i);
  });
});
