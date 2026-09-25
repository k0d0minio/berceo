import { emails } from "@/content/emails";
import { fill, words } from "@/content/locale";

/**
 * Berceo's transactional e-mails as HTML and plain text. One layout for all:
 * the sage logotype, "Bonjour [Prénom],", two to four sentences, one capsule
 * button, the link spelled out under it, "L'équipe Berceo". Inline styles and
 * a table layout, because e-mail clients ignore stylesheets; the DA's colours
 * and no shadow. Pure, so the tests can read every word that leaves.
 */

export type RenderedEmail = { subject: string; html: string; text: string };

const t = words(emails);

// The DA's palette (src/app/globals.css), repeated here because e-mail
// clients cannot read CSS variables.
const SAUGE = "#8BAF9F";
const TAUPE = "#bab9ad";
const PERLE = "#e0ded8";
const BLANC = "#FFFFFF";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function greeting(prenom: string | null): string {
  return prenom ? fill(t.layout.salutation, { prenom }) : t.layout.salutationSansPrenom;
}

type LayoutInput = {
  siteUrl: string;
  prenom: string | null;
  paragraphs: readonly string[];
  cta: { label: string; href: string };
  note?: string;
};

function layout({ siteUrl, prenom, paragraphs, cta, note }: LayoutInput) {
  const logo = `${siteUrl}/emails/logotype-sauge.png`;
  const para = (text: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${TAUPE};">${escapeHtml(text)}</p>`;

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PERLE};font-family:Nunito,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PERLE};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BLANC};border-radius:32px;padding:40px 32px;">
<tr><td style="padding-bottom:32px;"><img src="${escapeHtml(logo)}" width="200" height="49" alt="Berceo" style="display:block;border:0;"></td></tr>
<tr><td>
${para(greeting(prenom))}
${paragraphs.map(para).join("\n")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:${SAUGE};border:1px solid ${SAUGE};">
<a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:${BLANC};text-decoration:none;border-radius:999px;">${escapeHtml(cta.label)}</a>
</td></tr></table>
<p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:${TAUPE};">${escapeHtml(t.layout.lienTexte)}<br><a href="${escapeHtml(cta.href)}" style="color:${SAUGE};word-break:break-all;">${escapeHtml(cta.href)}</a></p>
${note ? para(note) : ""}
${para(t.layout.signature)}
</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:14px;line-height:1.5;color:${TAUPE};">${escapeHtml(t.layout.pied)}</p>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    greeting(prenom),
    "",
    ...paragraphs.flatMap((p) => [p, ""]),
    `${cta.label} : ${cta.href}`,
    "",
    ...(note ? [note, ""] : []),
    t.layout.signature,
    "",
    t.layout.pied,
  ].join("\n");

  return { html, text };
}

export function verificationEmail(input: {
  siteUrl: string;
  prenom: string | null;
  url: string;
}): RenderedEmail {
  const v = t.verification;
  return {
    subject: v.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [v.corps],
      cta: { label: v.cta, href: input.url },
      note: v.ignorer,
    }),
  };
}

export function resetPasswordEmail(input: {
  siteUrl: string;
  prenom: string | null;
  url: string;
}): RenderedEmail {
  const r = t.reinitialisation;
  return {
    subject: r.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [r.corps],
      cta: { label: r.cta, href: input.url },
      note: r.ignorer,
    }),
  };
}

export function welcomeFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
}): RenderedEmail {
  const b = t.bienvenueFamille;
  return {
    subject: fill(b.objet, { prenom: input.prenom }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [b.corps],
      cta: { label: b.cta, href: input.url },
    }),
  };
}

/** A founder's reason inside a sentence that closes with its own full stop. */
function motif(reason: string): string {
  return reason.trim().replace(/[\s.]+$/, "");
}

/** The guide's validation e-mail, verbatim (verification-back-office; D-8, no insurance). */
export function profileValidatedEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
}): RenderedEmail {
  const v = t.profilValide;
  return {
    subject: v.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [v.corps],
      cta: { label: v.cta, href: input.url },
    }),
  };
}

/** The complément asked, with the founders' reason and no contact address (D-51). */
export function complementRequestedEmail(input: {
  siteUrl: string;
  prenom: string;
  reason: string;
  url: string;
}): RenderedEmail {
  const c = t.complementDemande;
  return {
    subject: c.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(c.corps, { motif: motif(input.reason) }), c.suite],
      cta: { label: c.cta, href: input.url },
    }),
  };
}

/** The refusal, with the founders' reason and no contact sentence (D-51). */
export function profileRefusedEmail(input: {
  siteUrl: string;
  prenom: string;
  reason: string;
  url: string;
}): RenderedEmail {
  const r = t.profilRefuse;
  return {
    subject: r.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { motif: motif(input.reason) })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** One request as the e-mails name it: its commune, its night, its children. */
export type RequestSummary = { commune: string; nuit: string; enfants: string; date: string };

/** A new urgent request in her communes, sent at once (D-61). */
export function urgentRequestEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
  request: RequestSummary;
}): RenderedEmail {
  const u = t.demandeUrgente;
  const { commune, nuit, enfants, date } = input.request;
  return {
    subject: fill(u.objet, { commune, date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(u.corps, { commune, nuit, enfants }), u.appel],
      cta: { label: u.cta, href: input.url },
    }),
  };
}

/** The daily digest of the normal requests published in her communes (D-61). */
export function requestDigestEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
  requests: readonly RequestSummary[];
}): RenderedEmail {
  const r = t.resumeDemandes;
  const n = String(input.requests.length);
  const one = input.requests.length === 1;
  return {
    subject: one ? r.objetUne : fill(r.objet, { n }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [
        one ? r.introUne : fill(r.intro, { n }),
        ...input.requests.map(({ commune, nuit, enfants }) => fill(r.ligne, { commune, nuit, enfants })),
      ],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** A new answer to her request (the guide's « Nouvelle candidature (famille) »). */
export function newAnswerEmail(input: {
  siteUrl: string;
  prenom: string;
  professionnelle: { prenom: string; profession: string };
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.nouvelleReponse;
  const { prenom, profession } = input.professionnelle;
  return {
    subject: fill(r.objet, { prenom }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom, profession, date: input.date })],
      cta: { label: fill(r.cta, { prenom }), href: input.url },
    }),
  };
}

/** Her booking is confirmed (the guide, without its insurance sentence, D-8). */
export function bookingFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  professionnelle: string;
  date: string;
  heure: string;
  url: string;
}): RenderedEmail {
  const r = t.reservationFamille;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom: input.professionnelle, date: input.date, heure: input.heure })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** A paid fee whose booking could no longer be made: the fee is refunded in full (frais-de-service, D-91). */
export function refundFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  date: string;
  /** « 4,11 € ». */
  montant: string;
  url: string;
}): RenderedEmail {
  const r = t.remboursementFamille;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { date: input.date }), fill(r.remboursement, { montant: input.montant })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** Her garde is confirmed; the family's address waits on her booking page (D-72). */
export function bookingProfessionalEmail(input: {
  siteUrl: string;
  prenom: string;
  prenomFamille: string;
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.reservationProfessionnelle;
  return {
    subject: fill(r.objet, { date: input.date, prenomFamille: input.prenomFamille }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { date: input.date })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** Her answer was declined: another professional chosen, the request republished or cancelled. */
export function notRetainedEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
  request: RequestSummary;
}): RenderedEmail {
  const r = t.nonRetenue;
  const { commune, nuit, date } = input.request;
  return {
    subject: fill(r.objet, { date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { commune, nuit }), r.suite],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** A request sent to her in priority (D-71). No family name. */
export function priorityRequestEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
  request: RequestSummary;
}): RenderedEmail {
  const r = t.prioritaire;
  const { commune, nuit, enfants } = input.request;
  return {
    subject: r.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { commune, nuit, enfants }), r.suite],
      cta: { label: r.cta, href: input.url },
    }),
  };
}
