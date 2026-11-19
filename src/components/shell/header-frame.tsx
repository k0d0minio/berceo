"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/*
 * Where the public header sits (DA, slides 19 and 10; JAM-327). On the home
 * page it is transparent and lies over the hero's photograph. On every other
 * page it is the top of the sage band that carries the page's title. Its
 * content is white in both, and the focus ring turns white with it.
 */
function HeaderFrame({ children }: { children: React.ReactNode }) {
  const onPhoto = usePathname() === "/"
  return (
    <header
      data-on-photo={onPhoto ? "" : undefined}
      className={cn(
        "text-blanc [--ring:var(--blanc)]",
        onPhoto ? "absolute inset-x-0 top-0 z-10" : "bg-sauge"
      )}
    >
      {children}
    </header>
  )
}

export { HeaderFrame }
