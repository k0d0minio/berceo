import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * The DA's field: a capsule like the buttons (search fields and filters are
 * capsules in Formes et langage graphique), 48 px tall, Nunito 16 px, 1 px
 * border, no shadow. White at 100 % even inside a translucent block.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-12 w-full min-w-0 rounded-capsule border border-solid border-input bg-blanc px-6 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out placeholder:text-encre-taupe/90 focus-visible:border-encre-sauge disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive file:border-0 file:bg-transparent file:font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { Input }
