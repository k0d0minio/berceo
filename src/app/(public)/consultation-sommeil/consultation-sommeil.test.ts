import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { consultationSommeil } from "@/content/consultation-sommeil";
import { words } from "@/content/locale";
import { SLEEP_CONSULTATION_CONFIRMATION_PATH } from "@/lib/consultation-sommeil/config";

import { pageMetadata } from "../page-metadata";

/**
 * Spec (JAM-352): the button of `/consultation-sommeil` opens the calendar in
 * the same tab, and the calendar sends the visitor back to the confirmation
 * page. That page reads no parameter of its address, shows no personal data,
 * is `noindex`, is not in the sitemap, and exists only where the consultation
 * page exists. The two pages embed nothing of the calendar: a link only.
 *
 * Nothing renders in these tests (plain Node), so the pages are read as text.
 */
const here = fileURLToPath(new URL("./", import.meta.url));
const read = (file: string) => readFileSync(`${here}${file}`, "utf8");
/** The code of a file, without its comments. */
const code = (file: string) => read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const page = code("page.tsx");
const confirmation = code("confirmation/page.tsx");
const cleanAddress = code("confirmation/clean-address.tsx");
const sitemap = readFileSync(`${here}../../sitemap.ts`, "utf8");

const EMBEDS = /<iframe|<script|next\/script|<embed|<object|dangerouslySetInnerHTML|assets\.calendly|calendly\.com/i;

describe("the consultation page's button", () => {
  it("is a link to the address of the environment", () => {
    expect(page).toContain("<a href={url}");
  });

  it("opens the calendar in the same tab", () => {
    expect(page).not.toMatch(/target=/);
    expect(page).not.toContain("_blank");
  });

  it("embeds nothing of the calendar", () => {
    expect(page).not.toMatch(EMBEDS);
  });
});

describe("the confirmation page", () => {
  it("takes no props, so it reads no parameter of its address", () => {
    expect(confirmation).toContain("export default function ConsultationSommeilConfirmationPage()");
    expect(confirmation).not.toMatch(/searchParams|useSearchParams|params\b|generateMetadata/);
  });

  it("reads no session, no cookie and no header, and logs nothing", () => {
    expect(confirmation).not.toMatch(/currentUser|requireAccess|getAuth|cookies\(|headers\(|console\.|@\/db/);
  });

  it("is not found where the consultation page is not found", () => {
    expect(confirmation).toContain("if (!sleepConsultationEnabled()) notFound();");
    expect(confirmation).toContain('export const dynamic = "force-dynamic"');
  });

  it("links only to fixed addresses of the site", () => {
    const hrefs = [...confirmation.matchAll(/href=(\{[^}]*\}|"[^"]*")/g)].map((match) => match[1]);
    expect(hrefs.sort()).toEqual(['"/"', "{SIGN_IN_PATH}", "{SLEEP_CONSULTATION_PATH}"].sort());
    expect(confirmation).not.toContain("<a ");
  });

  it("embeds nothing of the calendar and does not read its address", () => {
    expect(confirmation).not.toMatch(EMBEDS);
    expect(confirmation).not.toContain("sleepConsultationUrl");
  });

  it("is noindex, and its canonical address is the fixed path", () => {
    expect(confirmation).toContain(
      "pageMetadata(t.meta, SLEEP_CONSULTATION_CONFIRMATION_PATH, { index: false })",
    );
    const metadata = pageMetadata(words(consultationSommeil).confirmation.meta, SLEEP_CONSULTATION_CONFIRMATION_PATH, {
      index: false,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe("/consultation-sommeil/confirmation");
    expect(metadata.openGraph?.url).toBe("/consultation-sommeil/confirmation");
  });

  it("is not in the sitemap", () => {
    expect(sitemap).not.toMatch(/confirmation|SLEEP_CONSULTATION_CONFIRMATION_PATH/i);
  });
});

describe("the address cleaner of the confirmation page", () => {
  it("puts the fixed path in the address bar", () => {
    expect(cleanAddress).toContain('window.history.replaceState(null, "", path)');
    expect(confirmation).toContain("<CleanAddress path={SLEEP_CONSULTATION_CONFIRMATION_PATH} />");
  });

  it("does not read the address, send it or log it", () => {
    expect(cleanAddress).not.toMatch(
      /location\.|searchParams|URLSearchParams|document\.referrer|fetch\(|sendBeacon|console\.|localStorage|sessionStorage/,
    );
  });
});
