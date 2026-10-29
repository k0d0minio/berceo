"use client"

import * as React from "react"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { gardes } from "@/content/gardes"
import { words } from "@/content/locale"
import type { BookingSide, CancellationReason } from "@/db/schema"
import { CANCELLATION_REASONS } from "@/lib/gardes/rules"

/*
 * The three acts on a garde (cycle-de-garde-et-annulation), each through the
 * confirmation dialog (D-24). Cancelling (D-105) and reporting an absence
 * (D-106) are the sensitive answer (red), keeping the garde the confirming
 * one (green); republishing (D-107) is the confirming answer (green),
 * declining it the other (red). The page shows each only when its rule allows
 * it; the server holds the rule again.
 *
 * Cancelling asks one reason from the side's list (annulations-delai-et-motif,
 * D-20: no free text). Without one, the dialog stays open and says so in red
 * (onboarding-retour-1); the server checks the reason again.
 */

type Act = () => Promise<void>

function CancelGarde({
  side,
  description,
  onCancel,
}: {
  side: BookingSide
  description: string
  onCancel: (reason: CancellationReason) => Promise<void>
}) {
  const g = words(gardes)
  const t = g.annulation
  const id = React.useId()
  const [pending, startTransition] = useTransition()
  const [reason, setReason] = React.useState<CancellationReason | null>(null)
  const [missing, setMissing] = React.useState(false)
  const reasons: readonly CancellationReason[] = CANCELLATION_REASONS[side]

  return (
    <ConfirmDialog
      trigger={
        <Button variant="raye" disabled={pending}>
          {t.bouton}
        </Button>
      }
      title={t.titre}
      description={description}
      onOpenChange={(open) => {
        if (!open) {
          setReason(null)
          setMissing(false)
        }
      }}
      action={{
        label: t.oui,
        tone: "sensible",
        onSelect: (event) => {
          if (!reason) {
            event.preventDefault()
            setMissing(true)
            return
          }
          startTransition(() => onCancel(reason))
        },
      }}
      cancel={{ label: t.non, tone: "confirmation" }}
    >
      <fieldset className="flex flex-col gap-2" aria-describedby={missing ? `${id}-erreur` : undefined}>
        <legend className="mb-2 text-corps font-semibold text-encre-taupe">{t.motif}</legend>
        {reasons.map((key) => (
          <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-encre-taupe">
            <input
              type="radio"
              name={`${id}-motif`}
              value={key}
              checked={reason === key}
              onChange={() => {
                setReason(key)
                setMissing(false)
              }}
              className="size-5 shrink-0 accent-sauge"
            />
            {g.motifs[key]}
          </label>
        ))}
        {missing ? (
          <p id={`${id}-erreur`} role="alert" className="px-2 text-legende font-semibold text-destructive">
            {t.motifRequis}
          </p>
        ) : null}
      </fieldset>
    </ConfirmDialog>
  )
}

function ReportAbsence({ description, onReport }: { description: string; onReport: Act }) {
  const t = words(gardes).absence
  const [pending, startTransition] = useTransition()

  return (
    <ConfirmDialog
      trigger={
        <Button variant="raye" disabled={pending}>
          {t.bouton}
        </Button>
      }
      title={t.titre}
      description={description}
      action={{ label: t.oui, tone: "sensible", onSelect: () => startTransition(onReport) }}
      cancel={{ label: t.non, tone: "confirmation" }}
    />
  )
}

function RepublishGarde({ onRepublish }: { onRepublish: Act }) {
  const t = words(gardes).republication
  const [pending, startTransition] = useTransition()

  return (
    <ConfirmDialog
      trigger={<Button disabled={pending}>{t.bouton}</Button>}
      title={t.titre}
      description={`${t.description} ${t.confirmation}`}
      action={{ label: t.oui, tone: "confirmation", onSelect: () => startTransition(onRepublish) }}
      cancel={{ label: t.non, tone: "sensible" }}
    />
  )
}

export { CancelGarde, ReportAbsence, RepublishGarde }
