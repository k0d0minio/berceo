import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProfessionalListCard } from "./professional-list-card";

/**
 * Spec (favoris-liste): each card opens the full profile and the priority
 * request; a professional not `valide` or suspended shows as unavailable,
 * with no priority button; without a subscription the card carries no button.
 */

function render(props: { available: boolean; actions: boolean }) {
  return renderToStaticMarkup(
    createElement(ProfessionalListCard, {
      id: "3f0c9a52-0000-4000-8000-000000000001",
      firstName: "Emma",
      profession: "sage_femme",
      photoId: null,
      note: { note: 4.5, gardes: 3 },
      ...props,
    }),
  );
}

describe("a card of « Mes professionnelles »", () => {
  it("opens the full profile and the priority request", () => {
    const html = render({ available: true, actions: true });
    expect(html).toContain("Profil vérifié par Berceo");
    expect(html).toContain('href="/espace/famille/professionnelles/3f0c9a52-0000-4000-8000-000000000001"');
    expect(html).toContain('href="/espace/famille/professionnelles/3f0c9a52-0000-4000-8000-000000000001/priorite"');
    expect(html).toContain("Lui envoyer ma demande en priorité");
    expect(html).toContain("Voir le profil complet");
  });

  it("reads unavailable with no link and no button", () => {
    const html = render({ available: false, actions: true });
    expect(html).toContain("plus disponible sur Berceo.");
    expect(html).not.toContain("Profil vérifié par Berceo");
    expect(html).not.toContain("href=");
    expect(html).not.toContain("priorité");
  });

  it("carries no button without a subscription", () => {
    const html = render({ available: true, actions: false });
    expect(html).toContain("Emma");
    expect(html).not.toContain("href=");
  });
});
