import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { formatDate, formatTime } from "@/lib/demandes/format"
import type { AbsenceRow } from "@/lib/gardes/gardes"
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths"
import { eurosFromCents } from "@/lib/paiements/rules"

const moment = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })

/*
 * Every reported absence, newest first (cycle-de-garde-et-annulation, D-106):
 * when it was reported, the night, both full names, the side recorded absent
 * (the other one reported it), and the fee with its status. Read-only: the
 * founders refund from « Paiements des frais de service » (D-101).
 */
function AbsencesTable({ rows }: { rows: AbsenceRow[] }) {
  const a = words(admin)
  const t = a.absences

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.signalee}</TableHead>
            <TableHead>{t.colonnes.nuit}</TableHead>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.professionnelle}</TableHead>
            <TableHead>{t.colonnes.absente}</TableHead>
            <TableHead>{t.colonnes.frais}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{moment.format(row.reportedAt)}</TableCell>
              <TableCell>{`${formatDate(row.nightDate)} ${formatTime(row.startTime)}`}</TableCell>
              <TableCell>{row.family}</TableCell>
              <TableCell>{row.professional}</TableCell>
              <TableCell>{t.cote[row.absent]}</TableCell>
              <TableCell>
                {row.fee ? (
                  <span className="flex flex-col gap-1">
                    <span>
                      {`${fill(a.paiements.montant, { montant: eurosFromCents(row.fee.amountCents) })}, ${a.paiements.statuts[row.fee.status]}`}
                    </span>
                    <Link href={ADMIN_PAYMENTS_PATH} className="font-semibold text-encre-sauge underline underline-offset-4">
                      {t.lienPaiements}
                    </Link>
                  </span>
                ) : (
                  t.sansFrais
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { AbsencesTable }
