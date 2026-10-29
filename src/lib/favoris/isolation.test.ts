import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (favoris-marquer): a mark is the family's alone. Only
 * `src/lib/favoris/` and the schema name the table. No page of the
 * professional, no page or module of the founders and no public page reads
 * the module, except the account's deletion, which removes the rows.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("only the favoris module names the table", () => {
  const allowed = [join("lib", "favoris"), join("db", "schema.ts")];
  const files = sources(src).filter((file) => !allowed.some((path) => relative(src, file).startsWith(path)));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    // The module's own path names the file, not the table: an import of it is allowed here.
    const text = readFileSync(file, "utf8").replaceAll("@/lib/favoris/favourites", "");
    expect(text).not.toMatch(/\bfavourites\b/);
  });
});

describe("the professional, the founders and the public pages never read a mark", () => {
  const files = [
    ...sources(join(src, "app", "(portail)", "espace", "professionnelle")),
    ...sources(join(src, "app", "(portail)", "admin")),
    ...sources(join(src, "app", "(public)")),
    ...sources(join(src, "components", "admin")),
    ...sources(join(src, "lib", "admin")).filter((file) => !file.endsWith(join("admin", "accounts.ts"))),
  ];

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files)("%s", (file) => {
    expect(readFileSync(file, "utf8")).not.toMatch(/lib\/favoris|components\/favoris/);
  });

  it("lets the deletion remove the rows", () => {
    const accounts = readFileSync(join(src, "lib", "admin", "accounts.ts"), "utf8");
    expect(accounts).toMatch(/deletionForgetsFavourites\(userId, now\)/);
  });
});
