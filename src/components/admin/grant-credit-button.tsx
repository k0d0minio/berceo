"use client"

import * as React from "react"
import { useTransition } from "react"

import { grantCreditAction } from "@/app/(portail)/admin/signalements/actions"
import { Button } from "@/components/ui/button"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { NOTE_MAX } from "@/lib/admin/rules"

import { ReasonDialog } from "./decision-panel"

/*
 * « Accorder un crédit » on a report (annulations-back-office): a confirmation
 * that asks for the founder's note first (green to grant, red to leave it,
 * D-24), then the server writes the credit of the fee, marks a litige handled
 * and writes the journal line. The note is checked here and again on the
 * server; the result is said under the button.
 */
function GrantCreditButton({ bookingId, family, amount }: { bookingId: string; family: string; amount: string }) {
  const a = words(admin)
  const t = a.signalements
  const [pending, start] = useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const grant = (note: string) =>
    start(async () => {
      const result = await grantCreditAction(bookingId, note)
      if (result.ok) setMessage(t.accordResultats.ok)
      else if (result.error === "motifRequis" || result.error === "motifLong") setMessage(a.note[result.error])
      else setMessage(t.accordResultats[result.error])
    })

  return (
    <div className="flex flex-col gap-2">
      <ReasonDialog
        trigger={
          <Button type="button" variant="raye" disabled={pending}>
            {t.accorder}
          </Button>
        }
        title={fill(t.accord.titre, { nom: family })}
        description={fill(t.accord.description, { montant: amount })}
        tone="confirmation"
        onConfirm={grant}
        labels={t.accord}
        max={NOTE_MAX}
        errors={a.note}
      />
      {message ? (
        <p role="status" className="max-w-xs text-legende text-encre-taupe">
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { GrantCreditButton }
