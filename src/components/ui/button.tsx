import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/*
 * The DA's button (Boutons et actions): one shape, one size, one behaviour on
 * the whole platform; only the colours follow the background it sits on.
 *
 * Capsule, 1 px border, at least 48 px tall, 24–32 px sides, Nunito SemiBold
 * 16 px, never wraps, no shadow. On hover it grows to 1.03 from its centre in
 * 200 ms ease-out, without moving its neighbours; with reduced motion only the
 * colours change. Text and resting outlines are the inks, so every row passes
 * AA at rest and on hover (finition-accueil D-2); the butter hover keeps its
 * row's ink as its text.
 */
const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 origin-center items-center justify-center gap-2 rounded-capsule border border-solid px-7 font-sans text-bouton font-semibold whitespace-nowrap select-none transition-[transform,background-color,border-color,color] duration-200 ease-out hover:[transform:scale(1.03)] motion-reduce:hover:[transform:none] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      /** The background the button sits on — the DA's four rows. */
      variant: {
        blanc:
          "border-encre-sauge bg-blanc text-encre-sauge hover:border-encre-sauge hover:bg-encre-sauge hover:text-blanc",
        raye: "border-encre-taupe bg-blanc text-encre-taupe hover:border-beurre hover:bg-beurre hover:text-encre-taupe",
        sauge:
          "border-blanc bg-encre-sauge text-blanc hover:border-beurre hover:bg-beurre hover:text-encre-sauge",
        taupe:
          "border-blanc bg-encre-taupe text-blanc hover:border-beurre hover:bg-beurre hover:text-encre-taupe",
      },
      size: {
        default: "",
        /** A square capsule for an icon alone (the menu button). */
        icon: "size-12 px-0",
      },
    },
    defaultVariants: {
      variant: "blanc",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "blanc",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
