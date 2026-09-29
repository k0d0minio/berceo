import { getTableConfig, PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { careRequests } from "@/db/schema";

/**
 * Spec (reservations-deux-gardes-meme-nuit, D-156): a family holds at most one
 * open or booked request per night. The unique index is read from the schema,
 * so narrowing it back to `ouverte` alone fails here; a cancelled request
 * never counts, so it frees the night.
 */
describe("one open or booked request per family and night (D-156)", () => {
  const index = getTableConfig(careRequests).indexes.find(
    (candidate) => candidate.config.name === "care_requests_one_open_per_night",
  );

  it("is a unique index on the family and the night", () => {
    expect(index).toBeDefined();
    expect(index!.config.unique).toBe(true);
    const columns = index!.config.columns.map((column) => ("name" in column ? column.name : ""));
    expect(columns).toEqual(["family_user_id", "night_date"]);
  });

  it("covers the open and the booked statuses, never the cancelled one", () => {
    const where = new PgDialect().sqlToQuery(index!.config.where!).sql;
    expect(where).toContain("'ouverte'");
    expect(where).toContain("'attribuee'");
    expect(where).not.toContain("'annulee'");
  });
});
