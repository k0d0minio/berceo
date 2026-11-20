import type { NextConfig } from "next";

/*
 * The site's first Content-Security-Policy (JAM-360). It rules frames,
 * plugins and the base address only:
 *
 * - `frame-src`: the site may frame itself and `https://calendly.com`, the
 *   calendar of the sleep consultation (`src/lib/consultation-sommeil/embed.ts`
 *   frames that origin and no other).
 * - `frame-ancestors`: a page of a different origin cannot frame the site.
 * - `object-src 'self'`, not `'none'`: the founders' dossier page shows a
 *   professional's PDF in an `<object>` whose address is `/api/fichiers/[id]`
 *   (`src/components/admin/document-view.tsx`). No page frames or embeds an
 *   address of the document store.
 * - `base-uri`: no page has a `<base>` element, so this breaks nothing.
 *
 * It has no `default-src`, `script-src`, `style-src`, `connect-src` and no
 * `form-action`. A script policy needs nonces and is a different ticket.
 * `form-action` can break the redirect to Stripe Checkout after a server
 * action. `connect-src` would rule the upload to the document store.
 *
 * No HSTS here: Vercel sets it.
 */
export const contentSecurityPolicy = [
  "frame-src 'self' https://calendly.com",
  "frame-ancestors 'self'",
  "object-src 'self'",
  "base-uri 'self'",
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  /* Each path of the site: pages, route handlers and static files. */
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
