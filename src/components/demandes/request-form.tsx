"use client"

import Link from "next/link"
import { useActionState } from "react"

import type { RequestState } from "@/app/(portail)/espace/famille/demandes/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comptes } from "@/content/comptes"
import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { formatDate, formatTime } from "@/lib/demandes/format"
import { AGE_UNITS, CHILDREN, START_TIMES } from "@/lib/demandes/rules"
import type { RequestError, RequestField, RequestInput } from "@/lib/demandes/validation"
import { PROFILE_PATH } from "@/lib/famille/paths"
import { cn } from "@/lib/utils"

/*
 * The request form (the guide, "Les annonces"): the date, the start time with
 * the 11-hour note, the number of children, the baby's age, the commune from
 * her profile (read-only, D-63) with the address note, and the mandatory
 * checkbox (D-20). Three modes: a normal request, an urgent one (tonight or
 * tomorrow night, D-60), and an edit, which never shows the checkbox again nor
 * changes the commune or the urgency. Published from a professional's
 * profile, it carries her id and says the request goes to her in priority.
 * Validation is the server's; a refused form keeps what was typed.
 */

export type RequestFormMode = "normale" | "urgente" | "modification"

const c = words(comptes)
const t = words(demandes)

// The DA's field construction for a native select: same capsule as the input.
const selectClasses =
  "flex min-h-12 w-full min-w-0 appearance-none rounded-capsule border border-solid border-input bg-blanc px-6 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge focus-visible:outline-none aria-invalid:border-destructive"
const legend = "text-corps font-semibold text-encre-taupe"
const helpText = "px-6 text-legende text-encre-taupe"
const errorClasses = "px-6 text-legende font-semibold text-encre-taupe"

function RequestForm({
  action,
  mode,
  dates,
  commune,
  id,
  defaults,
  priority,
}: {
  action: (state: RequestState, form: FormData) => Promise<RequestState>
  mode: RequestFormMode
  /** The first and last night allowed, `YYYY-MM-DD`, computed on the server in Brussels. */
  dates: { min: string; max: string }
  /** « 1050 Ixelles »: the profile's commune, or the request's when editing. */
  commune: string
  /** The request being edited. */
  id?: string
  defaults?: Omit<RequestInput, "confirmation">
  /** Published from a professional's profile: sent to her « en priorité » (D-71), with the line saying so. */
  priority?: { profileId: string; note: string }
}) {
  const [state, submit, pending] = useActionState(action, {})
  const e = state.errors ?? {}
  const v = state.values ?? defaults
  const bounds = { min: formatDate(dates.min), max: formatDate(dates.max) }

  function errorOf(field: RequestField): string | undefined {
    const error: RequestError | undefined = e[field]
    if (error === undefined) return undefined
    if (error === "requis") return c.erreurs.requis
    if (error === "date") return fill(t.erreurs.date, bounds)
    return t.erreurs[error]
  }

  const submitLabel =
    mode === "urgente"
      ? t.boutons.publierUrgente
      : mode === "modification"
        ? t.boutons.enregistrer
        : t.boutons.envoyer

  return (
    <form action={submit} noValidate className="flex max-w-2xl flex-col gap-8">
      {state.message ? (
        <FormMessage>
          {state.message === "generique" ? c.erreurs.generique : t.erreurs.nonModifiable}
        </FormMessage>
      ) : null}
      {mode === "urgente" ? <input type="hidden" name="urgente" value="1" /> : null}
      {id ? <input type="hidden" name="id" value={id} /> : null}
      {priority ? (
        <>
          <input type="hidden" name="priorite" value={priority.profileId} />
          <p className="text-corps font-semibold text-encre-taupe">{priority.note}</p>
        </>
      ) : null}

      <Field
        // A refused form remounts the field with what was typed.
        key={`date-${v?.date ?? ""}`}
        name="date"
        type="date"
        label={t.formulaire.champs.date}
        help={mode === "urgente" ? t.formulaire.aides.dateUrgente : fill(t.formulaire.aides.date, bounds)}
        min={dates.min}
        max={dates.max}
        defaultValue={v?.date ?? ""}
        error={errorOf("date")}
        required
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="champ-heure" className={legend}>
          {t.formulaire.champs.heure}
        </label>
        <select
          key={`heure-${v?.heure ?? ""}`}
          id="champ-heure"
          name="heure"
          defaultValue={v?.heure ?? ""}
          required
          aria-invalid={e.heure ? true : undefined}
          aria-describedby={["champ-heure-aide", e.heure ? "champ-heure-erreur" : ""]
            .filter(Boolean)
            .join(" ")}
          className={selectClasses}
        >
          <option value="" disabled>
            {t.formulaire.choisirHeure}
          </option>
          {START_TIMES.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
        </select>
        <p id="champ-heure-aide" className={helpText}>
          {t.formulaire.aides.heure}
        </p>
        {e.heure ? (
          <p id="champ-heure-erreur" className={errorClasses}>
            {errorOf("heure")}
          </p>
        ) : null}
      </div>

      <fieldset
        className="flex flex-col gap-3"
        aria-describedby={e.enfants ? "champ-enfants-erreur" : undefined}
      >
        <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.enfants}</legend>
        <div key={`enfants-${v?.enfants ?? ""}`} className="flex flex-wrap gap-6 px-2">
          {CHILDREN.map((key) => (
            <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-encre-taupe">
              <input
                type="radio"
                name="enfants"
                value={key}
                defaultChecked={v?.enfants === key}
                required
                className="size-5 shrink-0 accent-sauge"
              />
              {t.formulaire.enfants[key]}
            </label>
          ))}
        </div>
        {e.enfants ? (
          <p id="champ-enfants-erreur" className={errorClasses}>
            {errorOf("enfants")}
          </p>
        ) : null}
      </fieldset>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={["champ-age-aide", e.age ? "champ-age-erreur" : ""].filter(Boolean).join(" ")}
      >
        <legend className={cn(legend, "mb-2")}>{t.formulaire.champs.age}</legend>
        <div key={`age-${v?.ageValeur ?? ""}-${v?.ageUnite ?? ""}`} className="grid grid-cols-[6rem_1fr] gap-3">
          <Input
            name="ageValeur"
            type="number"
            inputMode="numeric"
            min={0}
            max={24}
            step={1}
            aria-label={t.formulaire.champs.ageValeur}
            aria-invalid={e.age ? true : undefined}
            defaultValue={v?.ageValeur ?? ""}
            required
          />
          <select
            name="ageUnite"
            aria-label={t.formulaire.champs.ageUnite}
            aria-invalid={e.age ? true : undefined}
            defaultValue={v?.ageUnite || "semaines"}
            className={selectClasses}
          >
            {AGE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t.formulaire.unites[unit]}
              </option>
            ))}
          </select>
        </div>
        <p id="champ-age-aide" className={helpText}>
          {t.formulaire.aides.age}
        </p>
        {e.age ? (
          <p id="champ-age-erreur" className={errorClasses}>
            {errorOf("age")}
          </p>
        ) : null}
      </fieldset>

      {/* Not a form field: the commune is the profile's, never read from this form (D-63). */}
      <div className="flex flex-col gap-2">
        <label htmlFor="champ-commune" className={legend}>
          {t.formulaire.champs.commune}
        </label>
        <Input
          id="champ-commune"
          value={commune}
          readOnly
          aria-readonly
          aria-describedby="champ-commune-aide"
          className="bg-perle"
        />
        <p id="champ-commune-aide" className={helpText}>
          {t.formulaire.aides.commune}
        </p>
        {mode === "modification" ? (
          <p className={helpText}>{t.formulaire.aides.nonModifiable}</p>
        ) : (
          <Link
            href={PROFILE_PATH}
            className="w-fit rounded-md px-6 text-legende font-semibold text-encre-sauge underline underline-offset-4"
          >
            {t.formulaire.aides.lienProfil}
          </Link>
        )}
      </div>

      {mode === "modification" ? null : (
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 text-corps text-encre-taupe">
            <input
              type="checkbox"
              name="confirmation"
              value="oui"
              required
              defaultChecked={state.values?.confirmation}
              aria-invalid={e.confirmation ? true : undefined}
              aria-describedby={e.confirmation ? "champ-confirmation-erreur" : undefined}
              className="mt-1 size-5 shrink-0 accent-sauge"
            />
            <span>{t.formulaire.confirmation}</span>
          </label>
          {e.confirmation ? (
            <p id="champ-confirmation-erreur" className={errorClasses}>
              {errorOf("confirmation")}
            </p>
          ) : null}
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.boutons.enCours : submitLabel}
      </Button>
    </form>
  )
}

export { RequestForm }
