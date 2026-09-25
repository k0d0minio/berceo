import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Motif rayé (DA, Couleurs p. 18): a full-width white and taupe section with
 * one solid block in front. Text never sits on the stripes: the section only
 * renders its children inside that block, the white block the DA allows, with
 * taupe-ink text. The taupe block is gone: white text on taupe cannot reach
 * AA (finition-accueil D-2). A translucent block is never placed here.
 *
 * The block's text is aligned left, heading and button with it: the DA
 * never centres more than three lines, and a paragraph held to its 60 to 75
 * characters a line runs past three here (blocs-accueil D-19). Below md the
 * gutter and the padding tighten so the heading keeps to two lines.
 */
function StripedSection({
  className,
  blockClassName,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  blockClassName?: string
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
          "mx-auto flex max-w-2xl flex-col items-start gap-6 rounded-carte bg-blanc p-6 text-encre-taupe md:p-12",
          blockClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { StripedSection }
