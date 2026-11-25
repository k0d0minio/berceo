import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import type { ProfileStatus } from "@/db/schema";

import { ProfileStatusBadge } from "./profile-status-badge";

/** JAM-584: on the founders' pages, a refused file shows in red, never in yellow. */

const etats = words(admin).dossier.etats;
const render = (status: ProfileStatus) => renderToStaticMarkup(createElement(ProfileStatusBadge, { status }));

describe("the file status badge (JAM-584)", () => {
  it("shows a refused file in the DA's red", () => {
    const html = render("refuse");
    expect(html).toContain(etats.refuse);
    expect(html).toContain("bg-rouge-confirmation");
    expect(html).not.toContain("beurre");
  });

  it("keeps every other status off the red", () => {
    for (const status of ["brouillon", "en_attente", "complement_demande", "valide"] as const) {
      const html = render(status);
      expect(html).toContain(etats[status]);
      expect(html).not.toContain("rouge");
      expect(html).not.toContain("beurre");
    }
  });
});
