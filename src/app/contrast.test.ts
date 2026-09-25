import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Every text and surface pair the platform declares, held to WCAG 2.1 AA
 * (finition-accueil, spec encres-contraste): 4.5:1 for body text, 3:1 for
 * large text (24 px, or 18.66 px bold) and for what identifies a control (a
 * button's outline, a field's border, the focus ring).
 *
 * The values are read from src/app/globals.css, never copied here, so a token
 * changed there is measured here. A pair names tokens as globals.css names
 * them (`encre-sauge`, `foreground`…); an opacity suffix (`text-x/90`) is
 * composited over its surface in sRGB, as the browser paints it.
 *
 * Disabled controls (`disabled:opacity-50`) are exempt, as WCAG exempts them.
 * The butter hover's edge against its surface is below 3:1 by decision: a
 * hovered button is identified by its text, and the 3:1 rule is held at rest.
 */

const srcDir = fileURLToPath(new URL("../", import.meta.url));
const css = readFileSync(join(srcDir, "app", "globals.css"), "utf8");

/** The custom properties of the first `:root` block (the light, mobile one). */
function rootTokens(source: string): Map<string, string> {
  // Comments first: they quote declarations (`[--ring:var(--blanc)]`).
  const bare = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(bare);
  if (!block) throw new Error("no :root block in globals.css");
  const tokens = new Map<string, string>();
  for (const [, name, value] of block[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }
  return tokens;
}

const tokens = rootTokens(css);

/** A token's colour as a hex, following `var(--x)` chains. */
function hex(name: string): string {
  let value = tokens.get(name);
  for (let hops = 0; value && hops < 10; hops++) {
    const ref = /^var\(--([\w-]+)\)$/.exec(value);
    if (!ref) break;
    value = tokens.get(ref[1]);
  }
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`--${name} does not resolve to a six-digit hex (${value})`);
  }
  return value.toLowerCase();
}

type Rgb = [number, number, number];

function rgb(value: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
}

/** WCAG 2.1 relative luminance. */
function luminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `token` or `token/NN`, painted over `under`. */
function paint(spec: string, under?: Rgb): Rgb {
  const [name, alpha] = spec.split("/");
  const colour = rgb(hex(name));
  if (alpha === undefined) return colour;
  if (!under) throw new Error(`${spec} needs a surface to be composited on`);
  const a = Number(alpha) / 100;
  return colour.map((c, i) => a * c + (1 - a) * under[i]) as Rgb;
}

type Kind = "body" | "large" | "boundary";
const minimum: Record<Kind, number> = { body: 4.5, large: 3, boundary: 3 };

/**
 * [where, foreground, surface, kind, backdrop]. A translucent surface is
 * composited on its backdrop, white unless the pair names one.
 */
type Pair = [string, string, string, Kind, string?];

const pairs: Pair[] = [
  // Body text: the inks on the surfaces text sits on.
  ["body text on white", "foreground", "background", "body"],
  ["taupe ink on white", "encre-taupe", "blanc", "body"],
  ["taupe ink on pearl (steps, request cards, calendar)", "encre-taupe", "perle", "body"],
  ["taupe ink on butter (selection, marks, hovered menu)", "encre-taupe", "beurre", "body"],
  ["sage ink on white (headings, nav, links)", "encre-sauge", "blanc", "body"],
  ["sage ink on pearl", "encre-sauge", "perle", "body"],
  ["sage ink on butter (hovered nav)", "encre-sauge", "beurre", "body"],
  ["white on the sage ink (footer, filled buttons, marked night)", "blanc", "encre-sauge", "body"],
  ["white on the taupe ink (taupe row, taupe card)", "blanc", "encre-taupe", "body"],
  // The light sage band: only its heading sits on it, as large text.
  ["sage band heading", "encre-sauge", "sauge", "large"],

  // The shadcn contract.
  ["card", "card-foreground", "card", "body"],
  ["popover", "popover-foreground", "popover", "body"],
  ["primary", "primary-foreground", "primary", "body"],
  ["secondary", "secondary-foreground", "secondary", "body"],
  ["muted", "muted-foreground", "muted", "body"],
  ["accent", "accent-foreground", "accent", "body"],
  ["error text", "destructive", "card", "body"],
  ["dimmed error text", "destructive/90", "card", "body"],
  ["tooltip", "background", "foreground", "body"],

  // Dimmed text and the pearl veil, composited.
  ["field placeholder", "encre-taupe/90", "blanc", "body"],
  ["translucent block over the sage band", "encre-sauge", "perle/75", "body", "sauge"],

  // The four button rows, at rest and hovered.
  ["blanc row", "encre-sauge", "blanc", "body"],
  ["blanc row hovered", "blanc", "encre-sauge", "body"],
  ["raye row", "encre-taupe", "blanc", "body"],
  ["raye row hovered", "encre-taupe", "beurre", "body"],
  ["sauge row", "blanc", "encre-sauge", "body"],
  ["sauge row hovered", "encre-sauge", "beurre", "body"],
  ["taupe row", "blanc", "encre-taupe", "body"],
  ["taupe row hovered", "encre-taupe", "beurre", "body"],

  // The confirmation dialog's two answers (D-24, D-11).
  ["red answer", "blanc", "rouge-confirmation", "body"],
  ["green answer", "encre-sauge", "vert-confirmation", "body"],

  // What identifies a control, against the surface around it.
  ["blanc row outline on white", "encre-sauge", "blanc", "boundary"],
  ["raye row outline on white", "encre-taupe", "blanc", "boundary"],
  ["sauge row fill on the sage band", "encre-sauge", "sauge", "boundary"],
  ["taupe row fill on white", "encre-taupe", "blanc", "boundary"],
  ["field border on white", "input", "blanc", "boundary"],
  ["focus ring on white", "ring", "blanc", "boundary"],
  ["focus ring on pearl", "ring", "perle", "boundary"],
  ["focus ring on the sage band", "ring", "sauge", "boundary"],
  ["focus ring on butter", "ring", "beurre", "boundary"],
  ["focus ring on the footer (white)", "blanc", "encre-sauge", "boundary"],
  ["selected night outline on butter", "encre-taupe", "beurre", "boundary"],
  ["selected night outline on the sage ink", "beurre", "encre-sauge", "boundary"],
];

describe("contrast: every declared pair reaches WCAG AA", () => {
  it.each(pairs)("%s: %s on %s (%s)", (_where, text, surface, kind, backdrop) => {
    const under = paint(surface, rgb(hex(backdrop ?? "blanc")));
    const value = ratio(paint(text, under), under);
    expect(value, `${text} on ${surface} is ${value.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      minimum[kind],
    );
  });
});

describe("contrast: the tokens", () => {
  it("keeps the DA's five colours as the DA wrote them", () => {
    expect({
      blanc: hex("blanc"),
      sauge: hex("sauge"),
      taupe: hex("taupe"),
      perle: hex("perle"),
      beurre: hex("beurre"),
    }).toEqual({
      blanc: "#ffffff",
      sauge: "#8baf9f",
      taupe: "#bab9ad",
      perle: "#e0ded8",
      beurre: "#fef5b5",
    });
  });

  it("declares the two inks", () => {
    expect(hex("encre-sauge")).toBe("#3c584b");
    expect(hex("encre-taupe")).toBe("#646254");
  });
});

/** Every .ts and .tsx file under src/, this test excepted. */
function sourceFiles(): string[] {
  return readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file))
    .map((file) => join(srcDir, file))
    .filter((file) => file !== fileURLToPath(import.meta.url));
}

describe("contrast: the DA's light colours never paint text", () => {
  // `text-sauge`, `hover:text-taupe`, `placeholder:text-taupe/70`… but not
  // `text-encre-sauge` or a longer token name.
  const lightText = /(^|[^\w-])text-(sauge|taupe)(?![\w-])/;

  it("no file under src/ names text-sauge or text-taupe", () => {
    const offenders = sourceFiles().flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          lightText.test(line) ? [`${relative(srcDir, file)}:${i + 1}`] : [],
        ),
    );
    expect(offenders).toEqual([]);
  });
});
