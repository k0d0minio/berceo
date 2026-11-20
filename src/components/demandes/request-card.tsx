import type * as React from "react"
import Link from "next/link"

import { BebeIcon, BiberonIcon, CalendrierIcon, LieuIcon, type IconComponent } from "@/components/berceo-icons"
import { EuroIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { reservations } from "@/content/reservations"
import { cardTitle, childrenLine, feedingLine, nightLine, placeLine } from "@/lib/demandes/format"
import type { RequestCard as Request } from "@/lib/demandes/requests"
import type { DisplayStatus } from "@/lib/demandes/rules"
import { extraHourLine, rateLine } from "@/lib/reservations/format"
import { cn } from "@/lib/utils"

/*
 * The DA's request card (Cartes et blocs de contenu, slide 25; JAM-327): a
 * white card of 32 px, « Garde de nuit à <Commune> » in taupe capitals, then
 * one line for each fact with one of Surya's icons in taupe: the locality,
 * the night, the children and their feeding, the rate. No shadow. An urgent
 * request carries a butter-yellow mark, never red (D-24). The family's card
 * adds its status, its answers and a filled sage capsule to the request; a
 * professional's card shows when it was published, a request sent to her in
 * priority (butter yellow too, D-71), her rate as the DA's price line under a
 * label that says it is her own (JAM-307), and her answer's buttons below. It
 * never shows anything about the family (D-15): its props hold only the card
 * columns. A white card sits on a sage or pearl zone (`CardField`).
 */

const t = words(demandes)
const r = words(reservations)

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
  priority = false,
  rate,
  extraHourRate,
  rateLabel,
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
  /** The professional's view: her rate for each extra hour, « 15 € par heure supplémentaire » (profil-tarifs). */
  extraHourRate?: number | null
  /**
   * The professional's view of a family's request: the line above her rates that
   * says they are her own, shown to the family when she answers (JAM-307).
   */
  rateLabel?: string
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
    <article className="flex h-full min-w-0 flex-col gap-4 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-10">
      {priority || request.urgent || status ? (
        <div className="flex flex-wrap items-center gap-2">
          {priority ? <Mark className="bg-beurre">{r.professionnelle.prioritaire}</Mark> : null}
          {request.urgent ? <Mark className="bg-beurre">{t.carte.urgente}</Mark> : null}
          {status ? (
            <Mark className="border border-solid border-taupe bg-blanc">{t.statuts[status]}</Mark>
          ) : null}
        </div>
      ) : null}
      <h2 className="font-display text-intro text-balance text-taupe">
        {cardTitle(request.communeIns, request.locality)}
      </h2>
      <ul className="flex flex-col gap-3">
        <Fact icon={LieuIcon}>{placeLine(request.postcode, request.locality)}</Fact>
        <Fact icon={CalendrierIcon}>
          <span className="font-semibold">
            {nightLine(request.nightDate, request.startTime, request.extraHours)}
          </span>
        </Fact>
        <Fact icon={BebeIcon}>
          {childrenLine(request.childAges)}
        </Fact>
        {/* A request published before the field has no feeding. */}
        {request.feedings.length > 0 ? <Fact icon={BiberonIcon}>{feedingLine(request.feedings)}</Fact> : null}
        <RateFact rate={rate} extraHourRate={extraHourRate} label={rateLabel} />
      </ul>
      {showPublished ? (
        <p className="text-legende">{fill(t.carte.publiee, { date: published })}</p>
      ) : null}
      {note ? <p className="text-corps font-semibold">{note}</p> : null}
      {href ? (
        <Button asChild variant="sauge" className="mt-auto self-start">
          <Link href={href}>{t.boutons.voir}</Link>
        </Button>
      ) : null}
      {/* A long answer button wraps inside the card on a phone, in place of pushing the page sideways. */}
      {footer ? (
        <div className="mt-auto flex flex-wrap gap-3 pt-2 [&_button]:h-auto [&_button]:max-w-full [&_button]:py-3 [&_button]:whitespace-normal">
          {footer}
        </div>
      ) : null}
    </article>
  )
}

/** One fact of the card: an icon of 24 px in taupe, then its line. */
function Fact({
  icon: Icon,
  children,
}: {
  icon: IconComponent
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 text-corps">
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-taupe" />
      <span className="min-w-0">{children}</span>
    </li>
  )
}

/**
 * The professional's rate as the DA's price line: the euro icon, the label that
 * says whose rate it is (JAM-307), the night's rate and the extra hour's. The
 * request card and the regular request's card share it (JAM-344). Nothing
 * without a rate.
 */
function RateFact({
  rate,
  extraHourRate,
  label,
}: {
  rate?: number | null
  extraHourRate?: number | null
  label?: string
}) {
  if (!rate) return null
  return (
    <Fact icon={EuroIcon}>
      {label ? <span className="block text-legende">{label}</span> : null}
      <span className="block font-semibold text-sauge">{rateLine(rate)}</span>
      {extraHourRate ? (
        <span className="block font-semibold text-sauge">{extraHourLine(extraHourRate)}</span>
      ) : null}
    </Fact>
  )
}

export { Fact, Mark, RateFact, RequestCard }
