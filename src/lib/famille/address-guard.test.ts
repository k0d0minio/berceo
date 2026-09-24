import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { communeColumns } from "./profile";

/**
 * Spec (D-15): the family's address never reaches a professional or a
 * visitor. It lives in `family_profiles`, and only `src/lib/famille/` may read
 * that table; the schema declares it. Any other file under `src/` that names
 * the table fails here, so a new reader has to be added to this module, where
 * review sees it.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));
const allowed = [`lib${sep}famille${sep}`, `db${sep}schema.ts`];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("the family's address", () => {
  it("is read only inside src/lib/famille/", () => {
    const readers = files(src)
      .map((path) => relative(src, path))
      .filter((path) => !allowed.some((prefix) => path.startsWith(prefix)))
      .filter((path) => /familyProfiles|family_profiles/.test(readFileSync(join(src, path), "utf8")));
    expect(readers).toEqual([]);
  });

  it("is not among the columns the commune-only reader selects", () => {
    expect(Object.keys(communeColumns).sort()).toEqual(["ins", "locality", "postcode"]);
    const columns = Object.values(communeColumns).map((column) => column.name);
    expect(columns).not.toContain("street");
    expect(columns).not.toContain("house_number");
    expect(columns).not.toContain("box");
    expect(columns).not.toContain("context");
  });
});
