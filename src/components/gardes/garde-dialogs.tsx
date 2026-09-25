"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { gardes } from "@/content/gardes"
import { words } from "@/content/locale"

/*
 * The three acts on a garde (cycle-de-garde-et-annulation), each through the
 * confirmation dialog (D-24). Cancelling (D-105) and reporting an absence
 * (D-106) are the sensitive answer (red), keeping the garde the confirming
 * one (green); republishing (D-107) is the confirming answer (green),
 * declining it the other (red). The page shows each only when its rule allows
 * it; the server holds the rule again.
 */

type Act = () => Promise<void>

function CancelGarde({ description, onCancel }: { description: string; onCancel: Act }) {
  const t = words(gardes).annulation
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
      action={{ label: t.oui, tone: "sensible", onSelect: () => startTransition(onCancel) }}
      cancel={{ label: t.non, tone: "confirmation" }}
    />
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
