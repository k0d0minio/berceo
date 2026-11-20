import { Mark } from "@/components/demandes/request-card"
import { fill, words } from "@/content/locale"
import { reservations } from "@/content/reservations"

/*
 * The adapted schedule on an answer, as the family reads it (JAM-306): the
 * mark « Horaire adapté », who proposes, then one line for each night with a
 * proposal: the start asked for, the start proposed and the new end. Under
 * them, what booking means and how to refuse: the family does not book the
 * answer. An answer with no proposal shows nothing, so it looks as it did
 * before. The mark is the request card's own butter-yellow mark.
 */

const h = words(reservations).famille.horaires

function AdaptedTimes({ prenom, lignes }: { prenom: string; lignes: readonly string[] }) {
  if (lignes.length === 0) return null
  return (
    <div className="flex flex-col gap-2 text-corps text-taupe">
      <Mark className="bg-beurre">{h.marque}</Mark>
      <p className="font-semibold">{fill(h.titre, { prenom })}</p>
      <ul className="flex flex-col gap-1">
        {lignes.map((ligne) => (
          <li key={ligne} className="font-semibold text-sauge">
            {ligne}
          </li>
        ))}
      </ul>
      <p className="text-legende">{fill(h.explication, { prenom })}</p>
    </div>
  )
}

export { AdaptedTimes }
