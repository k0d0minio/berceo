import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";

import { site } from "@/content/site";
import "./globals.css";

/*
 * Fraunces for display, Karla for text.
 *
 * The wordmark is a high-contrast serif with a soft, slightly odd warmth to it.
 * Fraunces is the closest living relative — an old-style serif with the same
 * softness, so the headline reads as the same voice as the logo rather than as
 * a caption pasted underneath it. Karla carries the rest: humanist, quiet, and
 * unfussy at small sizes.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

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
  themeColor: "#0b1a16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
