import { describe, expect, it } from "vitest";

import { consultationSommeil } from "./consultation-sommeil";
import { words } from "./locale";

/**
 * Spec (JAM-352): the consultation page says how the booking goes (a slot on
 * Calendly, shown in the page after a click, then the e-mail), and names
 * Calendly before the click. Berceo confirms a booking only in the block that
 * Calendly's message shows: no other word promises it. The page names no
 * price and no address. `vitrine.test.ts` holds the punctuation rules and the
 * meta lengths.
 */
const t = words(consultationSommeil);

/** Every string below a value. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const all = strings(t);

describe("the sleep consultation's words", () => {
  it("name no price and no amount", () => {
    expect(all.filter((text) => /€|\beuros?\b|\bprix\b|\btarifs?\b|\bgratuit|\bpay|\d/i.test(text))).toEqual([]);
  });

  it("hold no address of the calendar and no e-mail address", () => {
    expect(all.filter((text) => /https?:|www\.|calendly\.com|@/i.test(text))).toEqual([]);
  });

  it("no longer say that the calendar opens in a new tab", () => {
    expect(all.filter((text) => /nouvel onglet/i.test(text))).toEqual([]);
    expect("nouvelOnglet" in t.rendezVous).toBe(false);
  });

  it("say how the booking goes in three steps: the slot on Calendly, the e-mail, the consultation", () => {
    const steps = t.etapes.items;
    expect(steps).toHaveLength(3);
    expect(steps[0].text).toContain("Calendly");
    expect(steps[0].text).toContain("sur cette page");
    expect(steps[1].title).toBe("Recevez votre e-mail");
    expect(steps[1].text).toMatch(/^Une fois votre créneau choisi, Calendly vous envoie un e-mail de confirmation/);
  });

  it("say, before the click, that the calendar is Calendly's and that Calendly gets what the visitor types", () => {
    expect(t.rendezVous.service).toContain("un service de Calendly");
    expect(t.rendezVous.service).toContain("après votre clic");
    expect(t.rendezVous.service).toContain("Calendly reçoit alors les informations que vous y saisissez");
  });

  it("give the calendar's frame a title", () => {
    expect(t.rendezVous.cadre).toContain("Agenda");
    expect(t.rendezVous.cadre).toContain("Calendly");
  });

  it("confirm the booking in the page, with the e-mail and the two ways on", () => {
    expect(t.rendezVous.confirme.title).toBe("Votre rendez-vous est enregistré");
    expect(t.rendezVous.confirme.text).toContain("e-mail de confirmation");
    expect(t.rendezVous.confirme.accueil).toBe("Retour à l'accueil");
    expect(t.rendezVous.confirme.espace).toBe("Accéder à mon espace");
  });

  it("promise no confirmation by Berceo outside the block that a booking's message shows", () => {
    const { confirme, ...before } = t.rendezVous;
    const promise = /Berceo vous confirme|revenez sur|vous ramène/i;
    expect([...strings(before), ...strings(t.etapes), t.intro].filter((text) => promise.test(text))).toEqual([]);
    expect(confirme.title).toBe("Votre rendez-vous est enregistré");
  });

  it("have no words of a confirmation page", () => {
    expect("confirmation" in t).toBe(false);
  });
});
