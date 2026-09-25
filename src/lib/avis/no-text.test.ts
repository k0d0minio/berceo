import { getTableConfig } from "drizzle-orm/pg-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RatingForm } from "@/components/avis/rating-form";
import { ratingInvitations, ratings } from "@/db/schema";

/**
 * Spec (avis-etoiles, D-18): stars only, no free text anywhere in the flow.
 * The two tables hold no text column, and the rating form renders four groups
 * of five radios and no text field of any kind.
 */
describe("no free text (D-18)", () => {
  it("the ratings tables have no text column", () => {
    for (const table of [ratings, ratingInvitations]) {
      for (const column of getTableConfig(table).columns) {
        expect(column.getSQLType()).not.toMatch(/text|char|json/i);
      }
    }
  });

  it("the rating form renders no textarea and no input but the twenty star radios", () => {
    const html = renderToStaticMarkup(
      createElement(RatingForm, {
        action: async () => ({}),
        labels: ["Ponctualité", "Communication", "Soin", "Confiance"],
      }),
    );
    expect(html).not.toContain("<textarea");
    expect(html).not.toContain("contenteditable");
    const inputs = (html.match(/<input[^>]*>/g) ?? []).filter((input) => !input.includes('type="hidden"'));
    expect(inputs).toHaveLength(20);
    for (const input of inputs) expect(input).toContain('type="radio"');
    for (const n of [1, 2, 3, 4]) expect(html.match(new RegExp(`name="score_${n}"`, "g"))).toHaveLength(5);
  });
});
