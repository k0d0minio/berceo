"use client"

import * as React from "react"
import { useTransition } from "react"

import { decideFile } from "@/app/(portail)/admin/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import type { ProfileStatus } from "@/db/schema"
import { REASON_MAX, checkReason, isReviewable, type Decision } from "@/lib/admin/rules"

/*
 * The three decisions on a file (the guide, "L'outil de vérification"), each
 * behind its confirmation dialog (D-24: validating and asking are confirming
 * answers, refusing the sensitive one). A complément and a refusal carry a
 * reason she will read; it is checked here and again on the server. The page
 * hands over the state it showed, so a decision taken on a stale page is
 * refused rather than applied.
 */
function DecisionPanel({
  profileId,
  name,
  status,
  reviewedAt,
  held,
}: {
  profileId: string
  /** "Prénom Nom", for the dialogs. */
  name: string
  status: ProfileStatus
  /** The last decision's moment as the page read it, ISO, or null. */
  reviewedAt: string | null
  /** A student file while students are not admitted (D-52): no validation. */
  held: boolean
}) {
  const t = words(admin)
  const d = t.decisions
  const [pending, start] = useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const take = (decision: Decision, reason?: string) =>
    start(async () => {
      const result = await decideFile({ profileId, decision, reason, expected: { status, reviewedAt } })
      if (!result.ok) setMessage(d.erreurs[result.error])
      else setMessage(result.email === "echec" ? d.resultats.emailEchec : d.resultats[decision])
    })

  return (
    <div className="flex flex-col gap-4">
      {message ? <FormMessage>{message}</FormMessage> : null}
      {!isReviewable(status) ? (
        <p className="text-corps text-taupe">{t.dossier.sansDecision}</p>
      ) : (
        <>
          {held ? <p className="max-w-2xl text-corps text-taupe">{t.dossier.etudiantesRetenue}</p> : null}
          <div className="flex flex-wrap gap-4">
            <ConfirmDialog
              trigger={
                <Button type="button" disabled={pending || held}>
                  {d.valider}
                </Button>
              }
              title={d.confirmation.validerTitre}
              description={fill(d.confirmation.valider, { nom: name })}
              action={{ label: d.confirmation.oui, tone: "confirmation", onSelect: () => take("valider") }}
              cancel={{ label: d.confirmation.non, tone: "sensible" }}
            />
            <ReasonDialog
              trigger={
                <Button type="button" variant="raye" disabled={pending}>
                  {d.complement}
                </Button>
              }
              title={fill(d.confirmation.complementTitre, { nom: name })}
              description={d.confirmation.complement}
              tone="confirmation"
              onConfirm={(reason) => take("complement", reason)}
            />
            <ReasonDialog
              trigger={
                <Button type="button" variant="raye" disabled={pending}>
                  {d.refuser}
                </Button>
              }
              title={fill(d.confirmation.refuserTitre, { nom: name })}
              description={d.confirmation.refuser}
              tone="sensible"
              onConfirm={(reason) => take("refuser", reason)}
            />
          </div>
        </>
      )}
    </div>
  )
}

/** The dialog's own words, where they are not the decisions' (the fee's refund). */
type ReasonLabels = { oui: string; non: string; motif: string; motifAide: string }

/** A confirmation that asks for the reason first, and stays open until it is valid. */
function ReasonDialog({
  trigger,
  title,
  description,
  tone,
  onConfirm,
  labels,
}: {
  trigger: React.ReactElement
  title: string
  description: string
  /** The confirming answer's colour: green to ask, red to refuse (D-24). */
  tone: "confirmation" | "sensible"
  onConfirm: (reason: string) => void
  labels?: ReasonLabels
}) {
  const d = words(admin).decisions
  const l = labels ?? d.confirmation
  const id = React.useId()
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  return (
    <ConfirmDialog
      trigger={trigger}
      title={title}
      description={description}
      onOpenChange={(open) => {
        if (!open) setError(null)
      }}
      action={{
        label: l.oui,
        tone,
        onSelect: (event) => {
          const checked = checkReason(reason)
          if (!checked.ok) {
            event.preventDefault()
            setError(d.erreurs[checked.error])
            return
          }
          onConfirm(checked.value)
          setReason("")
        },
      }}
      cancel={{ label: l.non, tone: tone === "sensible" ? "confirmation" : "sensible" }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-motif`} className="text-corps font-semibold text-taupe">
          {l.motif}
        </label>
        <textarea
          id={`${id}-motif`}
          rows={4}
          maxLength={REASON_MAX}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[`${id}-aide`, error ? `${id}-erreur` : ""].filter(Boolean).join(" ")}
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge aria-invalid:border-destructive"
        />
        <p id={`${id}-aide`} className="px-6 text-legende text-taupe">
          {l.motifAide}
        </p>
        {error ? (
          <p id={`${id}-erreur`} role="alert" className="px-6 text-legende font-semibold text-taupe">
            {error}
          </p>
        ) : null}
      </div>
    </ConfirmDialog>
  )
}

export { DecisionPanel, ReasonDialog }
