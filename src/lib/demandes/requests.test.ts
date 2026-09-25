import { describe, expect, it } from "vitest";

import { cardColumns } from "./requests";

/**
 * Spec (demande-de-garde, D-15): a professional's list shows no family name,
 * address, phone or e-mail, and its query selects none of them. The card is
 * the night, the children and the commune.
 */
describe("the columns a professional reads", () => {
  it("are the night, the children and the commune, nothing about the family", () => {
    const columns = Object.values(cardColumns).map((column) => column.name);
    expect(columns.sort()).toEqual(
      [
        "baby_age_unit",
        "baby_age_value",
        "children",
        "commune_ins",
        "created_at",
        "id",
        "locality",
        "night_date",
        "postcode",
        "start_time",
        "urgent",
      ].sort(),
    );
    expect(columns).not.toContain("family_user_id");
  });
});
