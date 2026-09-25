"use client"

import * as React from "react"
import { useActionState } from "react"

import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { avis } from "@/content/avis"
import { fill, words } from "@/content/locale"
import { MAX_SCORE, type RatingState } from "@/lib/avis/rules"

import { Star } from "./stars"

/*
 * The rating form (avis-etoiles, D-18, D-115, D-117): four criteria, each a
 * radiogroup of five stars. Native radios, visually hidden, so the arrow keys
 * move within a criterion and Tab from one to the next; each star is a 44 px
 * target with its own accessible name, « 3 étoiles sur 5 ». No text field of
 * any kind. The server re-checks everything; the form only collects four
 * whole numbers.
 */

const t = words(avis).formulaire

function starName(n: number): string {
  return fill(n === 1 ? t.etoile : t.etoiles, { n: String(n) })
}

function StarInput({ name, label }: { name: string; label: string }) {
  const [value, setValue] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const shown = hover || value

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-corps font-semibold text-encre-taupe">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex" onMouseLeave={() => setHover(0)}>
        {Array.from({ length: MAX_SCORE }, (_, i) => {
          const n = i + 1
          return (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-capsule has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-encre-sauge"
            >
              <input
                type="radio"
                name={name}
                value={n}
                required
                checked={value === n}
                onChange={() => setValue(n)}
                aria-label={starName(n)}
                className="sr-only"
              />
              <Star filled={n <= shown} className="size-7" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function RatingForm({
  action,
  labels,
}: {
  action: (state: RatingState, form: FormData) => Promise<RatingState>
  labels: readonly string[]
}) {
  const [state, submit, pending] = useActionState(action, {})
  const { erreurs, refus } = words(avis)
  const error = state.error
  const message =
    error === undefined ? null : error === "incomplet" || error === "generique" ? erreurs[error] : refus[error]

  return (
    <form action={submit} className="flex max-w-2xl flex-col gap-8">
      {message ? <FormMessage>{message}</FormMessage> : null}
      <p className="text-corps text-encre-taupe">{t.consigne}</p>
      {labels.map((label, i) => (
        <StarInput key={label} name={`score_${i + 1}`} label={label} />
      ))}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.envoi : t.bouton}
      </Button>
    </form>
  )
}

export { RatingForm, StarInput }
