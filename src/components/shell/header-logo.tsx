"use client"

import { usePathname } from "next/navigation"

import { BerceoLogomark, BerceoWordmark } from "@/components/berceo-logo"

/*
 * The header's mark, where the DA places it (JAM-300): the full logotype on
 * the home page and the account pages, the logomark on every inner page. The
 * two never share one zone.
 */
function HeaderLogo({ full }: { full?: boolean }) {
  const pathname = usePathname()
  return full || pathname === "/" ? (
    <BerceoWordmark aria-hidden className="w-32 md:w-36" />
  ) : (
    <BerceoLogomark className="h-12 w-auto" />
  )
}

export { HeaderLogo }
