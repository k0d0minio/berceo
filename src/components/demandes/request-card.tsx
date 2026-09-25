import type * as React from "react"
import Link from "next/link"

import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { reservations } from "@/content/reservations"
import { cardTitle, childrenLine, nightLine, placeLine } from "@/lib/demandes/format"
import type { RequestCard as Request } from "@/lib/demandes/requests"
import type { DisplayStatus } from "@/lib/demandes/rules"
import { rateLine } from "@/lib/reservations/format"
import { cn } from "@/lib/utils"

/*
 * The DA's request card (Cartes et blocs de contenu): « Garde de nuit à
 * <Commune> », the locality, the night, the children, 32 px corners, flat
 * pearl, no shadow. An urgent request carries a butter-yellow mark, never red
 * (D-24). The family's card adds its status, its answers and a link; a
 * professional's card shows when it was published, a request sent to her in
 * priority (butter yellow too, D-71), her rate as the DA's price line, and her
 * answer's buttons below. It never shows anything about the family (D-15): its
 * props hold only the card columns.
 */

const t = words(demandes)
const r = words(reservations)

function Mark({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-capsule px-3 py-1 text-legende font-semibold text-encre-taupe",
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
  priority = false,
  rate,
  note,
  footer,
}: {
  request: Request
  /** The family's view: the request's status. */
  status?: DisplayStatus
  /** The family's view: a link to the request. */
  href?: string
  showPublished?: boolean
  /** The professional's view: sent to her « en priorité » (D-71). */
  priority?: boolean
  /** The professional's view: her rate, the DA's « 150 € pour la garde de nuit ». */
  rate?: number | null
  /** A short line under the card's facts: « 2 réponses », « Vous avez répondu ». */
  note?: string
  /** The professional's view: her answer's buttons. */
  footer?: React.ReactNode
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
        {priority ? <Mark className="bg-beurre">{r.professionnelle.prioritaire}</Mark> : null}
        {request.urgent ? <Mark className="bg-beurre">{t.carte.urgente}</Mark> : null}
        {status ? (
          <Mark className="border border-solid border-taupe bg-blanc">{t.statuts[status]}</Mark>
        ) : null}
      </div>
      <h2 className="font-display text-h3 text-encre-sauge uppercase">
        {cardTitle(request.communeIns, request.locality)}
      </h2>
      <p className="text-corps text-encre-taupe">{placeLine(request.postcode, request.locality)}</p>
      <p className="text-corps font-semibold text-encre-taupe">
        {nightLine(request.nightDate, request.startTime)}
      </p>
      <p className="text-corps text-encre-taupe">
        {childrenLine(request.children, request.babyAgeValue, request.babyAgeUnit)}
      </p>
      {rate ? <p className="text-corps font-semibold text-encre-sauge">{rateLine(rate)}</p> : null}
      {showPublished ? (
        <p className="text-legende text-encre-taupe">{fill(t.carte.publiee, { date: published })}</p>
      ) : null}
      {note ? <p className="text-corps font-semibold text-encre-taupe">{note}</p> : null}
      {href ? (
        <Link
          href={href}
          className="w-fit rounded-md text-corps font-semibold text-encre-sauge underline underline-offset-4"
        >
          {t.boutons.voir}
        </Link>
      ) : null}
      {footer ? <div className="flex flex-wrap gap-3 pt-2">{footer}</div> : null}
    </article>
  )
}

export { RequestCard }
