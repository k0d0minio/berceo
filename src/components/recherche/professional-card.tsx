import Link from "next/link"
import type * as React from "react"

import { NoteDisplay } from "@/components/avis/stars"
import { CalendrierIcon, LieuIcon, OursonIcon, type IconComponent } from "@/components/berceo-icons"
import { CheckIcon } from "@/components/icons"
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
 * The DA's profile card (slide 25; JAM-327), as a signed-in family reads it
 * in the search (D-11): her round photo with the sage verification mark, her
 * first name in capitals, a taupe label with her profession and « Profil
 * vérifié par Berceo », then one line for each fact with one of Surya's icons
 * in taupe: her zone with the searched commune first and her radius
 * (zone-rayon-lecture), her note and gardes count, her next indicative
 * nights. The whole card is one link to her full profile, named by her first
 * name; the capsule « Voir le profil complet » at its foot is that link's
 * visible end. A white card of 32 px on a sage or pearl zone, no shadow. A
 * subscribed family's card carries the mark « mes professionnelles » at its
 * foot (favoris-marquer), outside the link: a button never sits inside a
 * link.
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

const CARD = "flex min-w-0 flex-col gap-5 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-8"

/* The deck's outlined sage capsule, drawn at the foot of the link it belongs to. */
const CAPSULE =
  "mt-auto inline-flex min-h-12 items-center justify-center self-center rounded-capsule border border-solid border-sauge px-7 text-bouton font-semibold text-sauge"

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
      <Link href={href} aria-label={label} className="flex min-w-0 flex-1 flex-col gap-5">
        {children}
      </Link>
      <div className="flex justify-end">{footer}</div>
    </div>
  )
}

function Identity({ firstName, profession }: { firstName: string; profession: Profession | null }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <p className="font-display text-intro break-words text-taupe">{firstName}</p>
      <div className="flex w-full flex-col rounded-xl bg-taupe px-4 py-2 text-blanc">
        <p className="text-corps font-semibold">{professionLabel(profession)}</p>
        <p className="text-legende">{t.verifie}</p>
      </div>
    </div>
  )
}

/** One fact of the card: an icon of 24 px in taupe, then its lines. */
function Fact({
  icon: Icon,
  children,
}: {
  icon: IconComponent
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-taupe" />
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  )
}

/** Her communes, then her radius when she has one: a commune listed can be one her radius reaches. */
function Zone({ zone, reach }: Pick<CardProps, "zone" | "reach">) {
  const line = reachLine(reach)
  return (
    <Fact icon={LieuIcon}>
      <p className="text-corps break-words">{zoneLine(zone)}</p>
      {line ? <p className="text-corps break-words">{line}</p> : null}
    </Fact>
  )
}

/** Her note and her gardes count. */
function Rating({ note }: { note: Note }) {
  return (
    <Fact icon={OursonIcon}>
      <NoteDisplay note={note} />
    </Fact>
  )
}

/** Her photo with the sage verification mark at its top right. */
function VerifiedPhoto({ photoId, firstName }: { photoId: string | null; firstName: string }) {
  return (
    <div className="relative self-center">
      <ProfessionalPhoto photoId={photoId} prenom={firstName} className="size-24" />
      <span
        aria-hidden
        className="absolute -top-1 -right-1 inline-flex size-7 items-center justify-center rounded-full bg-sauge text-blanc"
      >
        <CheckIcon className="size-4" />
      </span>
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
      <VerifiedPhoto photoId={photoId} firstName={props.firstName} />
      <Identity firstName={props.firstName} profession={props.profession} />
      <Zone zone={props.zone} reach={props.reach} />
      <Rating note={props.note} />
      <Fact icon={CalendrierIcon}>
        <p className="text-legende font-semibold">{t.prochaines}</p>
        {nights.length === 0 ? (
          <p className="text-corps">{t.aucuneNuit}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {nights.slice(0, 3).map((night) => (
              <li key={night} className="text-corps">
                {nightName(night)}
              </li>
            ))}
          </ul>
        )}
      </Fact>
      <span className={CAPSULE}>{t.voirComplet}</span>
    </CardFrame>
  )
}

/** A public teaser card (a commune page): no photo, no availability (D-126). */
function TeaserCard(props: CardProps) {
  return (
    <CardFrame href={props.href} firstName={props.firstName} className={props.className}>
      <Identity firstName={props.firstName} profession={props.profession} />
      <Zone zone={props.zone} reach={props.reach} />
      <Rating note={props.note} />
      <span className={CAPSULE}>{t.voirComplet}</span>
    </CardFrame>
  )
}

export { ProfessionalCard, TeaserCard }
