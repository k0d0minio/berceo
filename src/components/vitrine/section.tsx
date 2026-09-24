import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * One band of a vitrine page: full width, on one of the DA's surfaces, with
 * its content held to the site's width and an optional H2. The heading colour
 * follows the surface: sage on white or pearl, white on sage.
 */
const tones = {
  blanc: { band: "bg-blanc", heading: "text-sauge" },
  perle: { band: "bg-perle", heading: "text-sauge" },
  sauge: { band: "bg-sauge text-blanc", heading: "text-blanc" },
} as const

type Tone = keyof typeof tones

function VitrineSection({
  title,
  tone = "blanc",
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & { title?: string; tone?: Tone }) {
  return (
    <section className={cn("w-full", tones[tone].band)} {...props}>
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:px-8 md:py-20",
          className
        )}
      >
        {title ? (
          <h2 className={cn("font-display text-h2", tones[tone].heading)}>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export { VitrineSection, type Tone }
