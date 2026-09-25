import { describe, expect, it } from "vitest";

import {
  complementRequestedEmail,
  escapeHtml,
  profileRefusedEmail,
  profileValidatedEmail,
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
  ["validation", profileValidatedEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/espace/professionnelle` })],
  [
    "complément",
    complementRequestedEmail({ siteUrl: SITE, prenom: "Julie", reason: "Le verso", url: `${SITE}/espace/professionnelle/profil` }),
  ],
  ["refusal", profileRefusedEmail({ siteUrl: SITE, prenom: "Julie", reason: "Le diplôme", url: `${SITE}/espace/professionnelle` })],
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

describe("the founders' decisions (verification-back-office)", () => {
  it("sends the guide's validation e-mail verbatim, with no insurance claim (D-8)", () => {
    const email = profileValidatedEmail({ siteUrl: SITE, prenom: "Julie", url: `${SITE}/espace/professionnelle` });
    expect(email.subject).toBe("Votre profil Berceo est activé");
    expect(email.text).toContain(
      "Votre dossier a été vérifié. Votre profil est maintenant visible et vous pouvez accéder aux demandes de garde dans votre zone. Bienvenue dans le réseau.",
    );
    expect(email.text).toContain(`Voir les demandes disponibles : ${SITE}/espace/professionnelle`);
    expect(email.text.toLowerCase()).not.toMatch(/assur|couvert/);
  });

  it("carries the reason of a complément and of a refusal", () => {
    const reason = "Il manque le verso de votre diplôme";
    const complement = complementRequestedEmail({ siteUrl: SITE, prenom: "Julie", reason, url: `${SITE}/p` });
    expect(complement.text).toContain(
      "Nous avons bien reçu votre dossier. Pour finaliser votre inscription, nous avons besoin d'un complément : Il manque le verso de votre diplôme.",
    );
    expect(complement.text).toContain("Merci de nous transmettre ce document via votre espace personnel.");

    const refusal = profileRefusedEmail({ siteUrl: SITE, prenom: "Julie", reason, url: `${SITE}/e` });
    expect(refusal.text).toContain(
      "Nous avons examiné votre dossier avec attention. Malheureusement, nous ne sommes pas en mesure d'activer votre profil pour la raison suivante : Il manque le verso de votre diplôme.",
    );
  });

  it("closes the reason with one full stop, whatever the founder typed", () => {
    const email = profileRefusedEmail({ siteUrl: SITE, prenom: "Julie", reason: "Diplôme illisible. ", url: `${SITE}/e` });
    expect(email.text).toContain("raison suivante : Diplôme illisible.\n");
  });

  it("leaves no placeholder and no contact address (D-51)", () => {
    for (const email of [
      complementRequestedEmail({ siteUrl: SITE, prenom: "Julie", reason: "Le verso", url: `${SITE}/p` }),
      profileRefusedEmail({ siteUrl: SITE, prenom: "Julie", reason: "Le diplôme", url: `${SITE}/e` }),
    ]) {
      expect(email.text).not.toMatch(/\[|\{|@|contactez/i);
    }
  });

  it("escapes the reason in the HTML", () => {
    const email = profileRefusedEmail({ siteUrl: SITE, prenom: "Julie", reason: "<img src=x>", url: `${SITE}/e` });
    expect(email.html).not.toContain("<img src=x>");
    expect(email.html).toContain("&lt;img src=x&gt;");
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
