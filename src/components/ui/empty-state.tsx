import * as React from "react"

import type { IconComponent } from "@/components/berceo-icons"
import { cn } from "@/lib/utils"

/*
 * An empty list or a page with nothing to show yet (JAM-327): a taupe block
 * of 32 px with white text and one of Surya's illustrative icons in butter
 * yellow, as the deck's taupe blocks carry them (slides 10 and 26). The icon
 * is decoration. The yellow never sits on white or pearl, where it cannot be
 * seen. `children` holds the way out: a button of the `taupe` variant.
 */
function EmptyState({
  icon: Icon,
  title,
  text,
  children,
  className,
}: {
  icon: IconComponent
  title?: string
  text: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "flex max-w-2xl items-start gap-5 rounded-carte bg-taupe px-6 py-6 text-blanc [--ring:var(--blanc)] md:px-8 md:py-8",
        className
      )}
    >
      <Icon aria-hidden className="size-16 shrink-0 text-beurre max-sm:hidden" />
      <div className="flex min-w-0 flex-col items-start gap-3">
        {title ? <h2 className="text-h3 font-bold text-balance">{title}</h2> : null}
        <p className="text-corps">{text}</p>
        {children}
      </div>
    </section>
  )
}

export { EmptyState }
