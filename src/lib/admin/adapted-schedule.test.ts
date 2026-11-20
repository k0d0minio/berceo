import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-350): each back-office surface that shows the start of a booked
 * night shows the record line of an adapted schedule, with the one function
 * of the lists « Réservations » and « Demandes » (`agreedStartLine`). So each
 * read of a night's start for the founders reads the family's own start with
 * it, and no back-office file writes the words of the record line a second
 * time.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const read = (name: string) => readFileSync(join(src, name), "utf8");

/** What the founders see: the back-office components and pages. */
const surfaces = sources(join(src, "components", "admin")).concat(sources(join(src, "app", "(portail)", "admin")));
const backOffice = surfaces.concat(sources(join(src, "lib", "admin")));

describe("each back-office surface that shows a night's start shows the record line", () => {
  it("has files to check", () => {
    expect(surfaces.length).toBeGreaterThan(30);
  });

  it.each(surfaces)("%s", (file) => {
    const text = readFileSync(file, "utf8");
    // A surface that formats a start formats it from a row that holds the record, and shows the line.
    if (/startTime/.test(text)) expect(text).toMatch(/agreedStartLine\(/);
  });

  it("shows it on « Réservations », « Demandes » and « Signalements »", () => {
    for (const name of ["bookings-table.tsx", "requests-table.tsx", "reports-table.tsx"]) {
      const text = read(join("components", "admin", name));
      expect(text).toContain('{agreedStartLine(row) ? <span className="block text-legende">{agreedStartLine(row)}</span> : null}');
    }
  });

  it("shows it on an account's page and in the suspension dialog, from one function", () => {
    const format = read(join("lib", "admin", "format.ts"));
    expect(format).toContain("record: agreedStartLine(garde)");
    const page = read(join("app", "(portail)", "admin", "utilisateurs", "[id]", "page.tsx"));
    expect(page).toContain("view.upcoming.map(upcomingGardeLine)");
    expect(page).toContain("{upcoming[index].record ?");
    const dialog = read(join("components", "admin", "account-actions.tsx"));
    expect(dialog).toContain("{record ? <span");
  });
});

describe("each read of a night's start for the founders reads the family's start with it", () => {
  const lists = read(join("lib", "admin", "lists.ts"));
  const accounts = read(join("lib", "admin", "accounts.ts"));

  it("selects the three columns of a night together", () => {
    const columns = lists.slice(lists.indexOf("export const nightColumns"), lists.indexOf("const bookingColumns"));
    expect(columns).toContain("nightDate: careRequests.nightDate");
    expect(columns).toContain("startTime: careRequests.startTime");
    expect(columns).toContain("requestedStartTime: careRequests.requestedStartTime");
    // « Réservations » and « Signalements » read a booking's columns; the account's gardes read the night's.
    expect(lists).toMatch(/const bookingColumns = \{[^}]*\.\.\.nightColumns/);
    expect(accounts).toContain("...nightColumns");
  });

  it("selects a start nowhere else in the back-office", () => {
    for (const file of sources(join(src, "lib", "admin"))) {
      const selected = readFileSync(file, "utf8").match(/startTime: careRequests\.startTime/g) ?? [];
      // `nightColumns`, and the list « Demandes », which selects the record on the next line.
      expect(selected.length, relative(src, file)).toBe(file.endsWith(join("admin", "lists.ts")) ? 2 : 0);
    }
    expect(lists).toContain("startTime: careRequests.startTime,\n        requestedStartTime: careRequests.requestedStartTime,");
  });

  it("gives each row its record", () => {
    // « Réservations » and « Signalements ».
    expect(lists.match(/requestedStartTime: row\.requestedStartTime/g)).toHaveLength(2);
    // The gardes of an account's page.
    expect(accounts.match(/requestedStartTime: row\.requestedStartTime/g)).toHaveLength(1);
    // « Demandes » spreads the row, the record with it.
    expect(lists).toContain("rows.map(({ familyFirst, familyLast, familySuspendedAt, answers: n, ...row }) => ({\n      ...row,");
  });

  it("only reads the record: the booking alone writes it", () => {
    for (const file of backOffice) {
      expect(readFileSync(file, "utf8"), relative(src, file)).not.toMatch(/requested_start_time\s*=|requestedStartTime:\s*sql/);
    }
  });
});

describe("one wording of the record line", () => {
  it.each(backOffice)("%s", (file) => {
    // The words live in `src/content/reservations.ts`; a back-office file calls the function.
    expect(readFileSync(file, "utf8")).not.toMatch(/début demandé|début convenu|horaireConvenu/);
  });
});
