"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"

/*
 * Removing one of her files goes through the confirmation dialog (JAM-343, the
 * deck's slide 22): removing is the sensitive answer (red), keeping the file
 * the confirming one (green). Only the red answer calls `onRemove`. The green
 * answer and Escape close the dialog and remove nothing.
 *
 * While the slot is busy the trigger stays focusable (`aria-disabled`, not
 * `disabled`), so the dialog can give focus back to it when it closes. A press
 * on it then opens nothing.
 */
function RemoveFile({
  fileName,
  onRemove,
  busy = false,
  disabled = false,
}: {
  fileName: string
  onRemove: () => void
  /** The slot is sending or removing a file. */
  busy?: boolean
  /** The file is locked: nothing can be removed. */
  disabled?: boolean
}) {
  const t = words(professionnelle).justificatifs

  return (
    <ConfirmDialog
      trigger={
        <button
          type="button"
          disabled={disabled}
          aria-disabled={busy || undefined}
          onClick={(event) => {
            if (busy) event.preventDefault()
          }}
          className="text-sauge underline disabled:opacity-50 aria-disabled:opacity-50"
        >
          {t.retirer}
        </button>
      }
      title={t.retrait.titre}
      description={fill(t.retrait.description, { fichier: fileName })}
      action={{ label: t.retrait.confirmer, tone: "sensible", onSelect: onRemove }}
      cancel={{ label: t.retrait.annuler, tone: "confirmation" }}
    />
  )
}

export { RemoveFile }
