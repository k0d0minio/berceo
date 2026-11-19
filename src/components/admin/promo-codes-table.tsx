"use client"

import * as React from "react"
import { useTransition } from "react"

import { deactivatePromoCodeAction } from "@/app/(portail)/admin/codes-promo/actions"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import type { PromoCodeRow } from "@/lib/abonnements/promo-codes"
import { eurosFromCents } from "@/lib/paiements/rules"

const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })
const link = "font-semibold text-encre-sauge underline underline-offset-4"

/*
 * The codes read from Stripe (JAM-304): the code, linked to Stripe, the
 * discount, the end, the uses and the state. « Désactiver » goes through the
 * confirmation dialog (D-24): deactivating is the sensitive answer (red).
 */
function DeactivateButton({ id, code }: { id: string; code: string }) {
  const t = words(admin).codesPromo
  const [pending, start] = useTransition()
  const [failed, setFailed] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      <ConfirmDialog
        trigger={
          <Button type="button" variant="raye" disabled={pending}>
            {t.desactiver}
          </Button>
        }
        title={t.desactiver}
        description={fill(t.confirmation, { code })}
        action={{
          label: t.desactiver,
          tone: "sensible",
          onSelect: () =>
            start(async () => {
              const result = await deactivatePromoCodeAction(id)
              setFailed(!result.ok)
            }),
        }}
        cancel={{ label: t.annuler, tone: "confirmation" }}
      />
      {failed ? (
        <p role="status" className="max-w-xs text-legende text-encre-taupe">
          {t.erreurDesactivation}
        </p>
      ) : null}
    </div>
  )
}

function PromoCodesTable({ rows }: { rows: PromoCodeRow[] }) {
  const t = words(admin).codesPromo

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.code}</TableHead>
            <TableHead>{t.colonnes.remise}</TableHead>
            <TableHead>{t.colonnes.fin}</TableHead>
            <TableHead>{t.colonnes.utilisations}</TableHead>
            <TableHead>{t.colonnes.statut}</TableHead>
            <TableHead>{t.colonnes.action}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="align-top">
              <TableCell>
                <a href={row.stripeUrl} target="_blank" rel="noopener noreferrer" className={link}>
                  {row.code}
                </a>
              </TableCell>
              <TableCell>
                {row.percentOff !== null
                  ? fill(t.remisePourcentage, { valeur: String(row.percentOff).replace(".", ",") })
                  : row.amountOffCents !== null
                    ? fill(t.remiseMontant, { valeur: eurosFromCents(row.amountOffCents) })
                    : ""}
              </TableCell>
              <TableCell>{row.expiresAt ? date.format(row.expiresAt) : ""}</TableCell>
              <TableCell>
                {row.maxRedemptions !== null
                  ? fill(t.utilisationsSur, { n: String(row.timesRedeemed), max: String(row.maxRedemptions) })
                  : String(row.timesRedeemed)}
              </TableCell>
              <TableCell className="font-semibold">{row.active ? t.actif : t.desactive}</TableCell>
              <TableCell>{row.active ? <DeactivateButton id={row.id} code={row.code} /> : null}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { PromoCodesTable }
