import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { adminUserPath } from "@/lib/admin/paths"
import type { AdminCredit } from "@/lib/credits/credits"
import { formatDate } from "@/lib/demandes/format"
import { brusselsNow } from "@/lib/demandes/rules"
import { eurosFromCents } from "@/lib/paiements/rules"

const day = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })

/*
 * « Crédits » (annulations-back-office): every Berceo credit, newest first:
 * when it was issued, the family (opening her account), the amount, its
 * origin with the founder and her note for a credit offered by hand, the
 * garde it comes from, its expiry, what was spent of it, and its state at
 * the moment of the read.
 */
function CreditTable({ rows }: { rows: AdminCredit[] }) {
  const a = words(admin)
  const t = a.creditsBerceo
  const p = a.paiements
  const euros = (cents: number) => fill(p.montant, { montant: eurosFromCents(cents) })

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.date}</TableHead>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.montant}</TableHead>
            <TableHead>{t.colonnes.origine}</TableHead>
            <TableHead>{t.colonnes.garde}</TableHead>
            <TableHead>{t.colonnes.expiration}</TableHead>
            <TableHead>{t.colonnes.utilise}</TableHead>
            <TableHead>{t.colonnes.etat}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="align-top">
              <TableCell>{day.format(row.issuedAt)}</TableCell>
              <TableCell>
                {row.family ? (
                  <Link href={adminUserPath(row.family.id)} className="text-encre-sauge underline underline-offset-4">
                    {row.family.name}
                  </Link>
                ) : (
                  t.compteSupprime
                )}
              </TableCell>
              <TableCell>{euros(row.amountCents)}</TableCell>
              <TableCell className="whitespace-normal">
                {t.origines[row.origin]}
                {row.origin === "geste_berceo" && row.note ? (
                  <span className="block max-w-xs text-legende">
                    {fill(t.offertPar, { nom: row.grantedBy ?? p.inconnu, note: row.note })}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>{row.nightDate ? formatDate(row.nightDate) : t.sansGarde}</TableCell>
              <TableCell>{formatDate(brusselsNow(row.expiresAt).date)}</TableCell>
              <TableCell>{euros(row.spentCents)}</TableCell>
              <TableCell>{t.etats[row.state]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { CreditTable }
