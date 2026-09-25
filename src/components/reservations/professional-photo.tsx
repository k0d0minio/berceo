import { fill, words } from "@/content/locale"
import { reservations } from "@/content/reservations"
import { cn } from "@/lib/utils"

/*
 * A validated professional's photo, as a family sees it: streamed by
 * /api/fichiers/[id], which serves a family her photo and nothing else (D-75).
 * Her first name's initial stands in when there is none.
 */
function ProfessionalPhoto({
  photoId,
  prenom,
  className,
}: {
  photoId: string | null
  prenom: string
  className?: string
}) {
  const base = cn("aspect-square shrink-0 rounded-full bg-perle object-cover", className)
  if (!photoId) {
    return (
      <span aria-hidden className={cn(base, "flex items-center justify-center font-display text-h3 text-sauge")}>
        {prenom.charAt(0).toUpperCase()}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a private file behind a session, not an optimisable asset
    <img
      src={`/api/fichiers/${photoId}`}
      alt={fill(words(reservations).famille.photo, { prenom })}
      className={base}
    />
  )
}

export { ProfessionalPhoto }
