import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-306): a proposed start belongs to an answer, so only the folder of
 * the answers reads and writes it, with the conversation of that answer and
 * the schema. One statement, in the booking's batch, makes a proposal the
 * start of a night and keeps the start the family asked for
 * (`bookingSetsTheStart`). No other file writes `requested_start_time`: the
 * record of what the family asked for cannot change after the booking. Each
 * read of a proposal is scoped: the family reads the answers to its own
 * requests, the professional reads her own answers.
 */
const src = fileURLToPath(new URL("../../", import.meta.url));

/** The files that name the answer's column. */
const PROPOSAL_ALLOWED = new Set([
  join("db", "schema.ts"),
  join("lib", "reservations", "answers.ts"),
  join("lib", "reservations", "bookings.ts"),
  join("lib", "reservations", "notices.ts"),
  // The rules name the two columns in their comments only.
  join("lib", "reservations", "rules.ts"),
  join("lib", "messagerie", "conversations.ts"),
]);

/** The files that name the request's record column. Only `bookings.ts` writes it. */
const RECORD_ALLOWED = new Set([
  join("db", "schema.ts"),
  join("lib", "demandes", "requests.ts"),
  join("lib", "reservations", "bookings.ts"),
  join("lib", "reservations", "rules.ts"),
  join("lib", "messagerie", "conversations.ts"),
  join("lib", "gardes", "gardes.ts"),
  join("lib", "admin", "lists.ts"),
]);

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const read = (name: string) => readFileSync(join(src, name), "utf8");

describe("only the answers' folder names a proposed start", () => {
  const files = sources(join(src, "lib")).concat(sources(join(src, "db")));

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files)("%s", (file) => {
    const name = relative(src, file);
    const text = readFileSync(file, "utf8");
    if (!PROPOSAL_ALLOWED.has(name)) {
      expect(text).not.toMatch(/proposed_start_time|careRequestApplications\.proposedStartTime/);
    }
    if (!RECORD_ALLOWED.has(name)) {
      expect(text).not.toMatch(/requested_start_time|careRequests\.requestedStartTime/);
    }
  });
});

describe("the writes of the two columns", () => {
  it("writes a proposal only in the two answer INSERTs, from a bound value, never the family's own start", () => {
    const answers = read(join("lib", "reservations", "answers.ts"));
    // The single night, and each night of a regular request.
    expect(answers.match(/nullif\(\$\{proposal\.proposed\}::time, r\.start_time\)/g)).toHaveLength(1);
    expect(answers.match(/nullif\(\$\{seriesProposal\(proposed\)\}, ok\.start_time\)/g)).toHaveLength(1);
    // A re-answer writes the proposal again: an old one never stays on the row.
    expect(answers.match(/proposed_start_time = excluded\.proposed_start_time/g)).toHaveLength(2);
    // The form's value is read by the rule before each write.
    expect(answers.match(/readProposal\(/g)).toHaveLength(2);
  });

  it("writes the request's start and its record in one statement of the booking, nowhere else", () => {
    const bookings = read(join("lib", "reservations", "bookings.ts"));
    expect(bookings.match(/requestedStartTime: sql`/g)).toHaveLength(1);
    expect(bookings.match(/startTime: sql`coalesce\(nullif\(/g)).toHaveLength(1);
    for (const name of RECORD_ALLOWED) {
      if (name === join("lib", "reservations", "bookings.ts") || name === join("db", "schema.ts")) continue;
      // A read: the column is selected or coalesced, never set.
      expect(read(name)).not.toMatch(/requested_start_time\s*=|requestedStartTime:\s*sql/);
    }
  });

  it("books an answer only at the proposal the family confirmed", () => {
    const payments = read(join("lib", "paiements", "payments.ts"));
    // Both checkouts compare what the family confirmed with what the answer holds.
    expect(payments.match(/proposalsSignature\(/g)).toHaveLength(2);
    expect(payments.match(/reason: "horaires"/g)).toHaveLength(2);
    // The booking refuses an answer given again after the fee was opened.
    const bookings = read(join("lib", "reservations", "bookings.ts"));
    expect(bookings).toMatch(/\$\{careRequestApplications\.answeredAt\} <= \$\{payments\.createdAt\}/);
  });
});

describe("the reads of a proposal are scoped", () => {
  const answers = read(join("lib", "reservations", "answers.ts"));

  it("gives a family the proposals on its own requests only", () => {
    // `waitingOnHers` holds the request to the family, the answer to waiting, the profile to validated.
    const scoped = answers.match(/waitingOnHers\(userId\)/g) ?? [];
    expect(scoped.length).toBeGreaterThanOrEqual(4);
    expect(answers).toMatch(/eq\(careRequests\.familyUserId, userId\)/);
  });

  it("gives a professional her own proposals only", () => {
    const start = answers.indexOf("export function savedRatesQuery");
    const query = answers.slice(start, answers.indexOf("/** An answer as the family compares it. */"));
    expect(query).toContain("proposedStartTime: careRequestApplications.proposedStartTime");
    expect(query).toContain("eq(professionalProfiles.userId, userId)");
    expect(query).toContain('eq(careRequestApplications.status, "en_attente")');
  });
});
