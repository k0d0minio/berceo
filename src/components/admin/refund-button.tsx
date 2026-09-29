"use client"

import * as React from "react"
import { useTransition } from "react"

import { refundPaymentAction } from "@/app/(portail)/admin/paiements/actions"
import { Button } from "@/components/ui/button"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"

import { ReasonDialog } from "./decision-panel"

/*
 * « Rembourser les frais » on a paid fee (D-101): a confirmation dialog that
 * asks for the reason first (green to refund, red to leave it, D-24), then
 * the server refunds the whole fee and writes the journal line. The reason is
 * checked here and again on the server; the result is said under the button.
 * On a fee the professional's cancellation left unrefunded, the dialog says
 * so instead of « La garde n'est pas annulée » (D-164).
 */
function RefundButton({
  paymentId,
  family,
  amount,
  toRefund = false,
}: {
  paymentId: string
  family: string
  amount: string
  toRefund?: boolean
}) {
  const t = words(admin)
  const p = t.paiements
  const [pending, start] = useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const refund = (reason: string) =>
    start(async () => {
      const result = await refundPaymentAction(paymentId, reason)
      if (result.ok) {
        setMessage(result.status === "remboursee" ? p.resultats.rembourses : p.resultats.echec)
      } else if (result.error === "motifRequis" || result.error === "motifLong") {
        setMessage(t.decisions.erreurs[result.error])
      } else {
        setMessage(p.resultats[result.error])
      }
    })

  return (
    <div className="flex flex-col gap-2">
      <ReasonDialog
        trigger={
          <Button type="button" variant="raye" disabled={pending}>
            {p.rembourser}
          </Button>
        }
        title={fill(p.confirmation.titre, { nom: family })}
        description={fill(toRefund ? p.confirmation.descriptionARembourser : p.confirmation.description, {
          montant: amount,
        })}
        tone="confirmation"
        onConfirm={refund}
        labels={p.confirmation}
      />
      {message ? (
        <p role="status" className="max-w-xs text-legende text-encre-taupe">
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { RefundButton }
