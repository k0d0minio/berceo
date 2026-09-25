import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  requestDigestEmail,
  resetPasswordEmail,
  urgentRequestEmail,
  verificationEmail,
  welcomeFamilyEmail,
  type RenderedEmail,
  type RequestSummary,
} from "./templates";

/**
 * Spec: Berceo's layout (logotype, "Bonjour [Prénom],", "L'équipe Berceo"),
 * the guide's welcome e-mail verbatim, and never an exclamation mark, an em
 * dash, an ellipsis or "assurance Berceo" (D-8, D-19).
 */

const SITE = "https://uat.berceo.be";

const IXELLES: RequestSummary = {
  commune: "Ixelles",
  nuit: "30/09/2026 de 20h00 à 7h00",
  enfants: "Un bébé de trois mois",
  date: "30/09/2026",
};
const UCCLE: RequestSummary = {
  commune: "Uccle",
  nuit: "02/10/2026 de 21h00 à 8h00",
  enfants: "Jumeaux de six semaines",
  date: "02/10/2026",
};
const LIST = `${SITE}/espace/professionnelle/demandes`;

const all: [string, RenderedEmail][] = [
  ["verification", verificationEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/v?token=a` })],
  ["reset", resetPasswordEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/r?token=a` })],
  ["welcome", welcomeFamilyEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/espace/famille` })],
  ["urgent request", urgentRequestEmail({ siteUrl: SITE, prenom: "Julie", url: LIST, request: IXELLES })],
  ["digest", requestDigestEmail({ siteUrl: SITE, prenom: "Julie", url: LIST, requests: [IXELLES, UCCLE] })],
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

describe("urgent request e-mail", () => {
  const email = urgentRequestEmail({ siteUrl: SITE, prenom: "Julie", url: LIST, request: IXELLES });

  it("says it is urgent, where and when, in its subject", () => {
    expect(email.subject).toBe("Demande urgente à Ixelles pour le 30/09/2026");
  });

  it("names the night and the children, and leads to the list", () => {
    expect(email.text).toContain("pour la nuit du 30/09/2026 de 20h00 à 7h00. Un bébé de trois mois.");
    expect(email.text).toContain(`Voir les demandes disponibles : ${LIST}`);
  });

  it("carries no price (D-3, D-4)", () => {
    expect(email.text).not.toContain("€");
  });
});

describe("digest e-mail", () => {
  it("lists every request once, with a subject that counts them", () => {
    const email = requestDigestEmail({ siteUrl: SITE, prenom: "Julie", url: LIST, requests: [IXELLES, UCCLE] });
    expect(email.subject).toBe("2 nouvelles demandes de garde dans votre zone");
    expect(email.text).toContain("Ixelles, nuit du 30/09/2026 de 20h00 à 7h00. Un bébé de trois mois.");
    expect(email.text).toContain("Uccle, nuit du 02/10/2026 de 21h00 à 8h00. Jumeaux de six semaines.");
    expect(email.text).toContain(`Voir les demandes disponibles : ${LIST}`);
  });

  it("speaks of one request when there is one", () => {
    const email = requestDigestEmail({ siteUrl: SITE, prenom: "Julie", url: LIST, requests: [IXELLES] });
    expect(email.subject).toBe("Une nouvelle demande de garde dans votre zone");
    expect(email.text).toContain("Une nouvelle demande a été publiée");
  });
});
