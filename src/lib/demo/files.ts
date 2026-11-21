/**
 * The files of the demo professionals (JAM-462): their photos and their
 * documents, made here from their storage key, so the demo puts no object in
 * a bucket and no picture of a real person in git. A demo key is
 * `demo/photo/<n>.svg` or `demo/document/<name>.pdf`; the seed writes them and
 * `/api/fichiers/[id]` serves them in the local demo only.
 *
 * The portraits are drawn shapes, not people. Their tones are the charter's
 * (globals.css), copied here because a served SVG cannot read the site's CSS.
 */

export const DEMO_KEY_PREFIX = "demo/";

/** The charter's tones the portraits use: sage, taupe, pearl, butter yellow. */
const BACKGROUNDS = ["#e0ded8", "#fef5b5", "#b6d3c6", "#ffffff", "#e0ded8"] as const;
const FIGURES = ["#8baf9f", "#bab9ad", "#8baf9f", "#bab9ad", "#8baf9f"] as const;

/** The demo key of portrait `n` and of a document. */
export function demoPhotoKey(n: number): string {
  return `${DEMO_KEY_PREFIX}photo/${n}.svg`;
}

export function demoDocumentKey(name: string): string {
  return `${DEMO_KEY_PREFIX}document/${name}.pdf`;
}

/** Portrait `n`: a head and shoulders on a plain background. */
export function demoPortrait(n: number): string {
  const bg = BACKGROUNDS[n % BACKGROUNDS.length];
  const fg = FIGURES[n % FIGURES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
<rect width="400" height="400" fill="${bg}"/>
<circle cx="200" cy="160" r="78" fill="${fg}"/>
<path d="M60 400c0-92 63-150 140-150s140 58 140 150z" fill="${fg}"/>
</svg>`;
}

/** A one-page PDF that says what it is: a demo document. ASCII only, Helvetica. */
export function demoPdf(title: string): Uint8Array {
  const text = title.replace(/[^\x20-\x7e]/g, "?").replace(/([()\\])/g, "\\$1");
  const stream = `BT /F1 20 Tf 72 720 Td (${text}) Tj 0 -32 Td /F1 12 Tf (Document de demonstration - Berceo, environnement local) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(body);
}

/** The bytes of a demo key, or null for a key that is not one. */
export function demoFileBytes(key: string): Uint8Array | null {
  const photo = /^demo\/photo\/(\d{1,3})\.svg$/.exec(key);
  if (photo) return new TextEncoder().encode(demoPortrait(Number(photo[1])));
  const document = /^demo\/document\/([a-z0-9-]{1,60})\.pdf$/.exec(key);
  if (document) return demoPdf(document[1].replace(/-/g, " ").toUpperCase());
  return null;
}

/** A demo key's bytes as the stream `/api/fichiers/[id]` sends. */
export function demoFileStream(key: string): ReadableStream<Uint8Array> | null {
  const bytes = demoFileBytes(key);
  if (!bytes) return null;
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}
