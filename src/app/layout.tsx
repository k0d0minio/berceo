import type { Metadata, Viewport } from "next";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { texte, titre } from "./fonts";
import { siteUrl } from "./site";
import { themeColorJour } from "./theme-color";
import "./globals.css";

/*
 * The platform's root: light, per Surya's web art direction (D-9). Fonts are
 * bound in ./fonts.ts, colours in ./globals.css. Every relative URL in a
 * page's metadata (canonical, Open Graph) resolves against production.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: words(common).name,
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
