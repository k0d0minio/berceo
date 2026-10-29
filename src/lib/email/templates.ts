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
  /** A short value set apart in the display size: the sign-in code (comptes-2fa). */
  emphasis?: string;
  /** The one action; a founder's own message (D-138) carries none. */
  cta?: { label: string; href: string };
  note?: string;
};

/** The capsule button and, under it, the link spelled out. */
function button(cta: { label: string; href: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:${SAUGE};border:1px solid ${SAUGE};">
<a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:${BLANC};text-decoration:none;border-radius:999px;">${escapeHtml(cta.label)}</a>
</td></tr></table>
<p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:${TAUPE};">${escapeHtml(t.layout.lienTexte)}<br><a href="${escapeHtml(cta.href)}" style="color:${SAUGE};word-break:break-all;">${escapeHtml(cta.href)}</a></p>`;
}

function layout({ siteUrl, prenom, paragraphs, emphasis, cta, note }: LayoutInput) {
  const logo = `${siteUrl}/emails/logotype-sauge.png`;
  const para = (text: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${TAUPE};">${escapeHtml(text)}</p>`;
  const big = (text: string) =>
    `<p style="margin:8px 0 24px;font-size:32px;line-height:1.2;font-weight:600;letter-spacing:0.2em;color:${SAUGE};">${escapeHtml(text)}</p>`;

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
${emphasis ? big(emphasis) : ""}
${cta ? button(cta) : ""}
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
    ...(emphasis ? [emphasis, ""] : []),
    ...(cta ? [`${cta.label} : ${cta.href}`, ""] : []),
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

/** The six digits a professional or a founder types after her password (comptes-2fa). */
export function signInCodeEmail(input: {
  siteUrl: string;
  prenom: string | null;
  code: string;
}): RenderedEmail {
  const c = t.codeConnexion;
  return {
    subject: c.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [c.corps],
      // "123 456" reads in one glance; the page accepts the space.
      emphasis: `${input.code.slice(0, 3)} ${input.code.slice(3)}`,
      note: `${c.validite} ${c.ignorer}`,
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

/**
 * Regular nights as the e-mails name them (demande-nuits-regulieres): one line
 * with the commune, the hours, every night and the children.
 */
export type SeriesSummary = { commune: string; horaire: string; dates: readonly string[]; enfants: string };

function isSeries(line: RequestSummary | SeriesSummary): line is SeriesSummary {
  return "dates" in line;
}

/** « 02/11/2026, 05/11/2026 et 09/11/2026 ». */
function dateList(dates: readonly string[]): string {
  return dates.length < 2 ? dates.join("") : `${dates.slice(0, -1).join(", ")} ${t.et} ${dates[dates.length - 1]}`;
}

/** A series' line: « Ixelles, 3 nuits de 20h00 à 7h00 : 02/11/2026, 05/11/2026 et 09/11/2026. Un bébé de trois mois. » */
function seriesLine(template: string, series: SeriesSummary): string {
  const { commune, horaire, dates, enfants } = series;
  return fill(template, { commune, n: String(dates.length), horaire, dates: dateList(dates), enfants });
}

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

/**
 * The daily digest of the normal requests published in her communes (D-61). A
 * series is one line with its nights (demande-nuits-regulieres); the count is
 * the requests, one per night.
 */
export function requestDigestEmail(input: {
  siteUrl: string;
  prenom: string;
  url: string;
  requests: readonly (RequestSummary | SeriesSummary)[];
}): RenderedEmail {
  const r = t.resumeDemandes;
  const count = input.requests.reduce((sum, line) => sum + (isSeries(line) ? line.dates.length : 1), 0);
  const n = String(count);
  const one = count === 1;
  return {
    subject: one ? r.objetUne : fill(r.objet, { n }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [
        one ? r.introUne : fill(r.intro, { n }),
        ...input.requests.map((line) =>
          isSeries(line) ? seriesLine(r.ligneSerie, line) : fill(r.ligne, line),
        ),
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
  /**
   * The fee when a Berceo credit paid some of it (credits-au-paiement): the
   * fee, the credit's part, and what Stripe took (null when the credit paid it all).
   */
  credit?: { montant: string; credit: string; reste: string | null };
}): RenderedEmail {
  const r = t.reservationFamille;
  const credit = input.credit;
  const creditLine = credit
    ? credit.reste
      ? fill(r.creditPartiel, { montant: credit.montant, credit: credit.credit, reste: credit.reste })
      : fill(r.creditTotal, { montant: credit.montant })
    : null;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [
        fill(r.corps, { prenom: input.professionnelle, date: input.date, heure: input.heure }),
        ...(creditLine ? [creditLine] : []),
      ],
      cta: { label: r.cta, href: input.url },
      note: t.cadre,
    }),
  };
}

/** A paid fee whose booking could no longer be made: the fee is refunded in full (frais-de-service, D-103). */
export function refundFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  date: string;
  /** « 4,11 € »: what Stripe refunds to her card. Null when a credit paid the whole fee. */
  montant: string | null;
  /** « 2,00 € »: the part a Berceo credit paid, back on her credit (credits-au-paiement). */
  credit?: string;
  url: string;
}): RenderedEmail {
  const r = t.remboursementFamille;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [
        fill(r.corps, { date: input.date }),
        ...(input.montant ? [fill(r.remboursement, { montant: input.montant })] : []),
        ...(input.credit ? [fill(r.credit, { credit: input.credit })] : []),
      ],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/**
 * A renewal of her subscription failed (abonnements-espace-echec-paiement):
 * the grace period's last day, and Stripe's page for the unpaid invoice. When
 * Stripe gave no such page, the button leads to « Votre abonnement ».
 */
export function gracePeriodEmail(input: {
  siteUrl: string;
  prenom: string;
  /** « Parenthèse ». */
  formule: string;
  date: string;
  invoiceUrl: string | null;
  url: string;
}): RenderedEmail {
  const r = t.abonnementImpaye;
  return {
    subject: r.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { formule: input.formule }), fill(r.delai, { date: input.date })],
      cta: input.invoiceUrl ? { label: r.regler, href: input.invoiceUrl } : { label: r.voir, href: input.url },
      note: input.invoiceUrl ? r.carte : undefined,
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
      note: t.cadre,
    }),
  };
}

/** The family cancelled the garde: to the professional (cycle-de-garde-et-annulation, D-105). */
export function gardeCancelledByFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  prenomFamille: string;
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.annulationParFamille;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenomFamille: input.prenomFamille, date: input.date })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/**
 * The professional cancelled the garde: to the family, saying her fee is
 * refunded, or being refunded while Stripe has not done it, when she paid one
 * (D-2), and that she can republish (D-107).
 */
export function gardeCancelledByProfessionalEmail(input: {
  siteUrl: string;
  prenom: string;
  professionnelle: string;
  date: string;
  /** Whether her fee became a credit (annulations-table): false for a garde booked before the fee existed. */
  credited: boolean;
  url: string;
}): RenderedEmail {
  const r = t.annulationParProfessionnelle;
  const credit = input.credited ? [r.credit] : [];
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [
        fill(r.corps, { prenom: input.professionnelle, date: input.date }),
        ...credit,
        r.suite,
      ],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** An absence reported: to the side recorded absent (D-106), with the way to contest it (annulations-table). `auteur` is who reported it. */
export function absenceReportedEmail(input: {
  siteUrl: string;
  prenom: string;
  auteur: string;
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.absence;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom: input.auteur, date: input.date }), r.contestation],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** The reminder of the day before, to the family (D-108), with the platform line (D-111). */
export function reminderFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  professionnelle: string;
  date: string;
  heure: string;
  url: string;
}): RenderedEmail {
  const r = t.rappelFamille;
  return {
    subject: fill(r.objet, { date: input.date }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom: input.professionnelle, date: input.date, heure: input.heure })],
      cta: { label: r.cta, href: input.url },
      note: t.cadre,
    }),
  };
}

/** The reminder of the day before, to the professional (D-108), with the platform line (D-111). */
export function reminderProfessionalEmail(input: {
  siteUrl: string;
  prenom: string;
  prenomFamille: string;
  date: string;
  heure: string;
  url: string;
}): RenderedEmail {
  const r = t.rappelProfessionnelle;
  return {
    subject: fill(r.objet, { date: input.date, prenomFamille: input.prenomFamille }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenomFamille: input.prenomFamille, date: input.date, heure: input.heure })],
      cta: { label: r.cta, href: input.url },
      note: t.cadre,
    }),
  };
}

/** The invitation to rate a terminée garde, to the family (avis-etoiles, D-120): the guide's e-mail, verbatim. */
export function ratingFamilyEmail(input: {
  siteUrl: string;
  prenom: string;
  professionnelle: string;
  url: string;
}): RenderedEmail {
  const r = t.avisFamille;
  return {
    subject: fill(r.objet, { prenom: input.professionnelle }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom: input.professionnelle })],
      cta: { label: r.cta, href: input.url },
      note: t.avisDelai,
    }),
  };
}

/** The invitation to rate a terminée garde, to the professional (avis-etoiles, D-120). */
export function ratingProfessionalEmail(input: {
  siteUrl: string;
  prenom: string;
  prenomFamille: string;
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.avisProfessionnelle;
  return {
    subject: fill(r.objet, { prenomFamille: input.prenomFamille }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenomFamille: input.prenomFamille, date: input.date })],
      cta: { label: r.cta, href: input.url },
      note: t.avisDelai,
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
  /** Regular nights are one e-mail with every night (demande-nuits-regulieres). */
  request: RequestSummary | SeriesSummary;
}): RenderedEmail {
  const r = t.prioritaire;
  const request = input.request;
  return {
    subject: r.objet,
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: isSeries(request)
        ? [seriesLine(r.corpsSerie, request), r.nuitParNuit, r.suite]
        : [fill(r.corps, request), r.suite],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/** A new message in the conversation (messagerie, D-90): who wrote and for which night, never the text. */
export function newMessageEmail(input: {
  siteUrl: string;
  prenom: string;
  auteur: string;
  date: string;
  url: string;
}): RenderedEmail {
  const r = t.nouveauMessage;
  return {
    subject: fill(r.objet, { prenom: input.auteur }),
    ...layout({
      siteUrl: input.siteUrl,
      prenom: input.prenom,
      paragraphs: [fill(r.corps, { prenom: input.auteur, date: input.date })],
      cta: { label: r.cta, href: input.url },
    }),
  };
}

/**
 * « Contacter l'utilisateur » (back-office-admin, D-138): a founder's own
 * subject and message, as she typed them, in Berceo's frame with no button.
 * A single line break inside a paragraph stays one in both versions; an answer
 * goes to her own address (the Reply-To the caller sets).
 */
export function contactEmail(input: {
  siteUrl: string;
  prenom: string;
  subject: string;
  paragraphs: readonly string[];
}): RenderedEmail {
  const rendered = layout({
    siteUrl: input.siteUrl,
    prenom: input.prenom,
    paragraphs: input.paragraphs,
    note: t.contact.repondre,
  });
  return {
    subject: input.subject,
    // escapeHtml has run on each paragraph; its line breaks become <br> in the HTML only.
    html: rendered.html.replace(/(<p [^>]*>)([^<]*)(<\/p>)/g, (_m, open: string, body: string, close: string) =>
      `${open}${body.replace(/\n/g, "<br>")}${close}`,
    ),
    text: rendered.text,
  };
}
