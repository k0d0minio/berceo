import { describe, expect, it } from "vitest";

import { consultationSommeil } from "./consultation-sommeil";
import { words } from "./locale";

/**
 * Spec (JAM-352): the consultation page says how the booking goes (a slot on
 * Calendly, back to Berceo, the e-mail). The confirmation page says that the
 * appointment is made and what comes next, in words that are also true for a
 * visitor who comes straight to it. The two pages name no price and no
 * address. `vitrine.test.ts` holds the punctuation rules and the meta lengths.
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
const confirmation = strings(t.confirmation);

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

  it("say how the booking goes in three steps: Calendly, back to Berceo, the e-mail", () => {
    const steps = t.etapes.items;
    expect(steps).toHaveLength(3);
    expect(steps[0].text).toContain("Calendly");
    expect(steps[1].title).toBe("Revenez sur Berceo");
    expect(steps[2].text).toContain("e-mail de confirmation");
  });
});

describe("the confirmation page's words", () => {
  it("say that the appointment is made once a slot is chosen", () => {
    expect(t.confirmation.intro).toMatch(/^Une fois votre créneau choisi/);
    expect(t.confirmation.intro).toContain("votre rendez-vous pour la consultation sommeil est enregistré");
  });

  it("say what comes next: the calendar's e-mail with the date and the link", () => {
    const [first] = t.confirmation.etapes.items;
    expect(first.text).toContain("Calendly");
    expect(first.text).toContain("e-mail de confirmation");
    expect(first.text).toContain("la date");
    expect(first.text).toContain("le lien");
    expect(t.confirmation.etapes.items.length).toBeLessThanOrEqual(3);
  });

  it("speak to the visitor who has no slot yet", () => {
    expect(t.confirmation.suite.paragraphs.join(" ")).toContain("Si vous n'avez pas encore choisi de créneau");
    expect(t.confirmation.suite.consultation).toBe(t.rendezVous.bouton);
  });

  it("claim nothing that Berceo cannot know of this visitor", () => {
    const claims = /nous avons (?:bien )?(?:reçu|enregistré)|a bien été|est confirmée?\b|vous avez réservé|félicitations/i;
    expect(confirmation.filter((text) => claims.test(text))).toEqual([]);
  });

  it("has a way on to the home and to the visitor's space", () => {
    expect(t.confirmation.suite.accueil).toBe("Retour à l'accueil");
    expect(t.confirmation.suite.espace).toBe("Accéder à mon espace");
  });

  it("has its own title and description", () => {
    expect(t.confirmation.meta.title).not.toBe(t.meta.title);
    expect(t.confirmation.meta.description).not.toBe(t.meta.description);
  });
});
