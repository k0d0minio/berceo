import { avis } from "@/content/avis"
import { words } from "@/content/locale"
import type { RatingSide } from "@/db/schema"
import { CRITERIA } from "@/lib/avis/rules"

/** The criteria labels of the side that rates, in the order of the four scores (D-115). */
export function criteriaLabels(side: RatingSide): string[] {
  const labels = words(avis).criteres[side] as Record<string, string>
  return (CRITERIA[side] as readonly string[]).map((key) => labels[key])
}
