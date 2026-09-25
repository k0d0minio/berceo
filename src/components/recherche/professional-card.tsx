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
import { zoneLine } from "@/lib/recherche/rules"
import { cn } from "@/lib/utils"

/*
 * The DA's profile card, as a signed-in family reads it in the search (D-11):
 * photo, first name, profession, « Profil vérifié par Berceo », her zone with
 * the searched commune first, her note and gardes count, and her next
 * indicative nights. The whole card is one link to her full profile, named by
 * her first name. 32 px corners, flat white on pearl, no shadow.
 */

const t = words(recherche).carte

type CardProps = {
  href: string
  firstName: string
  profession: Profession | null
  zone: readonly string[]
  note: Note
  className?: string
}

function CardFrame({
  href,
  firstName,
  children,
  className,
}: {
  href: string
  firstName: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label={fill(t.voirProfil, { prenom: firstName })}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-carte bg-blanc px-6 py-6 md:px-8",
        className
      )}
    >
      {children}
    </Link>
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

/** A signed-in family's card: with her photo and her next nights. */
function ProfessionalCard({
  photoId,
  nights,
  ...props
}: CardProps & { photoId: string | null; nights: readonly string[] }) {
  return (
    <CardFrame href={props.href} firstName={props.firstName} className={props.className}>
      <div className="flex items-center gap-4">
        <ProfessionalPhoto photoId={photoId} prenom={props.firstName} className="size-20" />
        <Identity firstName={props.firstName} profession={props.profession} />
      </div>
      <p className="text-corps break-words text-encre-taupe">{zoneLine(props.zone)}</p>
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
      <p className="text-corps break-words text-encre-taupe">{zoneLine(props.zone)}</p>
      <NoteDisplay note={props.note} />
    </CardFrame>
  )
}

export { ProfessionalCard, TeaserCard }
