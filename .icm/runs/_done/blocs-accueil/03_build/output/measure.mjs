// Measures blocs-accueil's layout criteria on a deployed preview, with the site's own fonts.
// usage: node measure.mjs <base-url-with-share-token> [widths...]
// Playwright: the repo's if installed, else the global one; Chromium from PLAYWRIGHT_BROWSERS_PATH.
const pw = await import("playwright").catch(() => import("/opt/node22/lib/node_modules/playwright/index.js")).then((m) => m.default ?? m);
const { chromium } = pw;
const share = process.argv[2];
const base = share.split("?")[0].replace(/\/$/, "");
const widths = process.argv.slice(3).map(Number);
const W = widths.length ? widths : [320, 390, 768, 1024, 1440, 1920];
const pages = ["/", "/comment-ca-marche", "/tarifs", "/faq", "/design-system"];
// Trust the session proxy's CA by its key (PROXY_CA_SPKI: the base64 SHA-256 of its public key), never by ignoring errors.
const spki = process.env.PROXY_CA_SPKI;
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: spki ? [`--ignore-certificate-errors-spki-list=${spki}`] : [],
});
const ctx = await browser.newContext();
const p0 = await ctx.newPage();
await p0.goto(share, { waitUntil: "networkidle" }); // sets the bypass cookie
const out = [];
for (const path of pages) {
  for (const w of W) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const R = (el) => el.getBoundingClientRect();
      // Rendered lines of an element: distinct line tops across its text rects.
      const lines = (el) => {
        const range = document.createRange(); range.selectNodeContents(el);
        return new Set([...range.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top))).size;
      };
      // Most characters on one rendered line, over every text node of the element.
      const maxChars = (el) => {
        const perLine = new Map(); const range = document.createRange();
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walk.nextNode())) {
          const t = node.textContent;
          for (let i = 0; i < t.length; i++) {
            range.setStart(node, i); range.setEnd(node, i + 1);
            const q = range.getClientRects()[0]; if (!q) continue;
            const k = Math.round(q.top); perLine.set(k, (perLine.get(k) || 0) + 1);
          }
        }
        return perLine.size ? Math.max(...perLine.values()) : 0;
      };
      const main = document.querySelector("main") || document.body;
      const res = {
        hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
      // Steps: the paragraphs' tops per list.
      res.steps = [...main.querySelectorAll("ol")].filter((ol) => ol.querySelector(":scope > li > h3"))
        .map((ol) => {
          const tops = [...ol.querySelectorAll(":scope > li > p")].map((p) => R(p).top);
          return { spread: +(Math.max(...tops) - Math.min(...tops)).toFixed(1), n: tops.length };
        });
      // Reason grids: columns, the last card's span, per-row alignment, title-to-text gap, title lines.
      res.reasons = [...main.querySelectorAll("ul")].filter((ul) => ul.querySelector(":scope > li [data-slot=card] h3"))
        .map((ul) => {
          const lis = [...ul.children]; const u = R(ul);
          const cards = lis.map((li) => {
            const h3 = li.querySelector("h3"), p = li.querySelector("p");
            return { left: R(li).left, width: R(li).width, top: R(li).top, h3: R(h3), p: R(p), h3lines: lines(h3) };
          });
          const rows = new Map();
          for (const c of cards) { const k = Math.round(c.top); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(c); }
          const rowSpread = Math.max(...[...rows.values()].map((row) => {
            const t = row.map((c) => c.p.top); return Math.max(...t) - Math.min(...t);
          }));
          const titleWrapAlike = [...rows.values()].every((row) => new Set(row.map((c) => c.h3lines)).size === 1);
          const last = cards[cards.length - 1];
          return {
            n: cards.length, rows: rows.size, perRow: [...rows.values()].map((r) => r.length).join("+"),
            lastFull: Math.abs(last.width - u.width) < 1,
            rowSpread: +rowSpread.toFixed(1),
            maxGap: +Math.max(...cards.map((c) => c.p.top - c.h3.bottom)).toFixed(1),
            h3lines: cards.map((c) => c.h3lines).join(""), titleWrapAlike,
            pChars: Math.max(...cards.map((c, i) => maxChars(lis[i].querySelector("p")))),
          };
        });
      // Every paragraph: the most characters on one line.
      res.pMaxChars = Math.max(0, ...[...main.querySelectorAll("p")].map(maxChars));
      // Centred text: the longest centred block, in lines (leaf text blocks only).
      const centred = [...main.querySelectorAll("h1,h2,h3,p,li,a,span,button")]
        .filter((el) => getComputedStyle(el).textAlign === "center" && el.textContent.trim() && R(el).width > 0)
        .map((el) => ({ tag: el.tagName, lines: lines(el), text: el.textContent.trim().slice(0, 30) }));
      res.centredMax = centred.reduce((m, c) => (c.lines > m.lines ? c : m), { lines: 0 });
      // Gardiennes: text column vs photo.
      const g = [...main.querySelectorAll("h2")].find((h) => /Gardiennes/.test(h.textContent));
      if (g) {
        const box = g.parentElement; const col = box.children[1]; const img = box.querySelector("img");
        res.gardiennes = {
          ratio: +(R(col).height / R(img).height).toFixed(2),
          fontPx: getComputedStyle(col.querySelector("p")).fontSize,
          chars: Math.max(...[...col.querySelectorAll("p")].map(maxChars)),
        };
      }
      // Stripes' block: H2 lines, paragraph chars, alignment.
      const s = main.querySelector("[data-slot=striped-section-block]");
      if (s) {
        const h = s.querySelector("h2,h3"), p = s.querySelector("p");
        res.stripes = {
          h2lines: lines(h), pChars: maxChars(p),
          aligns: [...new Set([...s.querySelectorAll("*")].map((e) => getComputedStyle(e).textAlign))].join("/"),
        };
      }
      return res;
    });
    out.push({ path, w, ...r });
    await page.close();
  }
}
for (const o of out) console.log(JSON.stringify(o));
await browser.close();
