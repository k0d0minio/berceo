import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (disponibilites-indicatives, D-12): availability filters nothing and
 * blocks nothing. No care-request module, e-mail or digest reads it: nothing
 * under `src/lib/demandes/` or the digest route imports this module or names
 * its table.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("the care requests never read availability", () => {
  const files = [
    ...sources(join(src, "lib", "demandes")),
    ...sources(join(src, "app", "api", "cron", "demandes-digest")),
  ];

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(files)("%s", (file) => {
    const text = readFileSync(file, "utf8");
    expect(text).not.toMatch(/lib\/disponibilites|professionalAvailability|professional_availability/);
  });
});
