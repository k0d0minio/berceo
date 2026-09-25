import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { cardTitle, formatDate } from "@/lib/demandes/format"
import type { AdminRating } from "@/lib/avis/ratings"
import { formatNote, ratingMean } from "@/lib/avis/rules"

import { criteriaLabels } from "./criteria"

const moment = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })

/*
 * Every rating, newest first (avis-etoiles, G-03, D-118): when it was given,
 * the garde, who rated whom with both full names and roles, the four
 * criteria with their scores, the mean, and whether it is published yet
 * (D-116) or counts nowhere because the garde was cancelled after it (D-122).
 * Read-only, and only the founders see a single rating.
 */
function RatingsTable({ rows }: { rows: AdminRating[] }) {
  const t = words(admin).avis

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.donne}</TableHead>
            <TableHead>{t.colonnes.garde}</TableHead>
            <TableHead>{t.colonnes.par}</TableHead>
            <TableHead>{t.colonnes.sur}</TableHead>
            <TableHead>{t.colonnes.notes}</TableHead>
            <TableHead>{t.colonnes.moyenne}</TableHead>
            <TableHead>{t.colonnes.etat}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const ratedSide = row.raterSide === "famille" ? "professionnelle" : "famille"
            const labels = criteriaLabels(row.raterSide)
            return (
              <TableRow key={row.id}>
                <TableCell>{moment.format(row.createdAt)}</TableCell>
                <TableCell>
                  {fill(t.nuit, { date: formatDate(row.nightDate), commune: cardTitle(row.communeIns, row.locality) })}
                </TableCell>
                <TableCell>
                  {fill(t.personne, { nom: `${row.rater.firstName} ${row.rater.lastName}`, role: t.roles[row.raterSide] })}
                </TableCell>
                <TableCell>
                  {fill(t.personne, { nom: `${row.rated.firstName} ${row.rated.lastName}`, role: t.roles[ratedSide] })}
                </TableCell>
                <TableCell>
                  <ul className="flex flex-col gap-1">
                    {labels.map((label, i) => (
                      <li key={label}>{fill(t.critere, { critere: label, n: String(row.scores[i]) })}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{formatNote(Math.round(ratingMean(row.scores) * 10) / 10)}</TableCell>
                <TableCell>
                  {row.gardeAnnulee ? t.etats.annulee : row.published ? t.etats.publiee : t.etats.enAttente}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { RatingsTable }
