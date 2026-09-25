import type * as React from "react"
import Link from "next/link"

import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { cardTitle, childrenLine, nightLine, placeLine } from "@/lib/demandes/format"
import type { RequestCard as Request } from "@/lib/demandes/requests"
import type { DisplayStatus } from "@/lib/demandes/rules"
import { cn } from "@/lib/utils"

/*
 * The DA's request card (Cartes et blocs de contenu): « Garde de nuit à
 * <Commune> », the locality, the night, the children, 32 px corners, flat
 * pearl, no shadow. An urgent request carries a butter-yellow mark, never red
 * (D-24). The family's card adds its status and a link; a professional's card
 * shows when it was published. It never shows anything about the family
 * (D-15): its props hold only the card columns.
 */

const t = words(demandes)

function Mark({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-capsule px-3 py-1 text-legende font-semibold text-taupe",
        className
      )}
    >
      {children}
    </span>
  )
}

function RequestCard({
  request,
  status,
  href,
  showPublished = false,
}: {
  request: Request
  /** The family's view: the request's status. */
  status?: DisplayStatus
  /** The family's view: a link to the request. */
  href?: string
  showPublished?: boolean
}) {
  const published = new Intl.DateTimeFormat("fr-BE", {
    timeZone: "Europe/Brussels",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(request.createdAt)

  return (
    <article className="flex flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
      <div className="flex flex-wrap items-center gap-2">
        {request.urgent ? <Mark className="bg-beurre">{t.carte.urgente}</Mark> : null}
        {status ? (
          <Mark className="border border-solid border-taupe bg-blanc">{t.statuts[status]}</Mark>
        ) : null}
      </div>
      <h2 className="font-display text-h3 text-sauge uppercase">
        {cardTitle(request.communeIns, request.locality)}
      </h2>
      <p className="text-corps text-taupe">{placeLine(request.postcode, request.locality)}</p>
      <p className="text-corps font-semibold text-taupe">
        {nightLine(request.nightDate, request.startTime)}
      </p>
      <p className="text-corps text-taupe">
        {childrenLine(request.children, request.babyAgeValue, request.babyAgeUnit)}
      </p>
      {showPublished ? (
        <p className="text-legende text-taupe">{fill(t.carte.publiee, { date: published })}</p>
      ) : null}
      {href ? (
        <Link
          href={href}
          className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
        >
          {t.boutons.voir}
        </Link>
      ) : null}
    </article>
  )
}

export { RequestCard }
