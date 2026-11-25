import { describe, expect, it } from "vitest";

import { abonnements } from "@/content/abonnements";
import { words } from "@/content/locale";

import { formatCents, monthlyLine, planWords, priceCents } from "./format";
import { monthlyCents, PLAN_MONTHS, PLANS } from "./rules";

/*
 * JAM-581: each subscription of more than one month shows its price per month,
 * so the plans compare. The rule: the total divided by the months, rounded to
 * the nearest cent, a half cent up.
 */
describe("the monthly equivalent of a plan", () => {
  it("counts the months that each plan's duration names", () => {
    for (const plan of PLANS) expect(planWords(plan).duree).toBe(`${PLAN_MONTHS[plan]} mois`);
  });

  it("reads a price in cents and writes it back with a no-break space", () => {
    expect(priceCents("159,90 €")).toBe(15990);
    expect(formatCents(1997)).toBe("19,97 €");
    expect(formatCents(1305)).toBe("13,05 €");
  });

  it("divides the total by the months and rounds to the cent, a half cent up", () => {
    expect(monthlyCents("decouverte", 2490)).toBeNull();
    expect(monthlyCents("parenthese", 5990)).toBe(1997);
    expect(monthlyCents("serenite", 9490)).toBe(1582);
    expect(monthlyCents("premium", 15990)).toBe(1333);
  });

  it("gives the line of each plan longer than a month, and none for one month", () => {
    expect(PLANS.map(monthlyLine)).toEqual([
      null,
      "soit 19,97 € par mois",
      "soit 15,82 € par mois",
      "soit 13,33 € par mois",
    ]);
    expect(words(abonnements).parMois).toContain("{prix}");
  });
});
