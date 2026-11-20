import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Spec (JAM-352, with Jamie's change of 2026-11-20): `/consultation-sommeil`
 * shows the calendar in a plain frame that loads only after the visitor's
 * click. No script and no stylesheet of Calendly is loaded. With no
 * JavaScript the button is a link to the calendar. A booking's message from
 * Calendly shows Berceo's confirmation, and nothing of the message is kept.
 * The page of Calendly's redirect is removed (Jamie, 2026-11-20: the embed
 * replaces it).
 *
 * Nothing renders in these tests (plain Node), so the pages are read as text.
 * `src/lib/consultation-sommeil/embed.test.ts` holds the rules of the frame.
 */
const here = fileURLToPath(new URL("./", import.meta.url));
const read = (file: string) => readFileSync(`${here}${file}`, "utf8");
/** The code of a file, without its comments. */
const code = (file: string) => read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const page = code("page.tsx");
const sitemap = readFileSync(`${here}../../sitemap.ts`, "utf8");

const embed = code("calendar-embed.tsx");

/** A script or a stylesheet of a third party, or a way to write one. */
const THIRD_PARTY_CODE = /<script|next\/script|rel="stylesheet"|<embed|<object|dangerouslySetInnerHTML|widget\.js|widget\.css|assets\.calendly|createElement\(["']script/i;
const EMBEDS = new RegExp(`<iframe|calendly\\.com|${THIRD_PARTY_CODE.source}`, "i");

describe("the consultation page", () => {
  it("gives the calendar's address of the environment to the calendar block, and frames only Calendly", () => {
    expect(page).toContain("<CalendarEmbed");
    expect(page).toContain("url={url}");
    expect(page).toContain("embed={canEmbed(url)}");
  });

  it("has no frame and no code of a third party in the server's page", () => {
    expect(page).not.toMatch(EMBEDS);
  });
});

describe("the calendar block", () => {
  /** What the block draws before the click and after it: its two `return (` blocks. */
  const [, beforeClick = "", afterClick = ""] = embed.split(/return \(\n/);

  it("is a client component", () => {
    expect(embed.trimStart().startsWith('"use client"')).toBe(true);
  });

  it("draws no frame before the click, so no request goes to Calendly", () => {
    expect(embed.match(/<iframe/g)).toHaveLength(1);
    expect(beforeClick).not.toContain("<iframe");
    expect(afterClick).toContain("<iframe");
    expect(embed).toContain("useState<string | null>(null)");
    expect(embed).not.toMatch(/preconnect|prefetch|preload|fetch\(/);
  });

  it("is, before the click and with no JavaScript, a plain link to the calendar in the same tab", () => {
    expect(beforeClick).toContain('<a href={url} rel="noreferrer" onClick={open}>');
    expect(embed).not.toMatch(/target=|_blank/);
  });

  it("names Calendly before the click", () => {
    expect(beforeClick).toContain("{labels.service}");
  });

  it("frames the calendar only on the click, and only where the page may frame it", () => {
    expect(embed).toContain("if (!embed) return;");
    expect(embed).toContain("setFrame(embedAddress(url, window.location.host))");
  });

  it("gives the frame a title, lazy loading and a height for a phone and for a desktop", () => {
    expect(afterClick).toContain("title={labels.cadre}");
    expect(afterClick).toContain('loading="lazy"');
    expect(afterClick).toMatch(/className="[^"]*\bh-\[\d+px\][^"]*\bmd:h-\[\d+px\]/);
  });

  it("loads no script and no stylesheet of Calendly", () => {
    expect(embed).not.toMatch(THIRD_PARTY_CODE);
    expect(embed).not.toContain("calendly.com");
  });

  it("listens for the booking's message only while the frame is in the page", () => {
    expect(embed).toContain("if (!frame) return;");
    expect(embed).toContain('window.addEventListener("message", onMessage)');
    expect(embed).toContain('window.removeEventListener("message", onMessage)');
  });

  it("gives the message to the rule and keeps nothing of it", () => {
    expect(embed).toContain("if (isBookingMessage(event.origin, event.data)) setBooked(true);");
    expect(embed.match(/event\.data/g)).toHaveLength(1);
    expect(embed).not.toMatch(/payload|console\.|localStorage|sessionStorage|document\.cookie|sendBeacon|postMessage/);
  });

  it("shows Berceo's confirmation with the two ways on, and keeps the frame", () => {
    expect(afterClick).toContain("{labels.confirme.title}");
    expect(afterClick).toContain("href={homePath}");
    expect(afterClick).toContain("href={spacePath}");
    expect(afterClick.indexOf("labels.confirme.title")).toBeLessThan(afterClick.indexOf("<iframe"));
  });
});

describe("the redirect path that the embed replaced", () => {
  it("has no page: the consultation folder has no `confirmation` route", () => {
    expect(existsSync(`${here}confirmation`)).toBe(false);
  });

  it("is named by no file of the feature and not by the sitemap", () => {
    for (const source of [page, embed, sitemap, read("../../../lib/consultation-sommeil/config.ts")]) {
      expect(source).not.toMatch(/confirmation\/|\/confirmation|CONFIRMATION_PATH|CleanAddress/);
    }
  });
});
