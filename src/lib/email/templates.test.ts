import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  resetPasswordEmail,
  verificationEmail,
  welcomeFamilyEmail,
  type RenderedEmail,
} from "./templates";

/**
 * Spec: Berceo's layout (logotype, "Bonjour [Prénom],", "L'équipe Berceo"),
 * the guide's welcome e-mail verbatim, and never an exclamation mark, an em
 * dash, an ellipsis or "assurance Berceo" (D-8, D-19).
 */

const SITE = "https://uat.berceo.be";

const all: [string, RenderedEmail][] = [
  ["verification", verificationEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/v?token=a` })],
  ["reset", resetPasswordEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/r?token=a` })],
  ["welcome", welcomeFamilyEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/espace/famille` })],
];

describe.each(all)("%s e-mail", (_name, email) => {
  it("greets by first name and signs as the team", () => {
    expect(email.text.startsWith("Bonjour Julie,")).toBe(true);
    expect(email.html).toContain("Bonjour Julie,");
    expect(email.text).toContain("L'équipe Berceo");
    expect(email.html).toContain("L&#39;équipe Berceo");
    expect(email.text).not.toContain("Cordialement");
  });

  it("carries the logotype from this site", () => {
    expect(email.html).toContain(`src="${SITE}/emails/logotype-sauge.png"`);
  });

  it("follows the guide's writing rules", () => {
    for (const part of [email.subject, email.text]) {
      expect(part).not.toMatch(/!|—|…|\.\.\./);
      expect(part.toLowerCase()).not.toContain("assurance");
    }
  });
});

describe("welcome e-mail", () => {
  it("uses the guide's subject, body and call to action", () => {
    const email = welcomeFamilyEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/espace/famille` });
    expect(email.subject).toBe("Bienvenue sur Berceo, Julie 🤍");
    expect(email.text).toContain(
      "Votre compte est créé. Vous pouvez désormais accéder aux profils de nos professionnelles et publier votre première demande de garde. Prenez le temps de vous reposer, c'est pour ça qu'on est là.",
    );
    expect(email.text).toContain(`Publier ma première demande : ${SITE}/espace/famille`);
  });
});

describe("without a first name", () => {
  it("greets without one", () => {
    const email = verificationEmail({ siteUrl: SITE, prenom: null, url: `${SITE}/v` });
    expect(email.text.startsWith("Bonjour,")).toBe(true);
  });
});

describe("escaping", () => {
  it("escapes what a user typed", () => {
    expect(escapeHtml(`<b>"Jo" & 'Al'</b>`)).toBe("&lt;b&gt;&quot;Jo&quot; &amp; &#39;Al&#39;&lt;/b&gt;");
    const email = welcomeFamilyEmail({ siteUrl: SITE, prenom: "<script>", url: `${SITE}/e` });
    expect(email.html).not.toContain("<script>");
  });
});
