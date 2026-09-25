"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { words } from "@/content/locale"
import { paiement } from "@/content/paiement"
import { reservations } from "@/content/reservations"

/*
 * « Accepter et réserver » opens « Récapitulatif de votre garde » (the guide,
 * « La réservation »): the date, the hours, the duration, her first name, her
 * profession, her rate and the 3 % service fee, the line saying the family
 * pays her directly (D-1), then the guide's two fee sentences and where the
 * fee is paid (frais-de-service). Confirming is green, going back red (D-24).
 * No word about insurance (D-8). Confirming opens Stripe's page; the booking
 * is made by the payment, on the server, which holds every rule again (D-90).
 */

export type Recap = {
  date: string
  heures: string
  duree: string
  prenom: string
  profession: string
  tarif: string
  /** « 4,11 € », computed on the server from the answer's rate (D-87). */
  frais: string
}

function AcceptAnswer({ recap, onAccept }: { recap: Recap; onAccept: () => Promise<void> }) {
  const t = words(reservations)
  const f = words(paiement).recapitulatif
  const l = t.recapitulatif.libelles
  const [pending, startTransition] = useTransition()
  const rows: [string, string][] = [
    [l.date, recap.date],
    [l.heure, recap.heures],
    [l.duree, recap.duree],
    [l.professionnelle, recap.prenom],
    [l.profession, recap.profession],
    [l.tarif, recap.tarif],
    [f.frais, recap.frais],
  ]

  return (
    <ConfirmDialog
      trigger={<Button disabled={pending}>{t.famille.accepter}</Button>}
      title={t.recapitulatif.titre}
      description={t.recapitulatif.paiement}
      action={{
        label: f.confirmer,
        tone: "confirmation",
        onSelect: () => startTransition(onAccept),
      }}
      cancel={{ label: t.recapitulatif.renoncer, tone: "sensible" }}
    >
      <dl className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-corps font-semibold text-taupe">{label}</dt>
            <dd className="text-corps text-taupe">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2 text-legende text-taupe">
        <p>{f.prelevement}</p>
        <p>{f.remboursement}</p>
        <p>{f.stripe}</p>
      </div>
    </ConfirmDialog>
  )
}

export { AcceptAnswer }
