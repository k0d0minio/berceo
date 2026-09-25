import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * No professional in the zone (D-124): the message, then the way forward the
 * page gives (publish a request in the space, create an account on a commune
 * page). Never an empty list on its own: the guide's « Ne jamais laisser la
 * famille face à une impasse ».
 */
function NoResult({
  text,
  children,
  className,
}: {
  text: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex max-w-2xl flex-col items-start gap-4 rounded-carte bg-perle px-6 py-6 md:px-8", className)}>
      <p className="text-corps text-encre-taupe">{text}</p>
      {children}
    </section>
  )
}

export { NoResult }
