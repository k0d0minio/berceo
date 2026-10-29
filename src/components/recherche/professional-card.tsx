import Link from "next/link"
import type * as React from "react"

import { NoteDisplay } from "@/components/avis/stars"
import { ProfessionalPhoto } from "@/components/reservations/professional-photo"
import { fill, words } from "@/content/locale"
import { recherche } from "@/content/recherche"
import type { Note } from "@/lib/avis/ratings"
import { nightName } from "@/lib/disponibilites/format"
import type { Profession } from "@/db/schema"
import { professionLabel } from "@/lib/reservations/format"
import { reachLine, zoneLine } from "@/lib/recherche/rules"
import { cn } from "@/lib/utils"

/*
 * The DA's profile card, as a signed-in family reads it in the search (D-11):
 * photo, first name, profession, « Profil vérifié par Berceo », her zone with
 * the searched commune first and her radius (zone-rayon-lecture), her note and gardes count, and her next
 * indicative nights. The whole card is one link to her full profile, named by
 * her first name. 32 px corners, flat white on pearl, no shadow. A subscribed
 * family's card carries the mark « mes professionnelles » at its foot
 * (favoris-marquer), outside the link: a button never sits inside a link.
 */

const t = words(recherche).carte

type CardProps = {
  href: string
  firstName: string
  profession: Profession | null
  zone: readonly string[]
  /** Her radius around her communes, and « Toute la Belgique ». */
  reach: { zoneRadiusKm: number; zoneWholeBelgium: boolean }
  note: Note
  className?: string
}

const CARD = "flex min-w-0 flex-col gap-4 rounded-carte bg-blanc px-6 py-6 md:px-8"

function CardFrame({
  href,
  firstName,
  children,
  footer,
  className,
}: {
  href: string
  firstName: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  const label = fill(t.voirProfil, { prenom: firstName })
  if (!footer) {
    return (
      <Link href={href} aria-label={label} className={cn(CARD, className)}>
        {children}
      </Link>
    )
  }
  // The card's look moves to the frame. The link keeps the content, the foot holds the button.
  return (
    <div className={cn(CARD, className)}>
      <Link href={href} aria-label={label} className="flex min-w-0 flex-1 flex-col gap-4">
        {children}
      </Link>
      <div className="flex justify-end">{footer}</div>
    </div>
  )
}

function Identity({ firstName, profession }: { firstName: string; profession: Profession | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="font-display text-h3 break-words text-encre-sauge uppercase">{firstName}</p>
      <p className="text-corps text-encre-taupe">{professionLabel(profession)}</p>
      <p className="text-legende font-semibold text-encre-taupe">{t.verifie}</p>
    </div>
  )
}

/** Her communes, then her radius when she has one: a commune listed can be one her radius reaches. */
function Zone({ zone, reach }: Pick<CardProps, "zone" | "reach">) {
  const line = reachLine(reach)
  return (
    <div className="flex flex-col gap-1">
      <p className="text-corps break-words text-encre-taupe">{zoneLine(zone)}</p>
      {line ? <p className="text-corps break-words text-encre-taupe">{line}</p> : null}
    </div>
  )
}

/** A signed-in family's card: with her photo and her next nights, and the mark when her subscription opens it. */
function ProfessionalCard({
  photoId,
  nights,
  mark,
  ...props
}: CardProps & { photoId: string | null; nights: readonly string[]; mark?: React.ReactNode }) {
  return (
    <CardFrame href={props.href} firstName={props.firstName} footer={mark} className={props.className}>
      <div className="flex items-center gap-4">
        <ProfessionalPhoto photoId={photoId} prenom={props.firstName} className="size-20" />
        <Identity firstName={props.firstName} profession={props.profession} />
      </div>
      <Zone zone={props.zone} reach={props.reach} />
      <NoteDisplay note={props.note} />
      <div className="flex flex-col gap-1">
        <p className="text-legende font-semibold text-encre-taupe">{t.prochaines}</p>
        {nights.length === 0 ? (
          <p className="text-corps text-encre-taupe">{t.aucuneNuit}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {nights.slice(0, 3).map((night) => (
              <li key={night} className="text-corps text-encre-taupe">
                {nightName(night)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardFrame>
  )
}

/** A public teaser card (a commune page): no photo, no availability (D-126). */
function TeaserCard(props: CardProps) {
  return (
    <CardFrame href={props.href} firstName={props.firstName} className={props.className}>
      <Identity firstName={props.firstName} profession={props.profession} />
      <Zone zone={props.zone} reach={props.reach} />
      <NoteDisplay note={props.note} />
    </CardFrame>
  )
}

export { ProfessionalCard, TeaserCard }
