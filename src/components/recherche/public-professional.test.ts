import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PublicProfessional } from "./public-professional";

/**
 * Spec (recherche-et-fiches-publiques, D-14, D-126): the public page shows
 * exactly her first name, profession, « Profil vérifié par Berceo », her
 * communes, her note, her « Formations complémentaires » (onboarding-retour-1)
 * and « Quelques mots sur moi », and the sign-up call to
 * action carrying the way back. A fixture whose surname, phone, e-mail,
 * address, rate and photo are unique strings is handed to the page whole: none
 * of them may reach the HTML. The component takes its fields one by one, so
 * the markup is also everything its payload can carry.
 */

const PRIVATE = {
  lastName: "Vandersmissen-Zzqx",
  email: "emma.zzqx@example.invalid",
  phone: "+32470998877",
  street: "Rue de la Zzqx",
  nightRateEur: 187,
  extraHourRateEur: 4217,
  photoId: "9d7e1c2b-photo-zzqx",
  inamiNumber: "12345678901",
};

const SIGN_UP = "/inscription-famille?retour=%2Fespace%2Ffamille%2Fprofessionnelles%2F3f0c9a52";

function render(bio: string | null, formations: string | null = null, reach: string | null = null) {
  const everything = {
    firstName: "Emma",
    profession: "sage_femme" as const,
    bio,
    formations,
    zone: [
      { name: "Ixelles", href: "/garde-de-nuit/ixelles" },
      { name: "Uccle", href: "/garde-de-nuit/uccle" },
    ],
    reach,
    note: { note: 4.8, gardes: 3 },
    signUpHref: SIGN_UP,
    ...PRIVATE,
  };
  return renderToStaticMarkup(createElement(PublicProfessional, everything));
}

describe("the public professional page (D-14)", () => {
  it("shows her first name, profession, the verified line, her linked communes, her note and her words", () => {
    const html = render("Sage-femme depuis dix ans, je prends les nuits.");
    expect(html).toContain("Emma");
    expect(html).toContain("Sage-femme");
    expect(html).toContain("Profil vérifié par Berceo");
    expect(html).toContain('href="/garde-de-nuit/ixelles"');
    expect(html).toContain('href="/garde-de-nuit/uccle"');
    expect(html).toContain("4,8");
    expect(html).toContain("Quelques mots sur moi");
    expect(html).toContain("Sage-femme depuis dix ans");
  });

  it("links the call to action to family sign-up with the way back to her full profile", () => {
    expect(render(null)).toContain(`href="${SIGN_UP.replace(/&/g, "&amp;")}"`);
  });

  it("leaves « Quelques mots sur moi » out when she wrote nothing", () => {
    expect(render(null)).not.toContain("Quelques mots sur moi");
  });

  it("shows her trainings whole, up to 300 characters, and leaves the heading out when empty", () => {
    const formations = `Consultante en lactation IBCLC, ${"portage ".repeat(40)}`.slice(0, 300);
    const html = render(null, formations);
    expect(html).toContain("Formations complémentaires");
    expect(html).toContain(formations);
    expect(render(null)).not.toContain("Formations complémentaires");
  });

  // Spec (zone-rayon-lecture): her radius in one line under her communes, none at 0 km.
  it("shows her radius under her chosen communes, and no line at 0 km", () => {
    const html = render(null, null, "Se déplace jusqu'à 20 km autour de ses communes");
    expect(html).toContain("20 km autour de ses communes");
    expect(html.indexOf("Uccle")).toBeLessThan(html.indexOf("20 km"));
    expect(render(null, null, "Se déplace dans toute la Belgique")).toContain("Se déplace dans toute la Belgique");
    expect(render(null)).not.toContain("Se déplace");
  });

  it("never renders her surname, e-mail, phone, address, rate, photo or INAMI number", () => {
    const html = render("Bonjour");
    for (const value of Object.values(PRIVATE)) expect(html).not.toContain(String(value));
    expect(html).not.toContain("/api/fichiers/");
    expect(html).not.toContain("<img");
    expect(html).not.toMatch(/€/);
  });
});
