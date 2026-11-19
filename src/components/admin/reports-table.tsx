import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { gardes } from "@/content/gardes"
import { fill, words } from "@/content/locale"
import type { AdminReportRow } from "@/lib/admin/lists"
import { adminUserPath } from "@/lib/admin/paths"
import { canGrantCredit, delayVerdict, reportOutcome, type ReportFacts } from "@/lib/admin/rules"
import { formatDate, formatTime } from "@/lib/demandes/format"
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths"
import { eurosFromCents } from "@/lib/paiements/rules"

import { GrantCreditButton } from "./grant-credit-button"
import { MarkHandledButton } from "./mark-handled-button"

const day = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })

/*
 * « Signalements » (D-139): every cancelled garde and reported absence,
 * newest first: when, the night, both people (opening their accounts), what
 * happened and on which side, and « Litige » once the side reported absent
 * contested (annulations-table), the reason the cancelling side chose
 * (annulations-delai-et-motif) or the founders' note on a cancellation by
 * Berceo, the delay that applied (the hours before the start, and the line
 * of the table, annulations-back-office), the fee and what became of it, with
 * « Accorder un crédit » where the founders may grant one and the way to the
 * refund (D-101), and the follow-up: « Marquer comme traité », or who did.
 */
function ReportsTable({ rows }: { rows: AdminReportRow[] }) {
  const a = words(admin)
  const t = a.signalements
  const p = a.paiements
  const motifs = words(gardes).motifs

  const facts = (row: AdminReportRow): ReportFacts => ({
    side: row.side,
    kind: row.kind,
    disputed: row.disputedAt !== null,
    fee: row.fee?.status ?? null,
    creditOrigin: row.creditOrigin,
  })
  const delay = (row: AdminReportRow) => {
    if (row.hoursBefore === null) return t.sansDelai
    const hours = row.hoursBefore < 0 ? t.apresDebut : fill(t.heuresAvant, { n: String(row.hoursBefore) })
    const verdict = delayVerdict(facts(row))
    return verdict ? `${hours}, ${t.verdicts[verdict].toLowerCase()}` : hours
  }

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
            <TableHead>{t.colonnes.motif}</TableHead>
            <TableHead>{t.colonnes.delai}</TableHead>
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
              <TableCell className="whitespace-normal">
                {row.side === "berceo" ? t.types.annulation.berceo : t.types[row.kind][row.side]}
                {row.disputedAt ? (
                  <span className="block font-semibold">{fill(t.litige, { date: day.format(row.disputedAt) })}</span>
                ) : null}
              </TableCell>
              <TableCell className="whitespace-normal">
                {row.reason ? motifs[row.reason] : row.note ? fill(t.note, { note: row.note }) : t.sansMotif}
              </TableCell>
              <TableCell className="whitespace-normal">{delay(row)}</TableCell>
              <TableCell>
                {row.fee ? (
                  <>
                    {fill(p.montant, { montant: eurosFromCents(row.fee.amountCents) })}
                    <span className="block text-legende">{p.statuts[row.fee.status]}</span>
                    <span className="block text-legende font-semibold">{t.resultats[reportOutcome(facts(row))]}</span>
                    {canGrantCredit(facts(row)) ? (
                      <div className="mt-2">
                        <GrantCreditButton
                          bookingId={row.id}
                          family={row.family.name}
                          amount={fill(p.montant, { montant: eurosFromCents(row.fee.amountCents) })}
                        />
                      </div>
                    ) : null}
                    <Link href={ADMIN_PAYMENTS_PATH} className="block text-legende text-encre-sauge underline underline-offset-4">
                      {t.lienPaiements}
                    </Link>
                  </>
                ) : (
                  t.resultats[reportOutcome(facts(row))]
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
