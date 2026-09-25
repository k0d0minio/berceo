import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import type { AdminReportRow } from "@/lib/admin/lists"
import { adminUserPath } from "@/lib/admin/paths"
import { formatDate, formatTime } from "@/lib/demandes/format"
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths"
import { eurosFromCents } from "@/lib/paiements/rules"

import { MarkHandledButton } from "./mark-handled-button"

const day = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })

/*
 * « Signalements » (D-139): every cancelled garde and reported absence,
 * newest first: when, the night, both people (opening their accounts), what
 * happened and on which side, the fee with the way to the refund (D-101,
 * unchanged), and the follow-up: « Marquer comme traité », or who did.
 */
function ReportsTable({ rows }: { rows: AdminReportRow[] }) {
  const a = words(admin)
  const t = a.signalements
  const p = a.paiements

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.date}</TableHead>
            <TableHead>{t.colonnes.nuit}</TableHead>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.professionnelle}</TableHead>
            <TableHead>{t.colonnes.signalement}</TableHead>
            <TableHead>{t.colonnes.frais}</TableHead>
            <TableHead>{t.colonnes.suivi}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="align-top">
              <TableCell>{day.format(row.cancelledAt)}</TableCell>
              <TableCell>
                {fill(a.demandes.nuit, { date: formatDate(row.nightDate), heure: formatTime(row.startTime) })}
              </TableCell>
              <TableCell>
                <Link href={adminUserPath(row.family.id)} className="text-encre-sauge underline underline-offset-4">
                  {row.family.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={adminUserPath(row.professional.id)} className="text-encre-sauge underline underline-offset-4">
                  {row.professional.name}
                </Link>
              </TableCell>
              <TableCell className="whitespace-normal">{t.types[row.kind][row.side]}</TableCell>
              <TableCell>
                {row.fee ? (
                  <>
                    {fill(p.montant, { montant: eurosFromCents(row.fee.amountCents) })}
                    <span className="block text-legende">{p.statuts[row.fee.status]}</span>
                    <Link href={ADMIN_PAYMENTS_PATH} className="block text-legende text-encre-sauge underline underline-offset-4">
                      {t.lienPaiements}
                    </Link>
                  </>
                ) : (
                  a.reservations.sansFrais
                )}
              </TableCell>
              <TableCell className="whitespace-normal">
                {row.handled ? (
                  fill(t.traite, { date: day.format(row.handled.at), nom: row.handled.by })
                ) : (
                  <MarkHandledButton bookingId={row.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { ReportsTable }
