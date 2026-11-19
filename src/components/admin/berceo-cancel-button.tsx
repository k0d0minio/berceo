"use client"

import * as React from "react"
import { useTransition } from "react"

import { cancelForBerceoAction } from "@/app/(portail)/admin/reservations/actions"
import { Button } from "@/components/ui/button"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { NOTE_MAX } from "@/lib/admin/rules"

import { ReasonDialog } from "./decision-panel"

/*
 * « Annuler la garde » for Berceo (annulations-back-office), on « Réservations »
 * and on an account's gardes: a confirmation that asks for the founder's note
 * first (red to cancel, green to keep the garde, D-24). The server cancels a
 * confirmed garde whose night has not ended, turns the paid fee into the
 * family's credit, writes the journal line, and tells both sides. The result
 * is said under the button.
 */
function BerceoCancelButton({
  bookingId,
  date,
  family,
  professional,
}: {
  bookingId: string
  /** « 30/09/2026 ». */
  date: string
  family: string
  professional: string
}) {
  const a = words(admin)
  const t = a.reservations
  const [pending, start] = useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const cancel = (note: string) =>
    start(async () => {
      const result = await cancelForBerceoAction(bookingId, note)
      if (result.ok) setMessage(t.annulationResultats.ok)
      else if (result.error === "motifRequis" || result.error === "motifLong") setMessage(a.note[result.error])
      else setMessage(t.annulationResultats[result.error])
    })

  return (
    <div className="flex flex-col gap-2">
      <ReasonDialog
        trigger={
          <Button type="button" variant="raye" disabled={pending}>
            {t.annuler}
          </Button>
        }
        title={fill(t.annulation.titre, { date })}
        description={fill(t.annulation.description, { famille: family, professionnelle: professional })}
        tone="sensible"
        onConfirm={cancel}
        labels={t.annulation}
        max={NOTE_MAX}
        errors={a.note}
      />
      {message ? (
        <p role="status" className="max-w-xs text-legende text-taupe">
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { BerceoCancelButton }
