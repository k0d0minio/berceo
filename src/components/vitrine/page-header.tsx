import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * The top of an inner vitrine page: its one H1 and an introduction, with an
 * optional photograph beside them from md up.
 */
function PageHeader({
  title,
  intro,
  aside,
  className,
}: {
  title: string
  intro?: string
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-12 md:px-8 md:pt-16 md:pb-16",
        aside ? "md:grid-cols-2 md:items-center" : null,
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="font-display text-h1 text-encre-sauge">{title}</h1>
        {intro ? <p className="text-intro">{intro}</p> : null}
      </div>
      {aside}
    </div>
  )
}

export { PageHeader }
