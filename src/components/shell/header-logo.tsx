import { BerceoLogomark, BerceoWordmark } from "@/components/berceo-logo"

/*
 * The header's mark, where the DA places it (JAM-300, JAM-327): the logomark
 * on the public pages, the home page included, because the home's hero
 * carries the large logotype and the two never share one zone (slide 19).
 * The full logotype on the account pages (slide 4: sign-in and sign-up).
 */
function HeaderLogo({ full }: { full?: boolean }) {
  return full ? (
    <BerceoWordmark aria-hidden className="w-32 md:w-36" />
  ) : (
    <BerceoLogomark className="h-12 w-auto" />
  )
}

export { HeaderLogo }
