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
import { endLine, extraHoursLabel, formatDate, formatTime } from "@/lib/demandes/format"
import {
  AGE_UNITS,
  EXTRA_HOURS,
  FEEDINGS,
  isStartTime,
  MAX_CHILDREN,
  MAX_SERIES_NIGHTS,
  parseExtraHours,
  REASON_MAX,
  REQUEST_KINDS,
  START_TIMES,
  type RequestKind,
} from "@/lib/demandes/rules"
import {
  childError,
  nightExtraField,
  nightStartField,
  splitNights,
  type ChildInput,
  type RequestError,
  type RequestField,
  type RequestInput,
} from "@/lib/demandes/validation"
import { nightName } from "@/lib/disponibilites/format"
import { characterCount } from "@/lib/famille/validation"
import { cn } from "@/lib/utils"

/*
 * The request form (the guide, "Les annonces"): the date in a month calendar
 * a phone can read, the start time, the extra hours by half hours with the
 * 11-hour note, the night's end computed and shown large (JAM-303), the
 * children, one to four, each with its own age, how they are fed (one answer
 * or more), the night's commune
 * and address with the address note, prefilled from her profile and hers to
 * change (demande-adresse-de-la-nuit), the optional reason with the founders'
 * help line and notice (demande-motif-facultatif), and the mandatory checkbox (D-20).
 * Three modes: a normal request, an urgent one (tonight or tomorrow night,
 * D-60), and an edit, which never shows the checkbox again nor changes the
 * commune or the urgency: the rue, the numéro and the boîte change. Published from a professional's profile, it carries her id and says
 * the request goes to her in priority. A normal request is « Nuit ponctuelle »
 * or « Nuits régulières » (demande-nuits-regulieres): regular nights replace
 * the date with a calendar where she ticks each night. Each night ticked then
 * has its own start, its own extra hours and its own end (JAM-303): no value
 * is copied from one night to another. The children, the feedings, the place
 * and the reason apply to every night. Validation is the server's; a refused
 * form keeps what was typed.
 */

export type RequestFormMode = "normale" | "urgente" | "modification"

const c = words(comptes)
const t = words(demandes)
const f = words(famille).profil

// The DA's field construction for a native select: same capsule as the input.
const selectClasses =
  "flex min-h-12 w-full min-w-0 appearance-none rounded-capsule border border-solid border-input bg-blanc px-6 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge focus-visible:outline-none aria-invalid:border-destructive"
const legend = "text-corps font-semibold text-taupe"
const helpText = "px-6 text-legende text-taupe"
const errorClasses = "px-6 text-legende font-semibold text-destructive"

/** The start times, as the options of one select. */
function StartOptions() {
  return (
    <>
      <option value="" disabled>
        {t.formulaire.choisirHeure}
      </option>
      {START_TIMES.map((time) => (
        <option key={time} value={time}>
          {formatTime(time)}
        </option>
      ))}
    </>
  )
}

/** The extra hours by half hours, as the options of one select: « Aucune », « 30 minutes », « 1 heure ». */
function ExtraOptions() {
  return (
    <>
      {EXTRA_HOURS.map((hours) => (
        <option key={hours} value={String(hours)}>
          {extraHoursLabel(hours)}
        </option>
      ))}
    </>
  )
}

/**
 * The night's end, computed from its start and its extra hours and shown large
 * (JAM-303), so a tired parent reads it in place of adding 11 hours herself.
 * The same rule as the server's and the card's: `endTime`.
 */
function EndTime({ start, extra }: { start: string; extra: string }) {
  const hours = parseExtraHours(extra)
  const fin = isStartTime(start) && !Number.isNaN(hours) ? endLine(start, hours) : ""
  return (
    <p aria-live="polite" className="px-2 text-h3 font-bold text-sauge">
      {fin ? fill(t.formulaire.aides.fin, { fin }) : t.formulaire.aides.finInconnue}
    </p>
  )
}

type NightHours = { heure: string; extra: string }
const NO_HOURS: NightHours = { heure: "", extra: "0" }
const NEW_CHILD: ChildInput = { ageValeur: "", ageUnite: "semaines" }

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
        className="w-full min-w-0 rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge focus-visible:outline-none aria-invalid:border-destructive"
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

  // One night: its start and its extra hours, held here so its end shows at once.
  const [start, setStart] = useState(v?.heure ?? "")
  const [extra, setExtra] = useState(v?.heuresSupplementaires || "0")
  // Regular nights: the nights ticked, and each night's own start and extra hours.
  const [nights, setNights] = useState<string[]>(() => splitNights(v?.nuits))
  const [hours, setHours] = useState<Record<string, NightHours>>(() =>
    Object.fromEntries(
      (v?.horaires ?? []).map((night) => [
        night.date,
        { heure: night.heure, extra: night.heuresSupplementaires || "0" },
      ])
    )
  )
  const [children, setChildren] = useState<ChildInput[]>(() =>
    v?.enfants && v.enfants.length > 0 ? v.enfants : [NEW_CHILD]
  )

  function setNightHours(date: string, change: Partial<NightHours>) {
    setHours((current) => ({ ...current, [date]: { ...(current[date] ?? NO_HOURS), ...change } }))
  }

  function setChild(index: number, change: Partial<ChildInput>) {
    setChildren((current) => current.map((child, i) => (i === index ? { ...child, ...change } : child)))
  }

  function errorOf(field: RequestField): string | undefined {
    const error: RequestError | undefined = e[field]
    if (error === undefined) return undefined
    // Each night's own hours and each child's own age have their own words.
    if (field === "horaires") return t.erreurs.horaires
    if (field === "enfants" && error === "requis") return t.erreurs.ageRequis
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
    // A white card on the pearl page (JAM-327): its pages put it straight on the page.
    <form
      action={submit}
      noValidate
      className="flex max-w-2xl flex-col gap-8 rounded-carte bg-blanc px-6 py-8 md:px-10"
    >
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
          <p className="text-corps font-semibold text-taupe">{priority.note}</p>
        </>
      ) : null}

      {mode === "normale" && seriesDates ? (
        <fieldset className="flex flex-col gap-3">
          <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.nature}</legend>
          <div className="flex flex-wrap gap-6 px-2">
            {REQUEST_KINDS.map((key) => (
              <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-taupe">
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
            // The nights held here: the calendar comes back with them after « Nuit ponctuelle ».
            defaultValue={nights.join(",")}
            multiple
            maxCount={MAX_SERIES_NIGHTS}
            onChange={setNights}
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

      {kind === "reguliere" && seriesDates ? (
        <fieldset
          className="flex flex-col gap-3"
          aria-describedby={["champ-horaires-aide", e.horaires ? "champ-horaires-erreur" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.horaires}</legend>
          <p id="champ-horaires-aide" className={helpText}>
            {nights.length > 0 ? t.formulaire.aides.horaires : t.formulaire.aides.horairesVide}{" "}
            {t.formulaire.aides.heuresSupplementaires}
          </p>
          <ul className="flex flex-col gap-6">
            {nights.map((date) => {
              const night = hours[date] ?? NO_HOURS
              // The server refused the form: the nights without a start are the ones to correct.
              const missing = Boolean(e.horaires) && !isStartTime(night.heure)
              return (
                <li
                  key={date}
                  className="flex flex-col gap-3 border-t border-solid border-taupe pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="text-corps font-semibold text-taupe">{nightName(date)}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`champ-${nightStartField(date)}`} className={helpText}>
                        {t.formulaire.champs.heure}
                      </label>
                      <select
                        id={`champ-${nightStartField(date)}`}
                        name={nightStartField(date)}
                        value={night.heure}
                        onChange={(event) => setNightHours(date, { heure: event.target.value })}
                        required
                        aria-invalid={missing ? true : undefined}
                        className={selectClasses}
                      >
                        <StartOptions />
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`champ-${nightExtraField(date)}`} className={helpText}>
                        {t.formulaire.champs.heuresSupplementaires}
                      </label>
                      <select
                        id={`champ-${nightExtraField(date)}`}
                        name={nightExtraField(date)}
                        value={night.extra}
                        onChange={(event) => setNightHours(date, { extra: event.target.value })}
                        className={selectClasses}
                      >
                        <ExtraOptions />
                      </select>
                    </div>
                  </div>
                  <EndTime start={night.heure} extra={night.extra} />
                </li>
              )
            })}
          </ul>
          {e.horaires ? (
            <p id="champ-horaires-erreur" className={errorClasses}>
              {errorOf("horaires")}
            </p>
          ) : null}
        </fieldset>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="champ-heure" className={legend}>
              {t.formulaire.champs.heure}
            </label>
            <select
              id="champ-heure"
              name="heure"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              required
              aria-invalid={e.heure ? true : undefined}
              aria-describedby={e.heure ? "champ-heure-erreur" : undefined}
              className={selectClasses}
            >
              <StartOptions />
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
            <select
              id="champ-heures-supplementaires"
              name="heuresSupplementaires"
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
              aria-invalid={e.heuresSupplementaires ? true : undefined}
              aria-describedby={[
                "champ-heures-supplementaires-aide",
                e.heuresSupplementaires ? "champ-heures-supplementaires-erreur" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              className={cn(selectClasses, "max-w-xs")}
            >
              <ExtraOptions />
            </select>
            <p id="champ-heures-supplementaires-aide" className={helpText}>
              {t.formulaire.aides.heuresSupplementaires}
            </p>
            {e.heuresSupplementaires ? (
              <p id="champ-heures-supplementaires-erreur" className={errorClasses}>
                {errorOf("heuresSupplementaires")}
              </p>
            ) : null}
            <EndTime start={start} extra={extra} />
          </div>
        </>
      )}

      <fieldset
        className="flex flex-col gap-3"
        aria-describedby={["champ-enfants-aide", e.enfants ? "champ-enfants-erreur" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.enfants}</legend>
        <p id="champ-enfants-aide" className={helpText}>
          {t.formulaire.aides.enfants} {t.formulaire.aides.age}
        </p>
        <ul className="flex flex-col gap-4">
          {children.map((child, index) => {
            const n = String(index + 1)
            const name = fill(t.formulaire.enfants.enfant, { n })
            // The server refused the form: the same rule marks the child to correct.
            const invalid = Boolean(e.enfants) && childError(child) !== null
            return (
              // The rows hold no state of their own: the index is a stable key.
              <li key={index} className="flex flex-col gap-2">
                <p className="px-2 text-corps font-semibold text-taupe">{name}</p>
                <div className="grid grid-cols-[6rem_1fr] items-center gap-3 sm:grid-cols-[6rem_1fr_auto]">
                  <Input
                    name="ageValeur"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    aria-label={`${name}, ${t.formulaire.champs.ageValeur}`}
                    aria-invalid={invalid ? true : undefined}
                    value={child.ageValeur}
                    onChange={(event) => setChild(index, { ageValeur: event.target.value })}
                    required
                  />
                  <select
                    name="ageUnite"
                    aria-label={`${name}, ${t.formulaire.champs.ageUnite}`}
                    aria-invalid={invalid ? true : undefined}
                    value={child.ageUnite || "semaines"}
                    onChange={(event) => setChild(index, { ageUnite: event.target.value })}
                    className={selectClasses}
                  >
                    {AGE_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {t.formulaire.unites[unit]}
                      </option>
                    ))}
                  </select>
                  {children.length > 1 ? (
                    <button
                      type="button"
                      aria-label={fill(t.formulaire.enfants.retirerEnfant, { n })}
                      onClick={() => setChildren((current) => current.filter((_, i) => i !== index))}
                      className="col-span-2 min-h-11 w-fit rounded-md px-2 text-corps font-semibold text-sauge underline underline-offset-4 sm:col-span-1"
                    >
                      {t.formulaire.enfants.retirer}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
        {children.length < MAX_CHILDREN ? (
          <Button
            type="button"
            variant="blanc"
            className="self-start"
            onClick={() => setChildren((current) => [...current, NEW_CHILD])}
          >
            {t.formulaire.enfants.ajouter}
          </Button>
        ) : null}
        {e.enfants ? (
          <p id="champ-enfants-erreur" className={errorClasses}>
            {errorOf("enfants")}
          </p>
        ) : null}
      </fieldset>

      <fieldset
        className="flex flex-col gap-3"
        aria-describedby={["champ-alimentation-aide", e.alimentation ? "champ-alimentation-erreur" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <legend className={cn(legend, "mb-3")}>{t.formulaire.champs.alimentation}</legend>
        <p id="champ-alimentation-aide" className={helpText}>
          {t.formulaire.aides.alimentation}
        </p>
        <div key={`alimentation-${(v?.alimentation ?? []).join("-")}`} className="flex flex-wrap gap-x-6 gap-y-1 px-2">
          {FEEDINGS.map((key) => (
            <label key={key} className="flex min-h-12 items-center gap-3 text-corps text-taupe">
              <input
                type="checkbox"
                name="alimentation"
                value={key}
                defaultChecked={v?.alimentation?.includes(key)}
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
        <p id="champ-adresse-aide" className="text-corps text-taupe">
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
          <label className="flex items-start gap-3 text-corps text-taupe">
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
