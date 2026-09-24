import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Motif rayé (DA, Couleurs p. 18): a full-width white and taupe section with
 * one solid block in front. Text never sits on the stripes: the section only
 * renders its children inside that block (taupe by default, the DA's
 * preferred surface; white allowed). A translucent block is never placed here.
 */
function StripedSection({
  className,
  blockClassName,
  block = "taupe",
  children,
  ...props
}: React.ComponentProps<"section"> & {
  block?: "taupe" | "blanc"
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
          "mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-carte p-8 text-center md:p-12",
          block === "taupe" ? "bg-taupe text-blanc" : "bg-blanc text-taupe",
          blockClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { StripedSection }
