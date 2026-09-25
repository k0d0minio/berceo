import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * One band of a vitrine page: full width, on one of the DA's surfaces, with
 * its content held to the site's width and an optional H2, in the sage ink on
 * every surface. The sage band sets no text colour of its own: its body text
 * lives in white cards, since neither ink nor white reaches 4.5:1 on sage
 * (finition-accueil D-2); the ink heading, large text, reaches 3.25:1.
 */
const tones = {
  blanc: { band: "bg-blanc", heading: "text-encre-sauge" },
  perle: { band: "bg-perle", heading: "text-encre-sauge" },
  sauge: { band: "bg-sauge", heading: "text-encre-sauge" },
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
