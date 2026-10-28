import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TeaserCard } from "./professional-card";

/**
 * Spec (zone-rayon-lecture, question 1 of the pull request): a card lists her
 * chosen communes, then her radius in one line, so a family sees why she is
 * listed for a commune she did not choose. No line at 0 km.
 */

function render(reach: { zoneRadiusKm: number; zoneWholeBelgium: boolean }) {
  return renderToStaticMarkup(
    createElement(TeaserCard, {
      href: "/professionnelles/emma-3f0c9a52",
      firstName: "Emma",
      profession: "sage_femme",
      zone: ["Etterbeek"],
      reach,
      note: { note: null, gardes: 0 },
    }),
  );
}

describe("the radius on a card", () => {
  it("shows her chosen communes, then her radius", () => {
    const html = render({ zoneRadiusKm: 30, zoneWholeBelgium: false });
    expect(html).toContain("Se déplace à Etterbeek");
    expect(html).toContain("30 km autour de ses communes");
    expect(html.indexOf("Etterbeek")).toBeLessThan(html.indexOf("30 km"));
  });

  it("shows « Toute la Belgique »", () => {
    expect(render({ zoneRadiusKm: 0, zoneWholeBelgium: true })).toContain("Se déplace dans toute la Belgique");
  });

  it("shows no radius line at 0 km", () => {
    const html = render({ zoneRadiusKm: 0, zoneWholeBelgium: false });
    expect(html).not.toContain("autour de ses communes");
    expect(html).not.toContain("toute la Belgique");
  });
});
