import * as React from "react"

import { MobileIcon, OursonIcon, type IconComponent } from "@/components/berceo-icons"
import { cn } from "@/lib/utils"

type Ornament = IconComponent

/*
 * The top of an inner public page: the DA's section banner (slide 10;
 * JAM-327). A full-width sage band that continues the header above it, the
 * page's one H1 in white capitals at its centre, and two of Surya's
 * illustrative icons in butter yellow resting on the title. An introduction
 * of three lines at most sits centred under it. An optional `nav` (the
 * persona switch) closes the band.
 */
function PageHeader({
  title,
  intro,
  nav,
  ornaments = [OursonIcon, MobileIcon],
  titleLevel = 1,
  className,
}: {
  title: string
  intro?: string
  nav?: React.ReactNode
  /** The two icons on the title: the first at its top right, the second at its bottom left. */
  ornaments?: readonly [Ornament, Ornament]
  /** The title's rank: 1 on a page, 3 where the banner is shown as a specimen. */
  titleLevel?: 1 | 3
  className?: string
}) {
  const [First, Second] = ornaments
  const Title = titleLevel === 1 ? "h1" : "h3"
  return (
    <div className={cn("bg-sauge text-blanc [--ring:var(--blanc)]", className)}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pt-10 pb-14 text-center md:px-8 md:pt-14 md:pb-20">
        {/* The box never grows past the band, so a long word in capitals breaks on a phone. */}
        <div className="relative max-w-full px-6 md:px-12">
          <First
            aria-hidden
            className="pointer-events-none absolute -top-7 right-0 size-10 text-beurre md:-top-9 md:size-14"
          />
          <Title className="font-display text-h1 text-balance">{title}</Title>
          <Second
            aria-hidden
            className="pointer-events-none absolute -bottom-8 left-0 size-10 text-beurre md:-bottom-10 md:size-14"
          />
        </div>
        {intro ? <p className="max-w-2xl pt-4 text-intro">{intro}</p> : null}
        {nav ? <div className="pt-2">{nav}</div> : null}
      </div>
    </div>
  )
}

export { PageHeader }
