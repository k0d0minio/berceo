import type { Metadata } from "next";

import { common } from "@/content/common";
import { words } from "@/content/locale";

const c = words(common);

/** The one shared card (public/og.png, 1200 × 630, the DA's light look). */
const ogImage = { url: "/og.png", width: 1200, height: 630, alt: c.name };

/**
 * A vitrine page's metadata from its catalogue entry: its own title and
 * description, a canonical URL, and Open Graph and Twitter tags carrying both
 * with the shared card. `index: false` keeps a placeholder page out of search
 * engines until its text arrives.
 */
export function pageMetadata(
  meta: { title: string; description: string },
  path: string,
  { index = true }: { index?: boolean } = {},
): Metadata {
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: path,
      siteName: c.name,
      locale: "fr_BE",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogImage.url],
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
