"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { demandes } from "@/content/demandes"
import { words } from "@/content/locale"

/*
 * Cancelling a request goes through the confirmation dialog (D-24): cancelling
 * is the sensitive answer (red), keeping it the confirming one (green). The
 * action is scoped to the family's own open request on the server.
 */
function CancelRequest({ onCancel }: { onCancel: () => Promise<void> }) {
  const t = words(demandes).annulation
  const [pending, startTransition] = useTransition()

  return (
    <ConfirmDialog
      trigger={
        <Button variant="raye" disabled={pending}>
          {t.bouton}
        </Button>
      }
      title={t.titre}
      description={t.description}
      action={{ label: t.oui, tone: "sensible", onSelect: () => startTransition(onCancel) }}
      cancel={{ label: t.non, tone: "confirmation" }}
    />
  )
}

export { CancelRequest }
