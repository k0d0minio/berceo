import type { Metadata } from "next";

import { BerceoLogomark, BerceoWordmark } from "@/components/berceo-logo";
import { holding } from "@/content/holding";
import { words } from "@/content/locale";

const site = words(holding);

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

/**
 * The holding page. One screen, no navigation, no contact — Berceo has no
 * published address yet and a made-up one would be worse than none.
 *
 * Everything it says lives in `src/content/holding.ts`; its night palette is
 * scoped to `.nuit` by `./layout.tsx`.
 */
export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      {/* The mark, breathing inside its night-light. */}
      <div className="lever relative flex items-center justify-center">
        <div
          aria-hidden
          className="halo pointer-events-none absolute size-64 rounded-full blur-3xl sm:size-80"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--nuit-menthe) 64%, transparent) 0%, transparent 70%)",
          }}
        />
        <BerceoLogomark className="souffle relative h-24 w-auto text-nuit-lin sm:h-28" />
      </div>

      <BerceoWordmark
        className="lever mt-9 w-52 text-nuit-lin sm:w-64"
        style={{ animationDelay: "120ms" }}
      />

      <h1
        className="lever mt-12 font-display text-3xl leading-[1.15] font-normal tracking-tight text-balance text-nuit-lin sm:text-4xl md:text-5xl"
        style={{ animationDelay: "240ms" }}
      >
        {site.headline[0]}
        <br />
        <span className="text-nuit-menthe">{site.headline[1]}</span>
      </h1>

      <p
        className="lever mt-7 max-w-md text-base leading-relaxed text-pretty text-nuit-sauge"
        style={{ animationDelay: "360ms" }}
      >
        {site.blurb}
      </p>

      <p
        className="lever mt-14 flex items-center gap-2.5 text-sm tracking-wide text-nuit-sauge/80"
        style={{ animationDelay: "480ms" }}
      >
        <span
          aria-hidden
          className="souffle size-1.5 rounded-full bg-nuit-veilleuse"
        />
        {site.status}
      </p>
    </main>
  );
}
