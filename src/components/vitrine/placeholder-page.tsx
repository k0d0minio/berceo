import Link from "next/link"

import { AnneauIcon, CoeursIcon } from "@/components/berceo-icons"
import { BerceoWordmark } from "@/components/berceo-logo"
import { Button } from "@/components/ui/button"
import { TranslucentBlock } from "@/components/ui/translucent-block"
import { Photo } from "@/components/vitrine/photo"
import { words } from "@/content/locale"
import { photos } from "@/content/photos"

/*
 * A page that exists before its text does, to the DA's slide 29, « Site en
 * construction » (JAM-327): a photograph across the page, the white
 * logotype, and a translucent pearl block with the H1 in white capitals, one
 * sentence saying the text is coming, two of Surya's yellow icons and an
 * optional capsule. Used by the two legal pages until their texts arrive.
 */
function PlaceholderPage({
  title,
  text,
  closing,
  cta,
}: {
  title: string
  text: string
  closing?: string
  cta?: { label: string; href: string }
}) {
  const p = words(photos)
  return (
    <section className="relative isolate flex w-full flex-col items-center gap-8 overflow-hidden px-4 py-16 md:py-24">
      <Photo
        photo={p.oursBerceau}
        preload
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full rounded-none"
      />
      <BerceoWordmark aria-hidden className="w-48 text-blanc md:w-64" />
      <TranslucentBlock className="relative max-w-2xl items-center gap-5 text-center md:px-16 md:py-10">
        <CoeursIcon
          aria-hidden
          className="pointer-events-none absolute top-4 right-4 size-10 text-beurre md:size-14"
        />
        <h1 className="font-display text-h2 text-balance">{title}</h1>
        <p className="text-intro">{text}</p>
        {closing ? <p>{closing}</p> : null}
        {cta ? (
          <Button asChild variant="blanc">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
        <AnneauIcon
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 size-10 text-beurre md:size-12"
        />
      </TranslucentBlock>
    </section>
  )
}

export { PlaceholderPage }
