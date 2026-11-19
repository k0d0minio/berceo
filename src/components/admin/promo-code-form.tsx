"use client"

import * as React from "react"
import { useTransition } from "react"

import { createPromoCodeAction } from "@/app/(portail)/admin/codes-promo/actions"
import { Field, FieldError, FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { PROMO_KINDS, type PromoKind } from "@/lib/abonnements/rules"

/*
 * « Créer un code » (JAM-304): the code, the kind and value of the discount,
 * and, if the founder wants them, an end date and a number of uses. The
 * founder chooses every value: nothing is filled in for her. The server reads
 * the form again; its error shows in red under the field it blocks.
 */
function PromoCodeForm() {
  const t = words(admin).codesPromo
  const f = t.formulaire
  const [kind, setKind] = React.useState<PromoKind>("pourcentage")
  const [error, setError] = React.useState<keyof typeof t.erreurs | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [pending, start] = useTransition()
  const formRef = React.useRef<HTMLFormElement>(null)

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setMessage(null)
    start(async () => {
      const result = await createPromoCodeAction({
        code: String(data.get("code") ?? ""),
        kind,
        value: String(data.get("valeur") ?? ""),
        endsOn: String(data.get("fin") ?? ""),
        maxUses: String(data.get("utilisations") ?? ""),
      })
      if (result.ok) {
        setError(null)
        setMessage(fill(t.cree, { code: result.code }))
        formRef.current?.reset()
      } else {
        setError(result.error)
      }
    })
  }

  const fieldError = (key: "code" | "remise" | "fin" | "utilisations") => (error === key ? t.erreurs[key] : undefined)

  return (
    <section className="flex flex-col gap-4 rounded-carte border border-solid border-perle bg-blanc p-8">
      <h2 className="font-display text-h3 text-sauge">{f.titre}</h2>
      {message ? <FormMessage>{message}</FormMessage> : null}
      <form ref={formRef} onSubmit={submit} className="flex max-w-md flex-col gap-4" noValidate>
        <Field name="code" label={f.code} help={f.codeAide} error={fieldError("code")} autoComplete="off" required />
        <fieldset className="flex flex-col gap-2">
          <legend className="text-corps font-semibold text-taupe">{f.type}</legend>
          {PROMO_KINDS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-corps text-taupe">
              <input
                type="radio"
                name="type"
                value={option}
                checked={kind === option}
                onChange={() => setKind(option)}
              />
              {f[option]}
            </label>
          ))}
        </fieldset>
        <Field name="valeur" label={f.valeur} help={f.valeurAide} error={fieldError("remise")} inputMode="decimal" required />
        <Field name="fin" label={f.fin} help={f.finAide} error={fieldError("fin")} type="date" />
        <Field
          name="utilisations"
          label={f.utilisations}
          error={fieldError("utilisations")}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
        />
        {error === "pris" || error === "generique" ? <FieldError role="alert">{t.erreurs[error]}</FieldError> : null}
        <Button type="submit" disabled={pending} className="self-start">
          {f.creer}
        </Button>
      </form>
    </section>
  )
}

export { PromoCodeForm }
