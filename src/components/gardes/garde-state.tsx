import { gardes } from "@/content/gardes"
import { words } from "@/content/locale"
import type { GardeState } from "@/lib/gardes/rules"
import { cn } from "@/lib/utils"

/*
 * The garde's state as a mark (D-17, D-109): « À venir », « En cours »,
 * « Terminée », « Annulée ». The request card's status mark, flat, taupe ink on
 * white; en cours on butter yellow, the DA's only accent, never red or green
 * (D-24).
 */
function GardeStateMark({ state, className }: { state: GardeState; className?: string }) {
  const t = words(gardes).etats
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-capsule border border-solid border-taupe px-3 py-1 text-legende font-semibold text-encre-taupe",
        state === "en_cours" ? "bg-beurre" : "bg-blanc",
        className
      )}
    >
      {t[state]}
    </span>
  )
}

export { GardeStateMark }
