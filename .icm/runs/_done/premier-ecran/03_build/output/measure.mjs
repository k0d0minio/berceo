// Measures the spec's layout criteria on a deployed preview.
// usage: node measure.mjs <base-url-with-share-token> [widths...]
import { chromium } from "playwright";
const share = process.argv[2];
const base = share.split("?")[0].replace(/\/$/, "");
const widths = process.argv.slice(3).map(Number);
const W = widths.length ? widths : [320, 390, 768, 820, 1024, 1279, 1280, 1440, 1920];
const pages = ["/", "/comment-ca-marche", "/tarifs", "/faq"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext();
const p0 = await ctx.newPage();
await p0.goto(share, { waitUntil: "networkidle" }); // sets the bypass cookie
for (const path of pages) {
  for (const w of W) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      // Lines of an element: count distinct line tops across its text rects.
      const lines = (el) => {
        const range = document.createRange(); range.selectNodeContents(el);
        const tops = new Set([...range.getClientRects()].map((q) => Math.round(q.top)));
        return tops.size;
      };
      // Max characters on one rendered line of a text element.
      const maxChars = (el) => {
        const node = [...el.childNodes].find((n) => n.nodeType === 3); if (!node) return null;
        const t = node.textContent; const perLine = new Map(); const range = document.createRange();
        for (let i = 0; i < t.length; i++) { range.setStart(node, i); range.setEnd(node, i + 1);
          const q = range.getClientRects()[0]; if (!q) continue; const k = Math.round(q.top);
          perLine.set(k, (perLine.get(k) || 0) + 1); }
        return Math.max(...perLine.values());
      };
      const main = document.querySelector("main") || document.body;
      const h1 = main.querySelector("h1");
      const col = h1.parentElement;
      const intro = col.querySelector("p");
      const img = main.querySelector("img");
      const nav = document.querySelector("header nav");
      const navVisible = nav && getComputedStyle(nav).display !== "none";
      const links = navVisible ? [...nav.querySelectorAll("a")].map((a) => lines(a)) : null;
      const menuBtn = [...document.querySelectorAll("header button")].find((b) => b.offsetParent);
      const hc = h1.getBoundingClientRect(), cc = col.getBoundingClientRect();
      const ib = img ? img.getBoundingClientRect() : null;
      const doors = [...col.querySelectorAll("a")].map((a) => a.getBoundingClientRect()).filter((b) => b.width);
      return {
        h1Lines: lines(h1), h1Px: getComputedStyle(h1).fontSize,
        h1Overflow: h1.scrollWidth > h1.clientWidth + 1 || hc.right > cc.right + 1,
        hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        introMax: intro ? maxChars(intro) : null,
        navLinks: links, menu: !!menuBtn,
        colTop: Math.round(cc.top), colBottom: Math.round(cc.bottom), colW: Math.round(cc.width),
        img: ib ? { top: Math.round(ib.top), bottom: Math.round(ib.bottom), w: Math.round(ib.width), h: Math.round(ib.height) } : null,
        doorsOverflow: doors.some((d) => d.right > cc.right + 1),
        headerOneRow: (() => { const kids = [...document.querySelector("header > div").children].filter((k) => getComputedStyle(k).display !== "none").map((k) => k.getBoundingClientRect()); const mids = kids.map((b) => (b.top + b.bottom) / 2); return Math.max(...mids) - Math.min(...mids) < 4 && kids.every((b) => b.right <= document.documentElement.clientWidth); })(),
        imgRatio: ib ? +(ib.width / ib.height).toFixed(3) : null,
        viewportH: innerHeight,
        doorsBottom: doors.length ? Math.round(Math.max(...doors.map((d) => d.bottom))) : null,
      };
    });
    if (r.menu) { // open the panel and list what it offers
      await page.locator("header button:visible").first().click();
      await page.waitForTimeout(400);
      r.menuItems = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] a')].map((a) => a.textContent.trim()));
    }
    if ([390, 1024, 1280].includes(w)) await page.screenshot({ path: `shot${path.replace(/\//g, "_") || "_"}-${w}.png` });
    console.log(path, w, JSON.stringify(r));
    await page.close();
  }
}
await browser.close();
