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
