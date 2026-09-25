import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Motif rayé (DA, Couleurs p. 18): a full-width white and taupe section with
 * one solid block in front. Text never sits on the stripes: the section only
 * renders its children inside that block, the white block the DA allows, with
 * taupe-ink text. The taupe block is gone: white text on taupe cannot reach
 * AA (finition-accueil D-2). A translucent block is never placed here.
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
      className={cn("motif-raye w-full px-4 py-16 md:py-24", className)}
      {...props}
    >
      <div
        data-slot="striped-section-block"
        className={cn(
          "mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-carte bg-blanc p-8 text-center text-encre-taupe md:p-12",
          blockClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { StripedSection }
