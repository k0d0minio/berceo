import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { comptes } from "@/content/comptes";

import { Field } from "./field";

/**
 * JAM-583: each password field has a button that shows or hides the typed
 * text. These tests run without a DOM, so they hold what the server render
 * shows: the text hidden on load, a button that does not submit, and a French
 * name that says what a press does. The press itself is a test for the browser.
 */

const t = comptes.fr.motDePasseVisible;

function render(type: string) {
  return renderToStaticMarkup(
    createElement(Field, { name: "motDePasse", label: comptes.fr.champs.motDePasse, type }),
  );
}

describe("the show/hide button of a password field", () => {
  it("hides the password on load", () => {
    const html = render("password");
    expect(html).toContain('type="password"');
    expect(html).not.toContain('type="text"');
  });

  it("is a button that does not submit the form", () => {
    expect(render("password")).toContain('<button type="button"');
  });

  it("has a French name that says its action", () => {
    const html = render("password");
    expect(html).toContain(`aria-label="${t.afficherLibelle}"`);
    expect(html).toContain(`>${t.afficher}</button>`);
    expect(t.afficherLibelle).toBe("Afficher le mot de passe");
    expect(t.masquerLibelle).toBe("Masquer le mot de passe");
  });

  it("keeps the label tied to the input", () => {
    expect(render("password")).toContain('id="champ-motDePasse"');
  });

  it("is not on a field of another type", () => {
    const html = render("email");
    expect(html).toContain('type="email"');
    expect(html).not.toContain("<button");
  });
});
