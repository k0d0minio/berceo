import type * as React from "react"
import Link from "next/link"

import { BebeIcon, BiberonIcon, CalendrierIcon, LieuIcon, type IconComponent } from "@/components/berceo-icons"
import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { cardTitle, childrenLine, feedingLine, nightLine, placeLine } from "@/lib/demandes/format"
import type { RequestCard } from "@/lib/demandes/requests"
import type { DisplayStatus } from "@/lib/demandes/rules"

/*
 * Regular nights in « Mes demandes » (demande-nuits-regulieres): one card for
 * the series, in the request card's construction (JAM-327: a white card of
 * 32 px, the title in taupe capitals, one line for each fact with one of
 * Surya's icons in taupe, no shadow). The commune, the place, the count of nights, the children and their
 * feeding are the first night's: the series was published with one set of
 * details. Then one line per night, in date order, with its own hours, its
 * status, its answers and its link: each night of an older series is a
 * request of its own. A regular request answered as one (JAM-302) shows its
 * nights without a link of their own, or with the link to a night's garde. The
 * page passes « Annuler toutes les nuits » as the footer while a night is open.
 */

const t = words(demandes)

type Night = {
  request: RequestCard
  /** Absent on a professional's view (JAM-302): every night she reads is open. */
  status?: DisplayStatus
  /** Absent when the night has no page of its own: a regular request answered as one (JAM-302). */
  href?: string
  /** The link's words, « Voir la nuit » by default. */
  linkLabel?: string
  /** « 2 réponses ». */
  note?: string
}

function SeriesCard({
  nights,
  footer,
  aside,
}: {
  nights: readonly Night[]
  footer?: React.ReactNode
  /** Under the details, before the nights: a professional's rate line (JAM-302). */
  aside?: React.ReactNode
}) {
  const first = nights[0].request
  const count = nights.length === 1 ? t.serie.uneNuit : fill(t.serie.nombre, { n: String(nights.length) })

  return (
    <article className="flex h-full flex-col gap-4 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-10">
      <span className="inline-flex w-fit items-center rounded-capsule border border-solid border-taupe bg-blanc px-3 py-1 text-legende font-semibold text-taupe">
        {t.serie.marque}
      </span>
      <h2 className="font-display text-intro text-balance text-taupe">
        {cardTitle(first.communeIns, first.locality)}
      </h2>
      <ul className="flex flex-col gap-3">
        <Fact icon={LieuIcon}>{placeLine(first.postcode, first.locality)}</Fact>
        <Fact icon={CalendrierIcon}>
          <span className="font-semibold">{count}</span>
        </Fact>
        <Fact icon={BebeIcon}>{childrenLine(first.children, first.babyAgeValue, first.babyAgeUnit)}</Fact>
        {first.feeding ? <Fact icon={BiberonIcon}>{feedingLine(first.feeding)}</Fact> : null}
      </ul>
      {aside}
      <ul aria-label={t.serie.nuits} className="flex flex-col gap-3 pt-2">
        {nights.map(({ request, status, href, linkLabel, note }) => (
          <li
            key={request.id}
            className="flex flex-col gap-1 border-t border-solid border-taupe pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-corps font-semibold text-taupe">
                {nightLine(request.nightDate, request.startTime, request.extraHours)}
              </span>
              {status ? (
                <span className="inline-flex w-fit items-center rounded-capsule border border-solid border-taupe bg-blanc px-3 py-1 text-legende font-semibold text-taupe">
                  {t.statuts[status]}
                </span>
              ) : null}
            </div>
            {note ? <p className="text-corps text-taupe">{note}</p> : null}
            {href ? (
              <Link
                href={href}
                className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
              >
                {linkLabel ?? t.serie.voir}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-auto flex flex-wrap gap-3 pt-2">{footer}</div> : null}
    </article>
  )
}

/** One fact of the card, as on the request card: an icon of 24 px in taupe, then its line. */
function Fact({ icon: Icon, children }: { icon: IconComponent; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-corps">
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-taupe" />
      <span className="min-w-0">{children}</span>
    </li>
  )
}

export { SeriesCard }
