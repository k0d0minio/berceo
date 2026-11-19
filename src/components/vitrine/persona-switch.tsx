import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Side = { label: string; href: string }

/*
 * The two sides of a page told twice, one per persona (feedback round 1,
 * « Comment ça marche »): two capsule links, the reader's side filled and
 * marked as the current page, the other outlined. They wrap onto two lines
 * on a 320 px screen rather than shrink below the DA's button.
 */
function PersonaSwitch({
  label,
  sides,
  current,
  className,
}: {
  label: string
  sides: readonly Side[]
  current: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap justify-center gap-2">
        {sides.map((side) => {
          const active = side.href === current
          return (
            <li key={side.href}>
              <Button
                asChild
                variant={active ? "sauge" : "blanc"}
                className={cn("px-6", active && "pointer-events-none")}
              >
                <Link
                  href={side.href}
                  aria-current={active ? "page" : undefined}
                >
                  {side.label}
                </Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { PersonaSwitch }
