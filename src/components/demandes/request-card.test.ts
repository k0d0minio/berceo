import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { reservations } from "@/content/reservations";
import type { RequestCard as Request } from "@/lib/demandes/requests";

import { RequestCard } from "./request-card";

/**
 * JAM-307: on a family's request, a professional read her own rates with
 * nothing to say they were hers. The founders chose to keep them under a
 * label (question 1 of the pull request). The label stands above her rates,
 * and only where the page asks for it: a booked garde shows the rate alone.
 */

const request: Request = {
  id: "r1",
  urgent: false,
  nightDate: "2026-12-10",
  startTime: "20:00",
  extraHours: 0,
  children: "un_bebe",
  babyAgeValue: 3,
  babyAgeUnit: "semaines",
  feeding: null,
  communeIns: "21009",
  postcode: "1050",
  locality: "Ixelles",
  createdAt: new Date("2026-11-19T10:00:00Z"),
};

const label = reservations.fr.professionnelle.votreTarif;

function render(props: { rate?: number | null; extraHourRate?: number | null; rateLabel?: string }) {
  return renderToStaticMarkup(createElement(RequestCard, { request, ...props }));
}

describe("her rates on a family's request", () => {
  it("says above her rates that they are her own", () => {
    const html = render({ rate: 150, extraHourRate: 15, rateLabel: label });
    expect(html).toContain(label);
    expect(html).toContain("150 € pour la garde de nuit");
    expect(html).toContain("15 € par heure supplémentaire");
    expect(html.indexOf(label)).toBeLessThan(html.indexOf("150 €"));
  });

  it("shows no label without a rate", () => {
    expect(render({ rate: null, rateLabel: label })).not.toContain(label);
  });

  it("shows the rate alone where the page asks for no label", () => {
    const html = render({ rate: 150 });
    expect(html).toContain("150 € pour la garde de nuit");
    expect(html).not.toContain(label);
  });
});
