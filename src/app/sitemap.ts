import type { MetadataRoute } from "next";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { siteUrl } from "./site";

const { pages } = words(common);

/*
 * The indexable vitrine pages. The founders' story and the legal pages stay
 * out until their texts arrive (they are noindex); the sign-up pages and the
 * public professional and commune pages are added by the stubs that build them.
 */
const paths = ["/", pages.commentCaMarche.href, pages.tarifs.href, pages.faq.href];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
