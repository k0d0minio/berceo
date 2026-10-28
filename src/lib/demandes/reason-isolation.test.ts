import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (demande-motif-facultatif): a professional reads the family's optional
 * reason on the request's page only, and the founders on their list of
 * requests. No card, digest or e-mail carries it. So only these files name the
 * column:
 * - `lib/demandes/requests.ts`: the family's own request and the professional's request page.
 * - `lib/gardes/gardes.ts`: a republished garde copies it onto its new request.
 * - `lib/admin/lists.ts`: the founders' list of requests.
 * A new reader fails here, so review sees it. The e-mails and the digest read
 * `familyColumns` and `cardColumns`, which `requests.test.ts` holds without it.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));
const ALLOWED = new Set([
  join("lib", "demandes", "requests.ts"),
  join("lib", "gardes", "gardes.ts"),
  join("lib", "admin", "lists.ts"),
]);
const COLUMN = /careRequests\.reason\b|care_requests"?\."?reason\b/;

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("the family's optional reason", () => {
  const files = sources(src);

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("is named only by its readers", () => {
    const readers = files
      .map((file) => relative(src, file))
      .filter((name) => COLUMN.test(readFileSync(join(src, name), "utf8")));
    expect(readers.sort()).toEqual([...ALLOWED].sort());
  });

  it("is read in requests.ts by the family's request and the professional's request page only", () => {
    const text = readFileSync(join(src, "lib", "demandes", "requests.ts"), "utf8");
    const readers = [...text.matchAll(/export async function (\w+)[\s\S]*?\n}\n/g)]
      .filter((match) => /careRequests\.reason\b/.test(match[0]))
      .map((match) => match[1]);
    expect(readers.sort()).toEqual(["ownRequest", "professionalRequest"]);
  });
});
