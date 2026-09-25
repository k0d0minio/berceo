import { describe, expect, it } from "vitest";

import { profileColumns } from "./profiles";

/**
 * Spec (candidature-et-reservation, D-75): a family reads a validated
 * professional's photo, first name, profession, spécialisations, experience,
 * bio and rate, never her surname, e-mail, phone, INAMI number or documents.
 * The list of columns the full profile selects is the whole of what leaves.
 */
function names(columns: Record<string, unknown>): string[] {
  return Object.values(columns)
    .map((column) => (column && typeof column === "object" && "name" in column ? String(column.name) : null))
    .filter((name): name is string => name !== null);
}

describe("the full profile a family reads", () => {
  it("selects her first name and her profile, nothing that reaches her outside Berceo", () => {
    expect(Object.keys(profileColumns).sort()).toEqual(
      ["bio", "experience", "firstName", "id", "nightRateEur", "photoId", "profession", "specialisations"].sort(),
    );
    const columns = names(profileColumns);
    for (const hidden of ["last_name", "email", "phone", "inami_number", "storage_key", "review_reason"]) {
      expect(columns).not.toContain(hidden);
    }
  });
});
