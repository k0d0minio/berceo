import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Motif rayé (DA, Couleurs p. 18): a full-width white and taupe section with
 * one solid block in front. Text never sits on the stripes: the section only
 * renders its children inside that block, the plain taupe block the DA
 * prefers, with white text (JAM-300). A translucent block is never placed
 * here, and two striped sections never follow each other.
 *
 * The block's text is aligned left, heading and button with it: the DA
 * never centres more than three lines, and a paragraph held to its 60 to 75
 * characters a line runs past three here (blocs-accueil D-19). Below md the
 * gutter and the padding tighten so the heading keeps to two lines.
 *
 * `ornament` is one of Surya's illustrative icons, butter yellow, at the
 * block's bottom right as on the deck's slides 19 and 26 (JAM-327). It is
 * decoration: it shows from md up only, where the block has room for it
 * beside the button.
 */
function StripedSection({
  className,
  blockClassName,
  ornament,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  blockClassName?: string
  ornament?: React.ReactNode
}) {
  return (
    <section
      data-slot="striped-section"
      className={cn(
        "motif-raye w-full px-3 py-16 md:px-4 md:py-24",
        className
      )}
      {...props}
    >
      <div
        data-slot="striped-section-block"
        className={cn(
          "relative mx-auto flex max-w-2xl flex-col items-start gap-6 rounded-carte bg-taupe p-6 text-blanc [--ring:var(--blanc)] md:p-12",
          blockClassName
        )}
      >
        {children}
        {ornament ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-8 bottom-8 text-beurre max-md:hidden [&>svg]:size-20"
          >
            {ornament}
          </span>
        ) : null}
      </div>
    </section>
  )
}

export { StripedSection }
