import { AnneauIcon, CoeursIcon } from "@/components/berceo-icons";
import { BerceoWordmark } from "@/components/berceo-logo";
import { buttonVariants } from "@/components/ui/button";
import { TranslucentBlock } from "@/components/ui/translucent-block";
import { Photo } from "@/components/vitrine/photo";
import { words } from "@/content/locale";
import { photos } from "@/content/photos";
import { site } from "@/content/site";

/**
 * The holding page, to the DA's slide 29, « Site en construction »: the
 * photograph across the screen, the white logotype, and a translucent pearl
 * block with the H1 in white capitals, the sentence, two of Surya's yellow
 * icons and a white capsule. It is main's PlaceholderPage
 * (src/components/vitrine/placeholder-page.tsx) at full height. The capsule
 * is a status, not a link: the site has nowhere to send a visitor yet.
 *
 * One screen, no navigation, no contact. Every word is in src/content/site.ts.
 */
export default function Page() {
  const p = words(photos);
  return (
    <main className="relative isolate flex min-h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 py-16 md:py-24">
      <Photo
        photo={p.oursBerceau}
        preload
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full rounded-none"
      />
      <BerceoWordmark
        role="img"
        aria-label={site.name}
        className="w-48 text-blanc md:w-64"
      />
      <TranslucentBlock className="relative max-w-2xl items-center gap-5 text-center md:px-16 md:py-10">
        <CoeursIcon
          aria-hidden
          className="pointer-events-none absolute top-4 right-4 size-10 text-beurre md:size-14"
        />
        <h1 className="font-display text-h2 text-balance">{site.title}</h1>
        <p className="text-intro">{site.text}</p>
        <p className={buttonVariants({ variant: "blanc", className: "pointer-events-none" })}>
          {site.status}
        </p>
        <AnneauIcon
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 size-10 text-beurre md:size-12"
        />
      </TranslucentBlock>
    </main>
  );
}
