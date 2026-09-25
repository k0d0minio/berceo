import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { formatDate } from "@/lib/demandes/format"
import type { AdminPayment } from "@/lib/paiements/payments"
import { effectiveStatus, eurosFromCents, isRefundable } from "@/lib/paiements/rules"

import { RefundButton } from "./refund-button"

const day = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })
const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })

/*
 * Every fee, newest first (D-93): when the Checkout opened, the family, the
 * professional, the night, the rate, the fee, the status (an open Checkout
 * past its expiry reads « Abandonnés », D-92), Stripe's PaymentIntent id and,
 * for a refund, its date and reason. A paid fee offers « Rembourser les
 * frais » (D-89); nothing else on this page changes a payment.
 */
function PaymentsTable({ rows, now }: { rows: AdminPayment[]; now: Date }) {
  const p = words(admin).paiements
  const euros = (cents: number) => fill(p.montant, { montant: eurosFromCents(cents) })

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{p.colonnes.date}</TableHead>
            <TableHead>{p.colonnes.famille}</TableHead>
            <TableHead>{p.colonnes.professionnelle}</TableHead>
            <TableHead>{p.colonnes.nuit}</TableHead>
            <TableHead>{p.colonnes.tarif}</TableHead>
            <TableHead>{p.colonnes.frais}</TableHead>
            <TableHead>{p.colonnes.statut}</TableHead>
            <TableHead>{p.colonnes.reference}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const status = effectiveStatus(row, now)
            const family = row.family ?? p.inconnu
            return (
              <TableRow key={row.id} className="align-top">
                <TableCell>{day.format(row.createdAt)}</TableCell>
                <TableCell>{family}</TableCell>
                <TableCell>{row.professional ?? p.inconnu}</TableCell>
                <TableCell>{formatDate(row.nightDate)}</TableCell>
                <TableCell>{fill(p.montant, { montant: String(row.nightRateEur) })}</TableCell>
                <TableCell>{euros(row.amountCents)}</TableCell>
                <TableCell className="whitespace-normal">
                  <span className="font-semibold">{p.statuts[status]}</span>
                  {row.refundedAt && row.refundReason ? (
                    <span className="block max-w-xs text-legende">
                      {fill(p.rembourse, { date: date.format(row.refundedAt), raison: p.raisons[row.refundReason] })}
                    </span>
                  ) : null}
                  {isRefundable(status) ? (
                    <div className="mt-2">
                      <RefundButton paymentId={row.id} family={family} amount={euros(row.amountCents)} />
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="font-mono text-legende break-all">{row.stripePaymentIntentId ?? ""}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { PaymentsTable }
