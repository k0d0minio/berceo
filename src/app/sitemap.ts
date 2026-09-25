import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { validProfessionals } from "@/lib/recherche/professionals";
import { sitemapPaths } from "@/lib/recherche/sitemap";
import { siteUrl } from "./site";

const { pages } = words(common);

/*
 * The indexable pages: the vitrine's, every commune page (D-128) and the
 * public page of every validated professional (D-14). The founders' story and
 * the legal pages stay out until their texts arrive (they are noindex). The
 * sitemap is rendered on request, never at build (the build must not need the
 * database); the professionals' list is read at most once an hour.
 */
const vitrine = ["/", pages.commentCaMarche.href, pages.tarifs.href, pages.faq.href];

const professionals = unstable_cache(validProfessionals, ["sitemap-professionnelles"], { revalidate: 3600 });

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapPaths(vitrine, await professionals()).map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
