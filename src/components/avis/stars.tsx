import { avis } from "@/content/avis"
import { fill, words } from "@/content/locale"
import { MAX_SCORE, formatNote, type Scores } from "@/lib/avis/rules"
import type { Note } from "@/lib/avis/ratings"
import { cn } from "@/lib/utils"

/*
 * The stars (avis-etoiles, D-9, D-119): a filled star in the sage ink, an
 * empty one as its taupe-ink outline. No new colour, never red or green
 * (D-24), no shadow. `NoteDisplay` is a person's note wherever it shows, with
 * the value in text and the gardes count; `GivenRating` is the stars one side
 * gave on a garde, read-only, to that side only.
 */

const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z"

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5 shrink-0", filled ? "text-encre-sauge" : "text-encre-taupe", className)}
    >
      <path
        d={STAR_PATH}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Five stars filled to `value` (0 to 5, tenths included), for the eye only. */
function StarRow({ value, className }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, (value / MAX_SCORE) * 100))
  return (
    <span className={cn("relative inline-flex", className)} aria-hidden="true">
      <span className="flex gap-0.5">
        {Array.from({ length: MAX_SCORE }, (_, i) => (
          <Star key={i} filled={false} />
        ))}
      </span>
      <span className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden" style={{ width: `${percent}%` }}>
        {Array.from({ length: MAX_SCORE }, (_, i) => (
          <Star key={i} filled />
        ))}
      </span>
    </span>
  )
}

function gardesLine(gardes: number): string | null {
  const t = words(avis).note
  if (gardes <= 0) return null
  return gardes === 1 ? t.garde : fill(t.gardes, { n: String(gardes) })
}

/** A person's note (D-119): the stars and the value, or « Pas encore de note »; the gardes count, hidden at zero. */
function NoteDisplay({ note, label, className }: { note: Note; label?: string; className?: string }) {
  const t = words(avis).note
  const gardes = gardesLine(note.gardes)
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-corps text-encre-taupe", className)}>
      {label ? <span className="font-semibold">{label}</span> : null}
      {note.note === null ? (
        <span>{t.aucune}</span>
      ) : (
        <span role="img" aria-label={fill(t.accessible, { note: formatNote(note.note) })} className="inline-flex items-center gap-2">
          <StarRow value={note.note} />
          <span aria-hidden="true" className="font-semibold">
            {formatNote(note.note)}
          </span>
        </span>
      )}
      {gardes ? <span>{gardes}</span> : null}
    </div>
  )
}

/** One criterion's whole stars as text for screen readers, « 3 étoiles sur 5 ». */
function starsText(n: number): string {
  const t = words(avis).formulaire
  return fill(n === 1 ? t.etoile : t.etoiles, { n: String(n) })
}

/** The stars this side gave on a garde, criterion by criterion, read-only (D-117). */
function GivenRating({
  labels,
  scores,
  date,
  className,
}: {
  labels: readonly string[]
  scores: Scores
  date: string
  className?: string
}) {
  const t = words(avis).donne
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="font-display text-h3 text-encre-sauge">{t.titre}</h2>
      <p className="text-legende text-encre-taupe">{fill(t.date, { date })}</p>
      <dl className="flex flex-col gap-2">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-wrap items-center justify-between gap-x-4">
            <dt className="text-corps font-semibold text-encre-taupe">{label}</dt>
            <dd role="img" aria-label={starsText(scores[i])}>
              <StarRow value={scores[i]} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Her own note on her home (D-121): the aggregate and the gardes count, never a single rating. */
function OwnNote({ note, className }: { note: Note; className?: string }) {
  const t = words(avis).note
  return (
    <section className={cn("flex max-w-2xl flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8", className)}>
      <h2 className="font-display text-h3 text-encre-sauge">{t.vous}</h2>
      <NoteDisplay note={note} />
      <p className="text-legende text-encre-taupe">{t.explication}</p>
    </section>
  )
}

export { GivenRating, NoteDisplay, OwnNote, Star, StarRow, starsText }
