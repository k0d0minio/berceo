import Link from "next/link"
import type * as React from "react"

import { NoteDisplay } from "@/components/avis/stars"
import { ProfessionalPhoto } from "@/components/reservations/professional-photo"
import { Button } from "@/components/ui/button"
import { favoris } from "@/content/favoris"
import { words } from "@/content/locale"
import { recherche } from "@/content/recherche"
import { reservations } from "@/content/reservations"
import type { Profession } from "@/db/schema"
import type { Note } from "@/lib/avis/ratings"
import { professionLabel } from "@/lib/reservations/format"
import { priorityPath, professionalProfilePath } from "@/lib/reservations/paths"
import { cn } from "@/lib/utils"

/*
 * A card of « Mes professionnelles » (favoris-liste): her photo, first name,
 * profession, « Profil vérifié par Berceo », her note and gardes count, then
 * « Voir le profil complet » and « Lui envoyer ma demande en priorité », with
 * the mark beside them (favoris-marquer). 32 px corners, flat white on pearl,
 * no shadow. A professional who is no longer validated, or whose account is
 * suspended, reads as unavailable: no « vérifié », no button, no mark, and no
 * link, since her profile and the priority request answer not found. A family
 * without a subscription sees the card with no button: the page shows the
 * invitation line once (abonnements-acces).
 */

const t = words(favoris).liste
const r = words(reservations)
const verifie = words(recherche).carte.verifie

function ProfessionalListCard({
  id,
  firstName,
  profession,
  photoId,
  note,
  available,
  actions,
  mark,
  className,
}: {
  id: string
  firstName: string
  profession: Profession | null
  photoId: string | null
  note: Note
  available: boolean
  /** Whether her subscription opens the full profile and the priority request. */
  actions: boolean
  mark?: React.ReactNode
  className?: string
}) {
  return (
    <article className={cn("flex min-w-0 flex-col gap-4 rounded-carte bg-blanc px-6 py-6 md:px-8", className)}>
      <div className="flex items-center gap-4">
        <ProfessionalPhoto photoId={photoId} prenom={firstName} className="size-20" />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-h3 font-bold break-words text-sauge">{firstName}</h3>
          <p className="text-corps text-taupe">{professionLabel(profession)}</p>
          {available ? <p className="text-legende font-semibold text-taupe">{verifie}</p> : null}
        </div>
      </div>
      <NoteDisplay note={note} />
      {!available ? (
        <p className="text-corps text-taupe">{t.indisponible}</p>
      ) : actions ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={priorityPath(id)}>{r.profil.priorite}</Link>
          </Button>
          <Button asChild variant="raye">
            <Link href={professionalProfilePath(id)}>{r.famille.voirProfil}</Link>
          </Button>
          {mark}
        </div>
      ) : null}
    </article>
  )
}

export { ProfessionalListCard }
