import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { reservations } from "@/content/reservations";
import type { RequestCard as Request } from "@/lib/demandes/requests";
import { rateLine } from "@/lib/reservations/format";

import { RequestCard } from "./request-card";
import { SeriesCard } from "./series-card";

/**
 * JAM-344: on a professional's list, a regular request shows a priority and
 * her rate in the same way as a request of one night: the same mark and the
 * same price line, from the same components.
 */

const request: Request = {
  id: "r1",
  urgent: false,
  nightDate: "2026-12-10",
  startTime: "20:00",
  extraHours: 0,
  childAges: [{ value: 3, unit: "semaines" }],
  feedings: [],
  communeIns: "21009",
  postcode: "1050",
  locality: "Ixelles",
  createdAt: new Date("2026-11-19T10:00:00Z"),
};

const words = reservations.fr.professionnelle;
const props = { priority: true, rate: 150, extraHourRate: 15, rateLabel: words.tarifRepondu };

const single = renderToStaticMarkup(createElement(RequestCard, { request, ...props }));
const regular = renderToStaticMarkup(createElement(SeriesCard, { nights: [{ request }], ...props }));

/** The whole element that holds `text`: from its opening tag to its closing tag. */
function element(html: string, tag: string, text: string): string {
  const part = html.split(`<${tag}`).find((piece) => piece.includes(text));
  if (part === undefined) throw new Error(`no <${tag}> holds « ${text} »`);
  return `<${tag}${part.slice(0, part.indexOf(`</${tag}>`))}</${tag}>`;
}

describe("a regular request on a professional's list (JAM-344)", () => {
  it("marks a priority with the request card's mark", () => {
    const mark = element(single, "span", words.prioritaire);
    expect(mark).toContain("bg-beurre");
    expect(regular).toContain(mark);
  });

  it("shows her rate with the request card's price line, under its label", () => {
    const line = element(single, "li", rateLine(150));
    expect(line).toContain(words.tarifRepondu);
    expect(line).toContain("15 € par heure supplémentaire");
    expect(regular).toContain(line);
  });

  it("shows no mark and no rate on a family's card", () => {
    const html = renderToStaticMarkup(createElement(SeriesCard, { nights: [{ request }] }));
    expect(html).not.toContain(words.prioritaire);
    expect(html).not.toContain("pour la garde de nuit");
  });
});
