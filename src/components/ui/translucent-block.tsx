import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Le système de transparence (DA p. 21): pearl at 75 % on the block's
 * background only, over a photograph or a coloured background. Its text,
 * icons, fields and buttons stay at 100 %. Keep it to short texts and
 * functional elements, and never place it over the striped pattern. Its text
 * is white, as the DA shows it (JAM-300).
 */
function TranslucentBlock({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="translucent-block"
      className={cn(
        "voile-perle flex flex-col gap-4 rounded-carte p-6 text-blanc md:p-8",
        className
      )}
      {...props}
    />
  )
}

export { TranslucentBlock }
