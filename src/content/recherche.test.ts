import { describe, expect, it } from "vitest";

import { recherche } from "./recherche";

/**
 * Spec (recherche-et-fiches-publiques, D-19, D-8, D-7, D-2 to D-4): every
 * word of the search and the public pages lives in the catalogue and follows
 * the guide's rules: no exclamation mark, em dash or ellipsis (the guide's own
 * placeholder « Ex : Ixelles, Waterloo, 1000... » is the one exception), no
 * price, no insurance wording, no blanket « diplômées ». The guide's lines
 * stay verbatim.
 */
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => strings(child, path ? `${path}.${key}` : key));
  }
  return [];
}

const t = recherche.fr;
const all = strings(t);

describe("recherche catalogue", () => {
  it("has words to check", () => {
    expect(all.length).toBeGreaterThan(30);
  });

  it.each(all)("follows the guide's rules: %s", (path, text) => {
    if (path !== "recherche.placeholder") expect(text).not.toMatch(/…|\.\.\./);
    expect(text).not.toMatch(/!|—/);
    expect(text.toLowerCase()).not.toMatch(/assurance|assurée|couverte/);
    expect(text).not.toMatch(/€|\d+ ?%/);
    expect(text.toLowerCase()).not.toContain("diplômée");
  });
});

describe("the guide's lines, verbatim", () => {
  it("keeps the search field, its placeholder and its button (« La recherche »)", () => {
    expect(t.recherche.label).toBe("Votre commune ou code postal");
    expect(t.recherche.placeholder).toBe("Ex : Ixelles, Waterloo, 1000...");
    expect(t.recherche.bouton).toBe("Rechercher");
  });

  it("keeps the professional page's title and meta patterns (SEO, « Fiche professionnelle »)", () => {
    expect(t.meta.ficheTitre).toBe("{prenom}, {profession} disponible pour gardes de nuit | Berceo");
    expect(t.meta.ficheDescription).toBe(
      "{prenom} est {profession}, disponible pour des gardes de nuit à domicile dans la zone {zone}. Profil vérifié par Berceo.",
    );
  });

  it("keeps « Quelques mots sur moi » and « Profil vérifié par Berceo »", () => {
    expect(t.fiche.bio).toBe("Quelques mots sur moi");
    expect(t.carte.verifie).toBe("Profil vérifié par Berceo");
  });

  it("keeps the guide's empty-zone opening and drops its clause on neighbouring zones (D-124)", () => {
    expect(t.aucune.texte.startsWith("Aucune professionnelle n'est disponible dans cette zone pour le moment.")).toBe(true);
    expect(t.aucune.texte).not.toContain("zones voisines");
    expect(t.aucune.texteCommune).not.toContain("zones voisines");
  });

  it("names the search « Trouver une professionnelle » in the navigation (D-25)", () => {
    expect(t.nav).toBe("Trouver une professionnelle");
  });
});
