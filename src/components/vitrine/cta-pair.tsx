import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Cta = { label: string; href: string }

/*
 * The two doors of the home page (the guide: two journeys, visually distinct,
 * different calls to action). The family's is the filled sage capsule, the
 * professional's the outlined one. Which family wording to use is the
 * caller's (D-25).
 */
function CtaPair({
  family,
  professional,
  className,
}: {
  family: Cta
  professional: Cta
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}>
      <Button asChild variant="sauge">
        <Link href={family.href}>{family.label}</Link>
      </Button>
      <Button asChild variant="blanc">
        <Link href={professional.href}>{professional.label}</Link>
      </Button>
    </div>
  )
}

export { CtaPair }
