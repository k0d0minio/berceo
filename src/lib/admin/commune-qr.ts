import { communeName } from "@/lib/communes";
import { communeOfSlug } from "@/lib/recherche/slugs";

import { ADMIN_COMMUNES_PATH, communeShareUrl } from "./communes";

/**
 * The QR code of a commune's share link (JAM-361), for the founders' posts and
 * prints. Pure: what a request for a code names, the file name, the options
 * and the headers. `commune-qr-render.ts` draws the code, and the route
 * `/admin/communes/[slug]/qr` wires the guard. The code holds the share link
 * that the server makes from the slug, and no other value of the request.
 */

export const QR_FORMATS = ["svg", "png"] as const;
export type QrFormat = (typeof QR_FORMATS)[number];

/**
 * The options for print: error correction `M`, a quiet zone of 4 modules, and
 * the colours of the package, which are black on white.
 */
export const QR_OPTIONS = { errorCorrectionLevel: "M", margin: 4 } as const;

/** The side of the PNG in pixels. The SVG has no size: it scales. */
export const QR_PNG_WIDTH = 1024;

export const QR_CONTENT_TYPES: Record<QrFormat, string> = {
  svg: "image/svg+xml; charset=utf-8",
  png: "image/png",
};

/** A `?format=` value as a format, or null for each other value. */
export function qrFormat(raw: string | null | undefined): QrFormat | null {
  return QR_FORMATS.find((format) => format === raw) ?? null;
}

/** The file a download saves: « berceo-ixelles.svg ». */
export function qrFileName(slug: string, format: QrFormat): string {
  return `berceo-${slug}.${format}`;
}

/** The address of a commune's code: shown in the page, or downloaded. */
export function communeQrPath(slug: string, format: QrFormat, download = false): string {
  return `${ADMIN_COMMUNES_PATH}/${slug}/qr?format=${format}${download ? "&download=1" : ""}`;
}

export type QrRequest = { ins: string; slug: string; commune: string; format: QrFormat; download: boolean };

/**
 * What a request names, or null (a 404): the slug of a commune of the official
 * list, one of the two formats, and `download` absent or `1`. A parameter that
 * the route does not know, or one given twice, is a 404 too.
 */
export function qrRequest(slug: string, query: URLSearchParams): QrRequest | null {
  const ins = communeOfSlug(slug);
  const commune = ins ? communeName(ins) : null;
  if (!ins || !commune) return null;
  for (const key of query.keys()) {
    if (key !== "format" && key !== "download") return null;
    if (query.getAll(key).length !== 1) return null;
  }
  const format = qrFormat(query.get("format"));
  if (!format) return null;
  const download = query.get("download");
  if (download !== null && download !== "1") return null;
  return { ins, slug, commune, format, download: download === "1" };
}

/**
 * The headers of a code. A download is an attachment with its file name; the
 * page's image is inline. Private: only a founder's browser keeps it. The slug
 * has only `a-z`, `0-9` and `-`, so the file name needs no escape.
 */
export function qrHeaders(request: Pick<QrRequest, "slug" | "format" | "download">): Record<string, string> {
  const name = qrFileName(request.slug, request.format);
  return {
    "content-type": QR_CONTENT_TYPES[request.format],
    "content-disposition": `${request.download ? "attachment" : "inline"}; filename="${name}"`,
    "cache-control": "private, max-age=3600",
    "x-content-type-options": "nosniff",
  };
}

/** Draws the code of a link: the SVG text or the PNG bytes. */
export type QrRenderer = (url: string, format: QrFormat) => Promise<string | Uint8Array>;

/**
 * The response for a founder, or null (a 404). The link in the code is the
 * share link of the commune at `origin`: the same text as on the page.
 */
export async function qrResponse(
  slug: string,
  query: URLSearchParams,
  origin: string,
  render: QrRenderer,
): Promise<Response | null> {
  const request = qrRequest(slug, query);
  if (!request) return null;
  const url = communeShareUrl(origin, request.ins);
  if (!url) return null;
  const body = await render(url, request.format);
  return new Response(typeof body === "string" ? body : new Uint8Array(body), { headers: qrHeaders(request) });
}
