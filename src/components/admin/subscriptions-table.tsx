import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { planWords } from "@/lib/abonnements/format"
import type { AdminNightPass, AdminSubscription } from "@/lib/abonnements/subscriptions"
import { adminUserPath } from "@/lib/admin/paths"
import { eurosFromCents } from "@/lib/paiements/rules"

const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })
const link = "font-semibold text-sauge underline underline-offset-4"

/*
 * Every subscription, newest first (abonnements-back-office): the family,
 * linked to her account page, the plan, the state, the start (the Checkout
 * that opened it), the renewal date (or the end once cancelled or ended), the
 * grace period's end after a failed renewal, the promotion code of the first
 * payment with its discount (JAM-304), and the subscription in Stripe.
 * Nothing on this page changes a subscription: Stripe does.
 */
/** « BIENVENUE, 5,00 € »: the code typed on the Checkout and its discount; empty without one. */
function discount(code: string | null, cents: number | null): string {
  if (!code) return ""
  return fill(words(admin).abonnements.remise, { code, montant: eurosFromCents(cents ?? 0) })
}

function SubscriptionsTable({ rows }: { rows: AdminSubscription[] }) {
  const t = words(admin).abonnements

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.formule}</TableHead>
            <TableHead>{t.colonnes.statut}</TableHead>
            <TableHead>{t.colonnes.debut}</TableHead>
            <TableHead>{t.colonnes.renouvellement}</TableHead>
            <TableHead>{t.colonnes.grace}</TableHead>
            <TableHead>{t.colonnes.codePromo}</TableHead>
            <TableHead>{t.colonnes.stripe}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const family = row.family ?? t.inconnu
            const renewal =
              row.state === "terminee"
                ? row.endedAt
                  ? fill(t.termineLe, { date: date.format(row.endedAt) })
                  : ""
                : row.cancelsAt
                  ? fill(t.finLe, { date: date.format(row.cancelsAt) })
                  : row.currentPeriodEnd
                    ? date.format(row.currentPeriodEnd)
                    : ""
            return (
              <TableRow key={row.id} className="align-top">
                <TableCell>
                  {row.familyUserId ? (
                    <Link href={adminUserPath(row.familyUserId)} className={link}>
                      {family}
                    </Link>
                  ) : (
                    family
                  )}
                </TableCell>
                <TableCell>{planWords(row.plan).name}</TableCell>
                <TableCell className="font-semibold">{t.etats[row.state]}</TableCell>
                <TableCell>{date.format(row.createdAt)}</TableCell>
                <TableCell>{renewal}</TableCell>
                <TableCell>{row.graceEndsAt ? fill(t.graceJusquau, { date: date.format(row.graceEndsAt) }) : ""}</TableCell>
                <TableCell>{discount(row.promotionCode, row.amountDiscount)}</TableCell>
                <TableCell>
                  {row.stripeUrl ? (
                    <a href={row.stripeUrl} target="_blank" rel="noopener noreferrer" className={link}>
                      {t.voirStripe}
                      <span className="sr-only">{` : ${family}`}</span>
                    </a>
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/*
 * The one-night plans paid (JAM-304), newest payment first: the family, the
 * state (still open, or used by a booking whose night has ended), the day of
 * the payment, the amount paid, the promotion code and its discount, and the
 * payment in Stripe.
 */
function NightPassesTable({ rows }: { rows: AdminNightPass[] }) {
  const a = words(admin).abonnements
  const t = a.nuits

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.famille}</TableHead>
            <TableHead>{t.colonnes.statut}</TableHead>
            <TableHead>{t.colonnes.payeLe}</TableHead>
            <TableHead>{t.colonnes.montant}</TableHead>
            <TableHead>{t.colonnes.codePromo}</TableHead>
            <TableHead>{t.colonnes.stripe}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const family = row.family ?? a.inconnu
            return (
              <TableRow key={row.id} className="align-top">
                <TableCell>
                  {row.familyUserId ? (
                    <Link href={adminUserPath(row.familyUserId)} className={link}>
                      {family}
                    </Link>
                  ) : (
                    family
                  )}
                </TableCell>
                <TableCell className="font-semibold">{t.etats[row.state]}</TableCell>
                <TableCell>{row.paidAt ? date.format(row.paidAt) : ""}</TableCell>
                <TableCell>{row.amountTotal !== null ? fill(t.montant, { montant: eurosFromCents(row.amountTotal) }) : ""}</TableCell>
                <TableCell>{discount(row.promotionCode, row.amountDiscount)}</TableCell>
                <TableCell>
                  {row.stripeUrl ? (
                    <a href={row.stripeUrl} target="_blank" rel="noopener noreferrer" className={link}>
                      {t.voirStripe}
                      <span className="sr-only">{` : ${family}`}</span>
                    </a>
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { NightPassesTable, SubscriptionsTable }
