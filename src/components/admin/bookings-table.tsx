import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { gardes } from "@/content/gardes"
import { fill, words } from "@/content/locale"
import type { AdminBookingRow } from "@/lib/admin/lists"
import { adminUserPath } from "@/lib/admin/paths"
import { formatDate, formatTime } from "@/lib/demandes/format"
import { eurosFromCents } from "@/lib/paiements/rules"

/*
 * Every booking (back-office-admin): the night, the family and the
 * professional (opening their accounts, « Suspendu » beside a suspended one),
 * the rate, the fee and its status, and the garde's state by the clock.
 */
function BookingsTable({ rows }: { rows: AdminBookingRow[] }) {
  const a = words(admin)
  const t = a.reservations
  const p = a.paiements
  const etats = words(gardes).etats

  const person = (who: AdminBookingRow["family"]) => (
    <>
      <Link href={adminUserPath(who.id)} className="text-encre-sauge underline underline-offset-4">
        {who.name}
      </Link>
      {who.suspended ? <span className="block text-legende font-semibold">{t.suspendu}</span> : null}
    </>
  )

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.nuit}</TableHead>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.professionnelle}</TableHead>
            <TableHead>{t.colonnes.tarif}</TableHead>
            <TableHead>{t.colonnes.frais}</TableHead>
            <TableHead>{t.colonnes.etat}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {fill(a.demandes.nuit, { date: formatDate(row.nightDate), heure: formatTime(row.startTime) })}
              </TableCell>
              <TableCell>{person(row.family)}</TableCell>
              <TableCell>{person(row.professional)}</TableCell>
              <TableCell>{fill(p.montant, { montant: String(row.nightRateEur) })}</TableCell>
              <TableCell>
                {row.fee ? (
                  <>
                    {fill(p.montant, { montant: eurosFromCents(row.fee.amountCents) })}
                    <span className="block text-legende">{p.statuts[row.fee.status]}</span>
                  </>
                ) : (
                  t.sansFrais
                )}
              </TableCell>
              <TableCell>{etats[row.state]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { BookingsTable }
