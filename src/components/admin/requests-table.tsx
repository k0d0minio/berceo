import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import type { AdminRequestRow } from "@/lib/admin/lists"
import { adminUserPath } from "@/lib/admin/paths"
import { formatDate, formatTime, placeLine } from "@/lib/demandes/format"
import { displayStatus } from "@/lib/demandes/rules"

/*
 * Every care request (back-office-admin): the night, the commune, the family
 * (opening her account), the urgent flag, how many answered, and the state the
 * spaces show. On a phone the table scrolls inside its card.
 */
function RequestsTable({ rows, now }: { rows: AdminRequestRow[]; now: Date }) {
  const t = words(admin).demandes
  const statuts = words(demandes).statuts
  const r = words(admin).reservations

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.nuit}</TableHead>
            <TableHead>{t.colonnes.commune}</TableHead>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.reponses}</TableHead>
            <TableHead>{t.colonnes.etat}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {fill(t.nuit, { date: formatDate(row.nightDate), heure: formatTime(row.startTime) })}
                {row.urgent ? <span className="block text-legende font-semibold">{t.urgente}</span> : null}
              </TableCell>
              <TableCell>{placeLine(row.postcode, row.locality)}</TableCell>
              <TableCell>
                <Link href={adminUserPath(row.familyUserId)} className="text-encre-sauge underline underline-offset-4">
                  {row.family}
                </Link>
                {row.familySuspended ? <span className="block text-legende font-semibold">{r.suspendu}</span> : null}
              </TableCell>
              <TableCell>{row.answers}</TableCell>
              <TableCell>{statuts[displayStatus(row, now)]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { RequestsTable }
