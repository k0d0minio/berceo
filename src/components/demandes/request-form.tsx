"use client"

import { useActionState, useState } from "react"

import type { RequestState } from "@/app/(portail)/espace/famille/demandes/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { NightPicker } from "@/components/demandes/night-picker"
import { CommuneCombobox } from "@/components/famille/commune-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comptes } from "@/content/comptes"
import { demandes } from "@/content/demandes"
import { famille } from "@/content/famille"
import { fill, words } from "@/content/locale"
import { parseLocalityValue } from "@/lib/communes"
import { formatDate, formatTime } from "@/lib/demandes/format"
import {
  AGE_UNITS,
  CHILDREN,
  FEEDINGS,
  MAX_EXTRA_HOURS,
  MAX_SERIES_NIGHTS,
  REASON_MAX,
  REQUEST_KINDS,
  START_TIMES,
  type RequestKind,
} from "@/lib/demandes/rules"
import type { RequestError, RequestField, RequestInput } from "@/lib/demandes/validation"
import { characterCount } from "@/lib/famille/validation"
import { cn } from "@/lib/utils"

/*
 * The request form (the guide, "Les annonces"): the date in a month calendar
 * a phone can read, the start time, the extra hours with the 11-hour note,
 * the number of children, their age, how they are fed, the night's commune
 * and address with the address note, prefilled from her profile and hers to
 * change (demande-adresse-de-la-nuit), the optional reason with the founders'
 * help line and notice (demande-motif-facultatif), and the mandatory checkbox (D-20).
 * Three modes: a normal request, an urgent one (tonight or tomorrow night,
 * D-60), and an edit, which never shows the checkbox again nor changes the
 * commune or the urgency: the rue, the numéro and the boîte change. Published from a professional's profile, it carries her id and says
 * the request goes to her in priority. A normal request is « Nuit ponctuelle »
 * or « Nuits régulières » (demande-nuits-regulieres): regular nights replace
 * the date with a calendar where she ticks each night, and every other field
 * applies to every night. Validation is the server's; a refused form keeps
 * what was typed.
 */

export type RequestFormMode = "normale" | "urgente" | "modification"

const c = words(comptes)
const t = words(demandes)
const f = words(famille).profil

// The DA's field construction for a native select: same capsule as the input.
const selectClasses =
  "flex min-h-12 w-full min-w-0 appearance-none rounded-capsule border border-solid border-input bg-blanc px-6 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge focus-visible:outline-none aria-invalid:border-destructive"
const legend = "text-corps font-semibold text-encre-taupe"
const helpText = "px-6 text-legende text-encre-taupe"
const errorClasses = "px-6 text-legende font-semibold text-encre-taupe"

/** The optional reason, with its live count, the way the profile counts its context line. */
function ReasonField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  const [reason, setReason] = useState(defaultValue)
  const count = characterCount(reason.trim())
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="champ-motif" className={legend}>
        {t.formulaire.champs.motif}
      </label>
      <p id="champ-motif-aide" className={helpText}>
        {t.formulaire.aides.motif}
      </p>
      <textarea
        id="champ-motif"
        name="motif"
        rows={4}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={["champ-motif-aide", "champ-motif-avertissement", error ? "champ-motif-erreur" : ""]
          .filter(Boolean)
          .join(" ")}
        className="w-full min-w-0 rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge focus-visible:outline-none aria-invalid:border-destructive"
      />
      <p id="champ-motif-avertissement" className={helpText}>
        {t.formulaire.aides.motifAvertissement}{" "}
        <span aria-live="polite">{fill(t.formulaire.aides.compteur, { n: String(count) })}</span>
      </p>
      {error ? (
        <p id="champ-motif-erreur" className={errorClasses}>
          {error}
        </p>
      ) : count > REASON_MAX ? (
        <p className={errorClasses}>{t.erreurs.motifLong}</p>
      ) : null}
    </div>
  )
}

function RequestForm({
  action,
  mode,
  dates,
  seriesDates,
  commune,
  id,
  defaults,
  priority,
}: {
  action: (state: RequestState, form: FormData) => Promise<RequestState>
  mode: RequestFormMode
  /** The first and last night allowed, `YYYY-MM-DD`, computed on the server in Brussels. */
  dates: { min: string; max: string }
  /** A normal publication: the first and last night of regular nights (`seriesWindow`). */
  seriesDates?: { min: string; max: string }
  /** « 1050 Ixelles »: the request's commune, shown read-only on an edit. */
  commune?: string
  /** The request being edited. */
  id?: string
  /** What is stored: the profile's place on a publication, the request on an edit. */
  defaults?: Partial<Omit<RequestInput, "confirmation">>
  /** Published from a professional's profile: sent to her « en priorité » (D-71), with the line saying so. */
  priority?: { profileId: string; note: string }
}) {
  const [state, submit, pending] = useActionState(action, {})
  const e = state.errors ?? {}
  const v = state.values ?? defaults
  const bounds = { min: formatDate(dates.min), max: formatDate(dates.max) }
  const seriesBounds = seriesDates
    ? { min: formatDate(seriesDates.min), max: formatDate(seriesDates.max) }
    : bounds
  // Regular nights exist on the normal publish form only.
  const [kind, setKind] = useState<RequestKind>(
    mode === "normale" && seriesDates && v?.nature === "reguliere" ? "reguliere" : "ponctuelle"
  )

  function errorOf(field: RequestField): string | undefined {
    const error: RequestError | undefined = e[field]
    if (error === undefined) return undefined
    if (error === "requis") return c.erreurs.requis
    if (error === "date") return fill(t.erreurs.date, bounds)
    if (field === "nuits") {
      if (error === "nuits") return fill(t.erreurs.nuits, seriesBounds)
      if (error === "doublon") {
        return fill(t.erreurs.doublonNuits, { dates: (state.conflits ?? []).map(formatDate).join(", ") })
      }
    }
    // The address follows the profile's rules, in the profile's words.
    if (error === "commune" || error === "adresseIncomplete" || error === "boiteSeule" || error === "long") {
      return f.erreurs[error]
    }
    return t.erreurs[error]
  }

  // A refused form shows the commune as typed: a picked entry, or text not picked.
  const locality = v?.commune ? parseLocalityValue(v.commune) : null

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

      {mode === "normale" && seriesDates ? (
        <fieldset className="flex flex-col gap-3">
          <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.nature}</legend>
          <div className="flex flex-wrap gap-6 px-2">
            {REQUEST_KINDS.map((key) => (
              <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-encre-taupe">
                <input
                  type="radio"
                  name="nature"
                  value={key}
                  checked={kind === key}
                  onChange={() => setKind(key)}
                  className="size-5 shrink-0 accent-sauge"
                />
                {t.formulaire.natures[key]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {kind === "reguliere" && seriesDates ? (
        <div className="flex flex-col gap-2">
          <p id="champ-nuits-libelle" className={legend}>
            {t.formulaire.champs.nuits}
          </p>
          <NightPicker
            // A refused form remounts the calendar with the nights ticked.
            key={`nuits-${v?.nuits ?? ""}`}
            name="nuits"
            labelId="champ-nuits-libelle"
            min={seriesDates.min}
            max={seriesDates.max}
            defaultValue={v?.nuits ?? ""}
            multiple
            maxCount={MAX_SERIES_NIGHTS}
            invalid={Boolean(e.nuits)}
            describedBy={["champ-nuits-aide", e.nuits ? "champ-nuits-erreur" : ""].filter(Boolean).join(" ")}
          />
          <p id="champ-nuits-aide" className={helpText}>
            {fill(t.formulaire.aides.nuits, { ...seriesBounds, n: String(MAX_SERIES_NIGHTS) })}
          </p>
          {e.nuits ? (
            <p id="champ-nuits-erreur" className={errorClasses}>
              {errorOf("nuits")}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p id="champ-date-libelle" className={legend}>
            {t.formulaire.champs.date}
          </p>
          <NightPicker
            // A refused form remounts the calendar with what was chosen.
            key={`date-${v?.date ?? ""}`}
            name="date"
            labelId="champ-date-libelle"
            min={dates.min}
            max={dates.max}
            defaultValue={v?.date ?? ""}
            invalid={Boolean(e.date)}
            describedBy={["champ-date-aide", e.date ? "champ-date-erreur" : ""].filter(Boolean).join(" ")}
          />
          <p id="champ-date-aide" className={helpText}>
            {mode === "urgente" ? t.formulaire.aides.dateUrgente : fill(t.formulaire.aides.date, bounds)}
          </p>
          {e.date ? (
            <p id="champ-date-erreur" className={errorClasses}>
              {errorOf("date")}
            </p>
          ) : null}
        </div>
      )}

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
          aria-describedby={e.heure ? "champ-heure-erreur" : undefined}
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
        {e.heure ? (
          <p id="champ-heure-erreur" className={errorClasses}>
            {errorOf("heure")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="champ-heures-supplementaires" className={legend}>
          {t.formulaire.champs.heuresSupplementaires}
        </label>
        <Input
          key={`heures-supplementaires-${v?.heuresSupplementaires ?? ""}`}
          id="champ-heures-supplementaires"
          name="heuresSupplementaires"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_EXTRA_HOURS}
          step={1}
          defaultValue={v?.heuresSupplementaires || "0"}
          aria-invalid={e.heuresSupplementaires ? true : undefined}
          aria-describedby={[
            "champ-heures-supplementaires-aide",
            e.heuresSupplementaires ? "champ-heures-supplementaires-erreur" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          className="max-w-32"
        />
        <p id="champ-heures-supplementaires-aide" className={helpText}>
          {t.formulaire.aides.heuresSupplementaires}
        </p>
        {e.heuresSupplementaires ? (
          <p id="champ-heures-supplementaires-erreur" className={errorClasses}>
            {errorOf("heuresSupplementaires")}
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

      <fieldset
        className="flex flex-col gap-3"
        aria-describedby={e.alimentation ? "champ-alimentation-erreur" : undefined}
      >
        <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.alimentation}</legend>
        <div key={`alimentation-${v?.alimentation ?? ""}`} className="flex flex-wrap gap-6 px-2">
          {FEEDINGS.map((key) => (
            <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-encre-taupe">
              <input
                type="radio"
                name="alimentation"
                value={key}
                defaultChecked={v?.alimentation === key}
                required
                className="size-5 shrink-0 accent-sauge"
              />
              {t.formulaire.alimentation[key]}
            </label>
          ))}
        </div>
        {e.alimentation ? (
          <p id="champ-alimentation-erreur" className={errorClasses}>
            {errorOf("alimentation")}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="flex flex-col gap-6" aria-describedby="champ-adresse-aide">
        <legend className={cn(legend, "mb-2")}>{t.formulaire.champs.adresse}</legend>
        <p id="champ-adresse-aide" className="text-corps text-encre-taupe">
          {mode === "modification" ? t.formulaire.aides.adresseModification : t.formulaire.aides.adresse}
        </p>
        {mode === "modification" ? (
          // Not a form field: the commune stays as published.
          <div className="flex flex-col gap-2">
            <label htmlFor="champ-commune" className={legend}>
              {t.formulaire.champs.commune}
            </label>
            <Input
              id="champ-commune"
              value={commune ?? ""}
              readOnly
              aria-readonly
              aria-describedby="champ-commune-aide"
              className="bg-perle"
            />
            <p id="champ-commune-aide" className={helpText}>
              {t.formulaire.aides.nonModifiable}
            </p>
          </div>
        ) : (
          <CommuneCombobox
            // A refused form remounts the field with what was typed.
            key={`commune-${v?.commune ?? ""}`}
            name="commune"
            label={t.formulaire.champs.commune}
            help={f.aides.commune}
            error={errorOf("commune")}
            placeholder={f.commune.exemple}
            emptyText={f.commune.aucunResultat}
            listLabel={f.commune.liste}
            defaultValue={locality}
            defaultText={v?.commune && !locality ? v.commune : undefined}
          />
        )}
        <div
          key={`adresse-${v?.rue ?? ""}-${v?.numero ?? ""}-${v?.boite ?? ""}`}
          className="grid gap-6 md:grid-cols-[1fr_8rem_8rem]"
        >
          <Field
            name="rue"
            label={f.champs.rue}
            autoComplete="address-line1"
            defaultValue={v?.rue ?? ""}
            error={errorOf("rue")}
            required
          />
          <Field
            name="numero"
            label={f.champs.numero}
            defaultValue={v?.numero ?? ""}
            error={errorOf("numero")}
            required
          />
          <Field name="boite" label={f.champs.boite} defaultValue={v?.boite ?? ""} error={errorOf("boite")} />
        </div>
        <p className={helpText}>{t.formulaire.aides.commune}</p>
      </fieldset>

      <ReasonField
        // A refused form remounts the field with what was typed.
        key={`motif-${v?.motif ?? ""}`}
        defaultValue={v?.motif ?? ""}
        error={errorOf("motif")}
      />

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
