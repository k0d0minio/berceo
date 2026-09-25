import Link from "next/link"

import { FormMessage } from "@/components/auth/field"
import { avis } from "@/content/avis"
import { fill, words } from "@/content/locale"
import type { RatingSide } from "@/db/schema"
import { formatDate } from "@/lib/demandes/format"
import type { RatingTarget } from "@/lib/avis/ratings"
import { CRITERIA, rateRefusal, type RatingState } from "@/lib/avis/rules"
import { brusselsNow } from "@/lib/demandes/rules"

import { RatingForm } from "./rating-form"
import { GivenRating } from "./stars"

/*
 * The body of both sides' « Laisser un avis » page (avis-etoiles): the night,
 * then, in this order, the stars this side already gave (read-only), or the
 * reason there is no form, or the form with the double-blind line (D-116) and
 * the line saying an avis cannot be changed (D-117). The other side's rating
 * is never read here.
 */

/** The criteria labels of the side that rates, in the order of the scores. */
export function criteriaLabels(side: RatingSide): string[] {
  const labels = words(avis).criteres[side] as Record<string, string>
  return (CRITERIA[side] as readonly string[]).map((key) => labels[key])
}

function RatingScreen({
  side,
  target,
  thanked,
  action,
  backHref,
}: {
  side: RatingSide
  target: RatingTarget
  thanked: boolean
  action: (state: RatingState, form: FormData) => Promise<RatingState>
  backHref: string
}) {
  const t = words(avis)
  const f = t.formulaire
  const labels = criteriaLabels(side)
  const refusal = rateRefusal(
    { status: target.status, nightDate: target.nightDate, startTime: target.startTime },
    target.given !== null,
    new Date(),
  )
  const prenom = target.otherFirstName

  return (
    <>
      <p className="text-corps text-encre-taupe">{fill(f.nuit, { date: formatDate(target.nightDate) })}</p>
      {thanked && target.given ? <FormMessage>{f.merci}</FormMessage> : null}
      {target.given ? (
        <GivenRating
          labels={labels}
          scores={target.given.scores}
          date={formatDate(brusselsNow(target.given.createdAt).date)}
          className="max-w-2xl rounded-carte bg-perle px-6 py-8 md:px-10"
        />
      ) : refusal ? (
        <p className="max-w-2xl text-corps text-encre-taupe">{t.refus[refusal]}</p>
      ) : (
        <>
          <p className="max-w-2xl text-corps text-encre-taupe">{fill(f.publication, { prenom })}</p>
          <p className="max-w-2xl text-corps text-encre-taupe">{f.definitif}</p>
          <RatingForm action={action} labels={labels} />
        </>
      )}
      <Link href={backHref} className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4">
        {f.retour}
      </Link>
    </>
  )
}

export { RatingScreen }
