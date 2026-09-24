"use client"

import { useTransition } from "react"

import { reopenFile } from "@/app/(portail)/espace/professionnelle/actions"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"

/*
 * On a validated file, a new profession or any change of documents needs the
 * founders to look again. This dialog says so before anything moves: the
 * profile is hidden until then, and she will confirm her declarations again.
 * Confirming reopens the file at step 2. Hiding the profile is the sensitive
 * answer (red), keeping it the confirming one (green), as in the sign-out
 * dialog (D-24).
 */
function ReopenDialog() {
  const t = words(professionnelle).reouverture
  const [pending, start] = useTransition()

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="raye" disabled={pending} className="self-start">
          {t.bouton}
        </Button>
      }
      title={t.titre}
      description={t.description}
      action={{ label: t.confirmer, tone: "sensible", onSelect: () => start(() => reopenFile()) }}
      cancel={{ label: t.annuler, tone: "confirmation" }}
    />
  )
}

export { ReopenDialog }
