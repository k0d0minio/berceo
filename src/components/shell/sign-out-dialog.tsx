"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { words } from "@/content/locale"
import { portal } from "@/content/portal"

/*
 * The DA's own confirmation example: leaving is the sensitive answer (red),
 * staying the confirming one (green). In a space, `onSignOut` is the sign-out
 * server action; on the design-system page it is absent and only closes.
 */
function SignOutDialog({
  variant = "blanc",
  onSignOut,
}: {
  variant?: "blanc" | "raye" | "sauge" | "taupe"
  onSignOut?: () => void
}) {
  const t = words(portal).signOut

  return (
    <ConfirmDialog
      trigger={<Button variant={variant}>{t.trigger}</Button>}
      title={t.title}
      description={t.description}
      action={{ label: t.confirm, tone: "sensible", onSelect: onSignOut }}
      cancel={{ label: t.cancel, tone: "confirmation" }}
    />
  )
}

export { SignOutDialog }
