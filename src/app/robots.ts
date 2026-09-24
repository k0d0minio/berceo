import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "./site";

/*
 * Production is crawlable and names its sitemap. Every other deployment
 * (uat.berceo.be, the previews, a local build) refuses every crawler, so the
 * UAT copy never competes with production in search results.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
