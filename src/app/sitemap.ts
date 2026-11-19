import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { CONTACT_PATH, contactEnabled } from "@/lib/contact/config";
import { validProfessionals } from "@/lib/recherche/professionals";
import { sitemapPaths } from "@/lib/recherche/sitemap";
import { siteUrl } from "./site";

const { pages } = words(common);

/*
 * The indexable pages: the vitrine's, every commune page (D-128) and the
 * public page of every validated professional (D-14). Both sides of « Comment
 * ça marche » are in, the redirect `/comment-ca-marche/parents` is not. The
 * founders' story is in, and the professionals' charter. The legal pages stay out until their texts arrive (they are noindex). The
 * sitemap is rendered on request, never at build (the build must not need the
 * database); the professionals' list is read at most once an hour.
 */
const vitrine = [
  "/",
  pages.commentCaMarche.href,
  pages.commentCaMarcheProfessionnelles.href,
  pages.tarifs.href,
  pages.faq.href,
  pages.quiSommesNous.href,
  pages.charte.href,
];

const professionals = unstable_cache(validProfessionals, ["sitemap-professionnelles"], { revalidate: 3600 });

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The contact page exists only where the environment has a contact address (JAM-327).
  const pagesOfSite = contactEnabled() ? [...vitrine, CONTACT_PATH] : vitrine;
  return sitemapPaths(pagesOfSite, await professionals()).map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
