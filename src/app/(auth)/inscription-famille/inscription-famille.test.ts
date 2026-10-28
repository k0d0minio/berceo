import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { common } from "@/content/common";
import { FAMILY_SIGN_UP_PATH } from "@/lib/auth/routing";

/**
 * Spec (abonnements-inscription-famille): the sign-up button at the bottom of
 * the parents' « Comment ça marche » page and the one on `/tarifs` open the
 * family sign-up, where the four plans are picked.
 */
const app = fileURLToPath(new URL("../../", import.meta.url));
const SIGN_UP_BUTTONS = [
  ["the parents' « Comment ça marche » page", "(public)/comment-ca-marche/side-page.tsx"],
  ["/tarifs", "(public)/tarifs/page.tsx"],
] as const;

describe("the family sign-up's buttons", () => {
  it("name the family sign-up's address in the catalogue", () => {
    expect(common.fr.pages.inscriptionFamille.href).toBe(FAMILY_SIGN_UP_PATH);
  });

  it.each(SIGN_UP_BUTTONS)("%s links to it", (_page, file) => {
    expect(readFileSync(`${app}${file}`, "utf8")).toContain("c.pages.inscriptionFamille.href");
  });
});
