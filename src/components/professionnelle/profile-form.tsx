"use client"

import * as React from "react"
import { useActionState } from "react"

import { saveProfile, type ProfileState } from "@/app/(portail)/espace/professionnelle/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { FileSlot } from "@/components/professionnelle/file-slot"
import { CommunePicker } from "@/components/professionnelle/commune-picker"
import { Button } from "@/components/ui/button"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import type { Profession } from "@/db/schema"
import { BIO_MAX, EXTRA_HOUR_RATE_MIN, FORMATIONS_MAX, RATE_MIN } from "@/lib/professionnelle/rules"

/*
 * Step 2, "Complétez votre profil", with the guide's labels, and the same form
 * on her file's page once submitted. Every field keeps what she typed when the
 * server refuses the form. "Enregistrer et reprendre plus tard" saves whatever
 * is valid, even an incomplete step (D-21); "Continuer" needs the step whole.
 * The photo uploads on its own as soon as she picks it.
 */

export type ProfileValues = {
  profession: Profession | null
  formationsComplementaires: string | null
  communes: string[]
  nightRateEur: number | null
  extraHourRateEur: number | null
  bio: string | null
}

const legend = "text-corps font-semibold text-encre-taupe"
const errorText = "px-6 text-legende font-semibold text-encre-taupe"

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
  const [bio, setBio] = React.useState(v?.bio ?? saved.bio ?? "")
  const [formations, setFormations] = React.useState(v?.formations ?? saved.formationsComplementaires ?? "")

  const profession = v?.profession ?? saved.profession ?? ""
  const errorOf = (key: keyof typeof e) => (e[key] ? t.erreurs[e[key]!] : undefined)

  return (
    <form action={submit} noValidate className="flex flex-col gap-8">
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

      <fieldset
        className="flex flex-col gap-3"
        disabled={professionLocked}
        aria-describedby={e.profession ? "champ-profession-erreur" : undefined}
      >
        <legend className={legend}>{t.champs.profession}</legend>
        {professions.map((key) => (
          <label key={key} className="flex items-center gap-3 text-corps text-encre-taupe">
            <input
              type="radio"
              name="profession"
              value={key}
              defaultChecked={profession === key}
              className="size-5 shrink-0 accent-sauge"
            />
            {t.professions[key]}
          </label>
        ))}
        {e.profession ? (
          <p id="champ-profession-erreur" className={errorText}>
            {errorOf("profession")}
          </p>
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
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge aria-invalid:border-destructive"
        />
        <p id="champ-formations-aide" className="px-6 text-legende text-encre-taupe">
          {t.aides.formations}
        </p>
        <p id="champ-formations-compteur" aria-live="polite" className="px-6 text-legende text-encre-taupe">
          {fill(t.aides.formationsRestant, { n: String(FORMATIONS_MAX - formations.trim().length) })}
        </p>
        {e.formations ? (
          <p id="champ-formations-erreur" className={errorText}>
            {errorOf("formations")}
          </p>
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
        <p id="champ-zone-aide" className="px-6 text-legende text-encre-taupe">
          {t.aides.zone}
        </p>
        {e.communes ? (
          <p id="champ-zone-erreur" className={errorText}>
            {errorOf("communes")}
          </p>
        ) : null}
      </div>

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
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge aria-invalid:border-destructive"
        />
        <p id="champ-bio-aide" className="px-6 text-legende text-encre-taupe">
          {t.aides.bio}
        </p>
        <p id="champ-bio-compteur" aria-live="polite" className="px-6 text-legende text-encre-taupe">
          {fill(t.aides.bioRestant, { n: String(BIO_MAX - bio.trim().length) })}
        </p>
        {e.bio ? (
          <p id="champ-bio-erreur" className={errorText}>
            {errorOf("bio")}
          </p>
        ) : null}
      </div>

      <FileSlot
        kind="photo"
        label={t.champs.photo}
        help={t.aides.photo}
        files={photo ? [photo] : []}
        error={errorOf("photo")}
      />

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
