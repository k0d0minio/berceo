import type { Metadata, Viewport } from "next";

import { common } from "@/content/common";
import { words } from "@/content/locale";
import { texte, titre } from "./fonts";
import { themeColorJour } from "./theme-color";
import "./globals.css";

/*
 * The platform's root: light, per Surya's web art direction (D-9). Fonts are
 * bound in ./fonts.ts, colours in ./globals.css. The holding page at `/` keeps
 * its night look inside its own route group, src/app/(holding)/.
 */
export const metadata: Metadata = {
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
