"use client"

import * as React from "react"
import { useTransition } from "react"

import { setCancellationDelay } from "@/app/(portail)/admin/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { CANCELLATION_DELAY_MAX, CANCELLATION_DELAY_MIN, isCancellationDelay } from "@/lib/gardes/rules"

/*
 * « Délai d'annulation » (annulations-delai-et-motif, the answers [9.2]): the
 * hours before the start from which a cancellation is late, 24 until a
 * founder changes it. A new value goes through the confirmation dialog (D-24),
 * is checked here and again on the server, and the last change is named with
 * who made it and when, like the students switch.
 */
function CancellationDelay({
  value,
  changed,
}: {
  value: number
  /** The last change, already formatted, or null when never changed. */
  changed: { date: string; name: string } | null
}) {
  const t = words(admin).delaiAnnulation
  const id = React.useId()
  const [typed, setTyped] = React.useState(String(value))
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [pending, start] = useTransition()
  const next = Number(typed.trim())

  const ask = () => {
    setMessage(null)
    if (typed.trim() === "" || !isCancellationDelay(next)) {
      setError(t.invalide)
      return
    }
    setError(null)
    if (next === value) {
      setMessage(fill(t.inchange, { heures: String(value) }))
      return
    }
    setOpen(true)
  }

  const save = () =>
    start(async () => {
      const result = await setCancellationDelay(next)
      if (result.ok) setMessage(t.enregistre)
      else if (result.error === "invalide") setError(t.invalide)
      else setMessage(t.erreur)
    })

  return (
    <section className="flex flex-col gap-4 rounded-carte border border-solid border-perle bg-blanc p-8">
      <h2 className="font-display text-h3 text-encre-sauge">{t.titre}</h2>
      <p className="max-w-2xl text-corps text-encre-taupe">{t.description}</p>
      <p className="text-corps font-semibold text-encre-taupe">{fill(t.actuel, { heures: String(value) })}</p>
      <p className="text-legende text-encre-taupe">
        {changed ? fill(t.modifie, { date: changed.date, nom: changed.name }) : t.jamais}
      </p>
      {message ? <FormMessage>{message}</FormMessage> : null}
      <div className="flex max-w-xs flex-col gap-2">
        <label htmlFor={`${id}-heures`} className="text-corps font-semibold text-encre-taupe">
          {t.champ}
        </label>
        <Input
          id={`${id}-heures`}
          type="number"
          inputMode="numeric"
          min={CANCELLATION_DELAY_MIN}
          max={CANCELLATION_DELAY_MAX}
          step={1}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erreur` : undefined}
        />
        {error ? (
          <p id={`${id}-erreur`} role="alert" className="px-6 text-legende font-semibold text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="button" disabled={pending} className="self-start" onClick={ask}>
        {t.enregistrer}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t.confirmation.titre}
        description={fill(t.confirmation.description, { avant: String(value), apres: String(next) })}
        action={{ label: t.confirmation.oui, tone: "confirmation", onSelect: save }}
        cancel={{ label: t.confirmation.non, tone: "sensible" }}
      />
    </section>
  )
}

export { CancellationDelay }
