import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (credits-registre): only `src/lib/credits/` and the schema name the
 * table. A page reads a family's credits through the module and never writes
 * one: no page, action, route or other module names `credits` as a table.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("only the credits module names the table", () => {
  const allowed = [join("lib", "credits"), join("db", "schema.ts")];
  const files = sources(src).filter((file) => !allowed.some((path) => relative(src, file).startsWith(path)));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    // The folder's paths, the stubs' and the epic's names say credits and name no table: they are allowed here.
    const text = readFileSync(file, "utf8")
      .replaceAll(/(@|src)\/(lib|content|components)\/credits(\/[\w-]+)*/g, "")
      .replaceAll(/\b(annulations-credits|credits-(registre|au-paiement|table))\b/g, "");
    expect(text).not.toMatch(/\bcredits\b/);
  });
});
