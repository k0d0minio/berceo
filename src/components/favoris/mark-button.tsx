"use client"

import { HeartIcon } from "@/components/icons"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { favoris } from "@/content/favoris"
import { fill, words } from "@/content/locale"
import { cn } from "@/lib/utils"

/*
 * « Ajouter à mes professionnelles » and « Retirer de mes professionnelles »
 * (favoris-marquer): one form, one button, a filled heart (JAM-300) that
 * turns sage once she is marked. On a search card (`compact`) the heart stands alone in a
 * square capsule, named with her first name, since a card is narrow and a
 * list repeats the words. The server action holds every rule again.
 */

const t = words(favoris)

function Submit({ marked, prenom, compact }: { marked: boolean; prenom: string; compact: boolean }) {
  const { pending } = useFormStatus()
  const label = fill(marked ? t.retirerNom : t.ajouterNom, { prenom })
  return (
    <Button
      type="submit"
      variant="raye"
      size={compact ? "icon" : "default"}
      disabled={pending}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      className="w-fit"
    >
      <HeartIcon aria-hidden="true" className={cn(marked && "text-sauge")} />
      {compact ? null : marked ? t.retirer : t.ajouter}
    </Button>
  )
}

function MarkButton({
  marked,
  prenom,
  compact = false,
  onToggle,
}: {
  marked: boolean
  prenom: string
  compact?: boolean
  onToggle: () => Promise<void>
}) {
  return (
    <form action={onToggle}>
      <Submit marked={marked} prenom={prenom} compact={compact} />
    </form>
  )
}

export { MarkButton }
