import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (suspension-one-predicate, D-169): what a suspended account is held out
 * of is stated in one place. Every reader calls `notSuspended` or `suspended`
 * from `suspension.ts`; only the column's writer (`admin/accounts.ts`) and its
 * definition (`db/schema.ts`) name it besides. Selecting `suspendedAt` as a
 * value (the founders' pages, the account's own session) stays allowed.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));
const ALLOWED = new Set([
  join("lib", "auth", "suspension.ts"),
  join("lib", "admin", "accounts.ts"),
  join("db", "schema.ts"),
]);

const RULE_WRITTEN_BY_HAND = [
  /suspended_at/i,
  /is(?:Not)?Null\(\s*\w+\.suspendedAt\s*\)/,
  /\.suspendedAt\s*\}\s*is\b/i,
];

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("only the suspension module states what a suspended account is held out of", () => {
  const files = sources(src).filter((file) => !ALLOWED.has(relative(src, file)));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of RULE_WRITTEN_BY_HAND) expect(text).not.toMatch(pattern);
  });
});
