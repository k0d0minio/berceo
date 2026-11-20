import { describe, expect, it } from "vitest";

import { consultationSommeil } from "./consultation-sommeil";
import { legal } from "./legal";
import { words } from "./locale";

/**
 * Spec (JAM-352): the privacy page names Calendly as a recipient of the
 * booking data of the sleep consultation: which data, when, and whose privacy
 * policy applies. It claims nothing that Berceo cannot know (no country of
 * storage, no retention period). `vitrine.test.ts` holds the punctuation.
 */
const t = words(legal).confidentialite.consultationSommeil;
const text = t.paragraphs.join(" ");

describe("the privacy page's words on Calendly", () => {
  it("name Calendly in the title and in each paragraph", () => {
    expect(t.title).toContain("Calendly");
    expect(t.paragraphs.filter((paragraph) => !paragraph.includes("Calendly"))).toEqual([]);
  });

  it("say when: only after the click on the button of the consultation page", () => {
    const { bouton } = words(consultationSommeil).rendezVous;
    expect(text).toContain(`ne s'affiche qu'après votre clic sur « ${bouton} »`);
    expect(text).toContain("Avant ce clic, la page n'envoie rien à Calendly");
  });

  it("say which data go to Calendly, and that Calendly sends the confirmation e-mail", () => {
    expect(text).toContain("Votre nom, votre adresse e-mail et les informations que vous saisissez dans l'agenda");
    expect(text).toContain("reçus par Calendly");
    expect(text).toContain("qui vous envoie l'e-mail de confirmation");
  });

  it("say that Calendly's own privacy policy applies", () => {
    expect(text).toContain("La politique de confidentialité de Calendly s'applique à ces données");
  });

  it("claim no country of storage, no retention period and no address", () => {
    expect(text).not.toMatch(
      /\d|États-Unis|Union européenne|Europe|\bUE\b|hébergé|stocké|conserv|durée|\bjours?\b|\bmois\b|\bans?\b|https?:|www\.|@/i,
    );
  });
});
