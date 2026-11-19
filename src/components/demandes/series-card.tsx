import type * as React from "react"
import Link from "next/link"

import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { cardTitle, childrenLine, feedingLine, nightLine, placeLine } from "@/lib/demandes/format"
import type { RequestCard } from "@/lib/demandes/requests"
import type { DisplayStatus } from "@/lib/demandes/rules"

/*
 * Regular nights in « Mes demandes » (demande-nuits-regulieres): one card for
 * the series, in the request card's construction (32 px corners, flat pearl, no
 * shadow). The commune, the place, the count of nights, the children and their
 * feeding are the first night's: the series was published with one set of
 * details. Then one line per night, in date order, with its own hours, its
 * status, its answers and its link: each night is a request of its own. The
 * page passes « Annuler toutes les nuits » as the footer while a night is open.
 */

const t = words(demandes)

type Night = {
  request: RequestCard
  status: DisplayStatus
  href: string
  /** « 2 réponses ». */
  note?: string
}

function SeriesCard({ nights, footer }: { nights: readonly Night[]; footer?: React.ReactNode }) {
  const first = nights[0].request
  const count = nights.length === 1 ? t.serie.uneNuit : fill(t.serie.nombre, { n: String(nights.length) })

  return (
    <article className="flex flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
      <span className="inline-flex w-fit items-center rounded-capsule border border-solid border-taupe bg-blanc px-3 py-1 text-legende font-semibold text-taupe">
        {t.serie.marque}
      </span>
      <h2 className="text-h3 font-bold text-sauge">{cardTitle(first.communeIns, first.locality)}</h2>
      <p className="text-corps text-taupe">{placeLine(first.postcode, first.locality)}</p>
      <p className="text-corps font-semibold text-taupe">{count}</p>
      <p className="text-corps text-taupe">
        {childrenLine(first.children, first.babyAgeValue, first.babyAgeUnit)}
      </p>
      {first.feeding ? <p className="text-corps text-taupe">{feedingLine(first.feeding)}</p> : null}
      <ul aria-label={t.serie.nuits} className="flex flex-col gap-3 pt-2">
        {nights.map(({ request, status, href, note }) => (
          <li
            key={request.id}
            className="flex flex-col gap-1 border-t border-solid border-taupe pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-corps font-semibold text-taupe">
                {nightLine(request.nightDate, request.startTime, request.extraHours)}
              </span>
              <span className="inline-flex w-fit items-center rounded-capsule border border-solid border-taupe bg-blanc px-3 py-1 text-legende font-semibold text-taupe">
                {t.statuts[status]}
              </span>
            </div>
            {note ? <p className="text-corps text-taupe">{note}</p> : null}
            <Link
              href={href}
              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
            >
              {t.serie.voir}
            </Link>
          </li>
        ))}
      </ul>
      {footer ? <div className="flex flex-wrap gap-3 pt-2">{footer}</div> : null}
    </article>
  )
}

export { SeriesCard }
