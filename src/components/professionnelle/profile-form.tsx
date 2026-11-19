"use client"

import * as React from "react"
import { useActionState } from "react"

import { saveProfile, type ProfileState } from "@/app/(portail)/espace/professionnelle/actions"
import { BlockingCount, Field, FieldError, FormMessage, useFocusFirstBlocking } from "@/components/auth/field"
import { FileSlot } from "@/components/professionnelle/file-slot"
import { CommunePicker } from "@/components/professionnelle/commune-picker"
import { Button } from "@/components/ui/button"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import type { Profession } from "@/db/schema"
import {
  BIO_MAX,
  EXTRA_HOUR_RATE_MIN,
  FORMATIONS_MAX,
  RATE_MIN,
  ZONE_CHOICES,
  zoneChoice,
  type Zone,
} from "@/lib/professionnelle/rules"

/*
 * Step 2, "Complétez votre profil", with the guide's labels, and the same form
 * on her file's page once submitted. Every field keeps what she typed when the
 * server refuses the form. "Enregistrer et reprendre plus tard" saves whatever
 * is valid, even an incomplete step (D-21); "Continuer" needs the step whole.
 * The photo uploads on its own as soon as she picks it. A refused step marks
 * each blocking field in red, counts them above the buttons and moves to the
 * first one (onboarding-retour-1).
 */

export type ProfileValues = {
  profession: Profession | null
  formationsComplementaires: string | null
  communes: string[]
  zone: Zone | null
  nightRateEur: number | null
  extraHourRateEur: number | null
  bio: string | null
}

const legend = "text-corps font-semibold text-taupe"

function ProfileForm({
  saved,
  photo,
  professions,
  mode,
  professionLocked,
}: {
  saved: ProfileValues
  photo: { id: string; fileName: string } | null
  /** The professions she may pick: the two student years only while the switch allows them. */
  professions: readonly Profession[]
  /** The onboarding's two buttons, or her file's single "Enregistrer". */
  mode: "onboarding" | "dossier"
  /** A validated file changes profession only once reopened. */
  professionLocked?: boolean
}) {
  const [state, submit, pending] = useActionState<ProfileState, FormData>(saveProfile, {})
  const t = words(professionnelle)
  const e = state.errors ?? {}
  const v = state.values
  const blocking = Object.values(e).filter(Boolean).length
  const form = React.useRef<HTMLFormElement>(null)
  useFocusFirstBlocking(form, state, blocking)
  const [bio, setBio] = React.useState(v?.bio ?? saved.bio ?? "")
  const [formations, setFormations] = React.useState(v?.formations ?? saved.formationsComplementaires ?? "")

  const profession = v?.profession ?? saved.profession ?? ""
  // A profile starts at her communes only (profil-zone-rayon-saisie).
  const rayon = v?.rayon || zoneChoice(saved.zone ?? { radiusKm: 0, wholeBelgium: false })
  const errorOf = (key: keyof typeof e) => (e[key] ? t.erreurs[e[key]!] : undefined)

  return (
    // A white card on the pearl page (JAM-327).
    <form
      ref={form}
      action={submit}
      noValidate
      className="flex max-w-2xl flex-col gap-8 rounded-carte bg-blanc px-6 py-8 md:px-10"
    >
      {state.message ? (
        <FormMessage>
          {state.message === "enregistre" ? t.messages.enregistre : t.erreurs[state.message]}
        </FormMessage>
      ) : null}

      {/*
        A locked profession still has to reach the server with the form. Outside
        the fieldset: a disabled fieldset disables every control in it, hidden
        inputs included.
      */}
      {professionLocked && saved.profession ? (
        <input type="hidden" name="profession" value={saved.profession} />
      ) : null}

      {/* An outline, not a border: it marks the group without moving it. */}
      <fieldset
        data-champ
        className={
          e.profession
            ? "flex flex-col gap-3 rounded-carte outline-1 outline-offset-8 outline-destructive"
            : "flex flex-col gap-3"
        }
        disabled={professionLocked}
        aria-describedby={e.profession ? "champ-profession-erreur" : undefined}
      >
        <legend className={legend}>{t.champs.profession}</legend>
        {professions.map((key) => (
          <label key={key} className="flex items-center gap-3 text-corps text-taupe">
            <input
              type="radio"
              name="profession"
              value={key}
              defaultChecked={profession === key}
              aria-invalid={e.profession ? true : undefined}
              className="size-5 shrink-0 accent-sauge"
            />
            {t.professions[key]}
          </label>
        ))}
        {e.profession ? (
          <FieldError id="champ-profession-erreur">{errorOf("profession")}</FieldError>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="champ-formations" className={legend}>
          {t.champs.formations}
        </label>
        <textarea
          id="champ-formations"
          name="formations"
          rows={3}
          value={formations}
          onChange={(event) => setFormations(event.target.value)}
          aria-invalid={e.formations ? true : undefined}
          aria-describedby={[
            "champ-formations-aide",
            "champ-formations-compteur",
            e.formations ? "champ-formations-erreur" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge aria-invalid:border-destructive"
        />
        <p id="champ-formations-aide" className="px-6 text-legende text-taupe">
          {t.aides.formations}
        </p>
        <p id="champ-formations-compteur" aria-live="polite" className="px-6 text-legende text-taupe">
          {fill(t.aides.formationsRestant, { n: String(FORMATIONS_MAX - formations.trim().length) })}
        </p>
        {e.formations ? (
          <FieldError id="champ-formations-erreur">{errorOf("formations")}</FieldError>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="champ-zone" className={legend}>
          {t.champs.zone}
        </label>
        <CommunePicker
          id="champ-zone"
          defaultValue={v?.communes ?? saved.communes}
          describedBy={["champ-zone-aide", e.communes ? "champ-zone-erreur" : ""].filter(Boolean).join(" ")}
          invalid={Boolean(e.communes)}
        />
        <p id="champ-zone-aide" className="px-6 text-legende text-taupe">
          {t.aides.zone}
        </p>
        {e.communes ? (
          <FieldError id="champ-zone-erreur">{errorOf("communes")}</FieldError>
        ) : null}
      </div>

      {/* The radius around her communes: seven choices, measured on the server. */}
      <fieldset
        data-champ
        className={
          e.rayon
            ? "flex flex-col gap-3 rounded-carte outline-1 outline-offset-8 outline-destructive"
            : "flex flex-col gap-3"
        }
        aria-describedby={["champ-rayon-aide", e.rayon ? "champ-rayon-erreur" : ""].filter(Boolean).join(" ")}
      >
        <legend className={legend}>{t.champs.rayon}</legend>
        {ZONE_CHOICES.map((choice) => (
          <label key={choice} className="flex items-center gap-3 text-corps text-taupe">
            <input
              type="radio"
              name="rayon"
              value={choice}
              defaultChecked={rayon === choice}
              className="size-5 shrink-0 accent-sauge"
            />
            {t.rayons[choice]}
          </label>
        ))}
        <p id="champ-rayon-aide" className="text-legende text-taupe">
          {t.aides.rayon}
        </p>
        {e.rayon ? <FieldError id="champ-rayon-erreur">{errorOf("rayon")}</FieldError> : null}
      </fieldset>

      <Field
        name="tarif"
        type="number"
        inputMode="numeric"
        min={RATE_MIN}
        step={1}
        label={t.champs.tarif}
        help={t.aides.tarif}
        defaultValue={v?.tarif ?? (saved.nightRateEur !== null ? String(saved.nightRateEur) : "")}
        error={errorOf("tarif")}
        className="max-w-48"
      />

      <Field
        name="tarifHeure"
        type="number"
        inputMode="numeric"
        min={EXTRA_HOUR_RATE_MIN}
        step={1}
        label={t.champs.tarifHeure}
        help={t.aides.tarifHeure}
        defaultValue={v?.tarifHeure ?? (saved.extraHourRateEur !== null ? String(saved.extraHourRateEur) : "")}
        error={errorOf("tarifHeure")}
        className="max-w-48"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="champ-bio" className={legend}>
          {t.champs.bio}
        </label>
        <textarea
          id="champ-bio"
          name="bio"
          rows={6}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          aria-invalid={e.bio ? true : undefined}
          aria-describedby={["champ-bio-aide", "champ-bio-compteur", e.bio ? "champ-bio-erreur" : ""]
            .filter(Boolean)
            .join(" ")}
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge aria-invalid:border-destructive"
        />
        <p id="champ-bio-aide" className="px-6 text-legende text-taupe">
          {t.aides.bio}
        </p>
        <p id="champ-bio-compteur" aria-live="polite" className="px-6 text-legende text-taupe">
          {fill(t.aides.bioRestant, { n: String(BIO_MAX - bio.trim().length) })}
        </p>
        {e.bio ? (
          <FieldError id="champ-bio-erreur">{errorOf("bio")}</FieldError>
        ) : null}
      </div>

      <FileSlot
        kind="photo"
        label={t.champs.photo}
        help={t.aides.photo}
        files={photo ? [photo] : []}
        error={errorOf("photo")}
      />

      <BlockingCount count={blocking} />

      <div className="flex flex-wrap gap-4">
        {mode === "onboarding" ? (
          <>
            <Button type="submit" name="intent" value="continuer" disabled={pending}>
              {pending ? t.boutons.enCours : t.boutons.continuer}
            </Button>
            <Button type="submit" name="intent" value="plus-tard" variant="raye" disabled={pending}>
              {t.boutons.plusTard}
            </Button>
          </>
        ) : (
          <Button type="submit" name="intent" value="enregistrer" disabled={pending}>
            {pending ? t.boutons.enCours : t.boutons.enregistrer}
          </Button>
        )}
      </div>
    </form>
  )
}

export { ProfileForm }
