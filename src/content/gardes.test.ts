import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { emails } from "./emails";
import { gardes } from "./gardes";

/**
 * Spec (cycle-de-garde-et-annulation, D-19, D-8, D-2, D-24): every new word of
 * the garde's life lives in the catalogue, follows the guide's rules (no
 * exclamation mark, em dash or ellipsis, no insurance wording), names no price
 * but the 3 % (D-2), and, being ours, waits for Surya: each entry carries
 * `@relecture`.
 */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const garde = [
  ...strings(gardes.fr),
  emails.fr.cadre,
  ...strings(emails.fr.annulationParFamille),
  ...strings(emails.fr.annulationParProfessionnelle),
  ...strings(emails.fr.absence),
  ...strings(emails.fr.rappelFamille),
  ...strings(emails.fr.rappelProfessionnelle),
];

describe("the garde's catalogue", () => {
  it("has words to check", () => {
    expect(garde.length).toBeGreaterThan(40);
  });

  it.each(garde)("follows the guide's rules: %s", (text) => {
    expect(text).not.toMatch(/!|—|…|\.\.\./);
    expect(text.toLowerCase()).not.toMatch(/assurance|assuré|couverte/);
  });

  it("names no price but the 3 %", () => {
    for (const text of garde) {
      expect(text).not.toMatch(/€/);
      for (const percent of text.match(/\d+\s?%/g) ?? []) expect(percent).toBe("3 %");
    }
  });

  it("names the four states of D-17", () => {
    expect(Object.values(gardes.fr.etats)).toEqual(["À venir", "En cours", "Terminée", "Annulée"]);
  });

  it("marks every entry of the new surface for Surya's review", () => {
    const source = readFileSync(fileURLToPath(new URL("./gardes.ts", import.meta.url)), "utf8");
    const entries = source.match(/^\s+\w+:\s*("|$)/gm) ?? [];
    const tags = source.match(/@relecture Surya/g) ?? [];
    expect(entries.length).toBeGreaterThan(20);
    expect(tags.length).toBeGreaterThanOrEqual(entries.length);
  });
});
