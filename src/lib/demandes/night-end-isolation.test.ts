import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (demande-heures-supplementaires): the night's end is start + 11 hours +
 * the extra hours, computed in one place. `endTime` and `hasNightEnded` in
 * `rules.ts` hold it in TypeScript, `nightEnd` in `night-end.ts` in SQL. No
 * other file adds hours to a start, so a reader cannot forget the extra hours.
 * `reservations/format.ts` names the 11 hours in the récapitulatif's duration
 * and adds nothing.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));
const NIGHT_HOURS_ALLOWED = new Set([
  join("lib", "demandes", "rules.ts"),
  join("lib", "demandes", "night-end.ts"),
  join("lib", "reservations", "format.ts"),
]);
const START_PLUS_ALLOWED = new Set([join("lib", "demandes", "night-end.ts")]);

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("only the request's rules compute the night's end", () => {
  const files = sources(src);

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    const name = relative(src, file);
    const text = readFileSync(file, "utf8");
    if (!NIGHT_HOURS_ALLOWED.has(name)) expect(text).not.toMatch(/\bNIGHT_HOURS\b/);
    if (!START_PLUS_ALLOWED.has(name)) {
      expect(text).not.toMatch(/start_time\s*\+/);
      expect(text).not.toMatch(/startTime\}\s*\+/);
    }
  });
});
