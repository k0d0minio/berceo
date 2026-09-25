"use client"

import * as React from "react"
import { useTransition } from "react"

import { markHandledAction } from "@/app/(portail)/admin/signalements/actions"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { admin } from "@/content/admin"
import { words } from "@/content/locale"

/*
 * « Marquer comme traité » (D-139), behind its confirmation (D-24: green to
 * mark, red to leave it). Not reversible; a report another founder marked
 * first says so rather than change.
 */
function MarkHandledButton({ bookingId }: { bookingId: string }) {
  const t = words(admin).signalements
  const [pending, start] = useTransition()
  const [error, setError] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      <ConfirmDialog
        trigger={
          <Button type="button" variant="raye" disabled={pending}>
            {t.marquer}
          </Button>
        }
        title={t.confirmation.titre}
        description={t.confirmation.description}
        action={{
          label: t.confirmation.oui,
          tone: "confirmation",
          onSelect: () =>
            start(async () => {
              const result = await markHandledAction(bookingId)
              setError(!result.ok)
            }),
        }}
        cancel={{ label: t.confirmation.non, tone: "sensible" }}
      />
      {error ? (
        <p role="status" className="max-w-xs text-legende text-encre-taupe">
          {t.erreur}
        </p>
      ) : null}
    </div>
  )
}

export { MarkHandledButton }
