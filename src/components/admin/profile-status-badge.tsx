import { admin } from "@/content/admin"
import { words } from "@/content/locale"
import type { ProfileStatus } from "@/db/schema"
import { cn } from "@/lib/utils"

/*
 * A professional's file status on the founders' pages: the file and the
 * account. The queue's capsule on pearl; a refused file in the DA's red, the
 * colour of the refusal itself (JAM-584, the client's round 2; JAM-300).
 */
function ProfileStatusBadge({ status }: { status: ProfileStatus }) {
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex w-fit rounded-capsule px-3 py-1 text-legende whitespace-nowrap",
        status === "refuse" ? "bg-rouge-confirmation font-semibold text-blanc" : "bg-perle text-taupe"
      )}
    >
      {words(admin).dossier.etats[status]}
    </span>
  )
}

export { ProfileStatusBadge }
