import { disponibilites } from "@/content/disponibilites"
import { words } from "@/content/locale"
import { nightName } from "@/lib/disponibilites/format"

/*
 * « Prochaines disponibilités », the block a family reads on a professional's
 * profile (D-12, D-80): her next marked nights, each as « Nuit du … au … »,
 * then the guide's caveat. With none marked, one line that she has not
 * indicated any night yet and can still be asked; the block never says she is
 * unavailable. It takes the dates from `nextAvailableNights`; the family-facing
 * pages that mount it come with candidature-et-reservation and
 * recherche-et-fiches-publiques (D-69). The DA's card: 32 px corners, flat
 * pearl, no shadow.
 */

const t = words(disponibilites).famille

function ProchainesDisponibilites({ nights }: { nights: readonly string[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
      <h3 className="font-display text-h3 text-sauge">{t.titre}</h3>
      {nights.length === 0 ? (
        <p className="text-corps text-taupe">{t.vide}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {nights.map((night) => (
              <li key={night} className="text-corps font-semibold text-taupe">
                {nightName(night)}
              </li>
            ))}
          </ul>
          <p className="text-legende text-taupe">{t.avertissement}</p>
        </>
      )}
    </section>
  )
}

export { ProchainesDisponibilites }
