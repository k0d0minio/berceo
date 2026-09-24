/*
 * The production address. Canonical URLs, Open Graph URLs, the sitemap and
 * robots.txt are all written against it, whichever environment builds the
 * page: the UAT copy is never indexed (src/app/robots.ts), so its canonical
 * points at production.
 */
export const siteUrl = "https://www.berceo.be";

/** Only production may be crawled; UAT and previews build on Vercel's Preview environment. */
export const isIndexable = process.env.VERCEL_ENV === "production";
