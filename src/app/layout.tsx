import type { Metadata, Viewport } from "next";

import { site } from "@/content/site";
import { texte, titre } from "./fonts";
import { themeColorJour } from "./theme-color";
import "./globals.css";

/*
 * The holding page's root: light, per Surya's web art direction. Fonts are
 * bound in ./fonts.ts, colours in ./globals.css, as on main.
 */
export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    siteName: site.name,
    locale: "fr_BE",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: themeColorJour,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${titre.variable} ${texte.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
