"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { words } from "@/content/locale"
import { reservations } from "@/content/reservations"

/*
 * « Republier ma demande » (D-70) goes through the confirmation dialog: the
 * waiting answers will be declined and the request offered again. Republishing
 * is the confirming answer (green), keeping the answers the other (red, D-24).
 */
function RepublishRequest({ onRepublish }: { onRepublish: () => Promise<void> }) {
  const t = words(reservations).republication
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
      action={{ label: t.oui, tone: "confirmation", onSelect: () => startTransition(onRepublish) }}
      cancel={{ label: t.non, tone: "sensible" }}
    />
  )
}

export { RepublishRequest }
