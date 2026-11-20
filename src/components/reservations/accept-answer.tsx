"use client"

import { useId, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { fill, words } from "@/content/locale"
import { paiement } from "@/content/paiement"
import { reservations } from "@/content/reservations"

/*
 * « Accepter et réserver » opens « Récapitulatif de votre garde » (the guide,
 * « La réservation »): the date, the hours, the duration, her first name, her
 * profession, her rates (the extra hour's too, profil-tarifs) and the 3 % service fee, the line saying the family
 * pays her directly (D-1), then the guide's two fee sentences and where the
 * fee is paid (frais-de-service). Confirming is green, going back red (D-24).
 * No word about insurance (D-8). Confirming opens Stripe's page; the booking
 * is made by the payment, on the server, which holds every rule again (D-102).
 * Her Berceo credit pays first (credits-au-paiement): the dialog names its
 * part and the rest Stripe asks. A credit that pays the whole fee opens no
 * Stripe page, and the dialog says so. The server reads her balance again.
 * An answer that proposes a different start (JAM-306) shows each night's
 * proposal and a checkbox, « J'accepte l'horaire proposé par [Prénom] »: the
 * family confirms only once it is ticked. The action carries what she
 * confirmed, and the server opens the payment only for that proposal.
 */

export type Recap = {
  /** One date, or every night of a regular request (JAM-302). */
  date: string
  /** « 4 nuits »: a regular request booked at once (JAM-302); absent for one night. */
  nuits?: string
  heures: string
  duree: string
  prenom: string
  profession: string
  tarif: string
  /** « 15 € par heure supplémentaire »; absent on an answer given before profil-tarifs. */
  tarifHeure?: string
  /** « 4,11 € », computed on the server from the answer's rate (D-99). */
  frais: string
  /** The part her Berceo credit pays, « 2,00 € »; absent when it pays nothing. */
  credit?: string
  /** What Stripe asks after the credit, « 2,11 € »; null when the credit pays it all. */
  reste?: string | null
  /**
   * The nights whose start she proposes to change, one line each (JAM-306);
   * absent or empty for an answer at the family's times.
   */
  horairesAdaptes?: readonly string[]
}

function AcceptAnswer({ recap, onAccept }: { recap: Recap; onAccept: () => Promise<void> }) {
  const t = words(reservations)
  const f = words(paiement).recapitulatif
  const l = t.recapitulatif.libelles
  const [pending, startTransition] = useTransition()
  const adapted = recap.horairesAdaptes ?? []
  const needsConsent = adapted.length > 0
  const [consent, setConsent] = useState(false)
  const [missing, setMissing] = useState(false)
  const consentId = useId()
  const rows: [string, string][] = [
    [recap.nuits ? l.dates : l.date, recap.date],
    ...(recap.nuits ? [[l.nuits, recap.nuits] as [string, string]] : []),
    [l.heure, recap.heures],
    [l.duree, recap.duree],
    [l.professionnelle, recap.prenom],
    [l.profession, recap.profession],
    [l.tarif, recap.tarif],
    ...(recap.tarifHeure ? [[l.tarifHeure, recap.tarifHeure] as [string, string]] : []),
    [f.frais, recap.frais],
    ...(recap.credit
      ? [
          [f.credit, recap.credit] as [string, string],
          ...(recap.reste ? [[f.reste, recap.reste] as [string, string]] : []),
        ]
      : []),
  ]
  const creditPaysAll = Boolean(recap.credit) && !recap.reste

  return (
    <ConfirmDialog
      trigger={<Button disabled={pending}>{t.famille.accepter}</Button>}
      title={t.recapitulatif.titre}
      description={t.recapitulatif.paiement}
      action={{
        label: creditPaysAll ? f.confirmerCredit : f.confirmer,
        tone: "confirmation",
        onSelect: (event) => {
          // The adapted start is accepted in words, never by default (JAM-306): the dialog stays open until it is.
          if (needsConsent && !consent) {
            event.preventDefault()
            setMissing(true)
            return
          }
          startTransition(onAccept)
        },
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
      {needsConsent ? (
        <div className="flex flex-col gap-2 rounded-carte border border-solid border-taupe px-4 py-4 text-corps text-taupe">
          <p className="font-semibold">{fill(t.famille.horaires.titre, { prenom: recap.prenom })}</p>
          <ul className="flex flex-col gap-1">
            {adapted.map((ligne) => (
              <li key={ligne} className="font-semibold text-sauge">
                {ligne}
              </li>
            ))}
          </ul>
          <label htmlFor={consentId} className="flex items-start gap-3">
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked)
                if (event.target.checked) setMissing(false)
              }}
              aria-invalid={missing ? true : undefined}
              aria-describedby={missing ? `${consentId}-erreur` : undefined}
              className="mt-1 size-5 shrink-0 accent-sauge"
            />
            <span>{fill(t.famille.horaires.accepter, { prenom: recap.prenom })}</span>
          </label>
          {missing ? (
            <p id={`${consentId}-erreur`} role="alert" className="text-legende font-semibold text-destructive">
              {t.famille.horaires.accepterRequis}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 text-legende text-taupe">
        <p>{f.prelevement}</p>
        <p>{f.remboursement}</p>
        <p>{creditPaysAll ? f.creditTotal : recap.credit ? f.stripeReste : f.stripe}</p>
      </div>
    </ConfirmDialog>
  )
}

export { AcceptAnswer }
