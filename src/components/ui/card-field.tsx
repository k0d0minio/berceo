import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * The sage zone that white cards sit on (DA, Cartes et blocs de contenu,
 * slide 25; JAM-327): the deck shows the profile card and the request card
 * as white cards of 32 px on sage. A list of such cards in a signed-in space
 * goes in this zone. It holds cards only: a text placed straight on it must
 * be white. The focus ring stays sage: every control in the zone sits in a
 * white card.
 */
function CardField({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-field"
      className={cn(
        "rounded-carte bg-sauge p-4 text-blanc md:p-8",
        className
      )}
      {...props}
    />
  )
}

export { CardField }
