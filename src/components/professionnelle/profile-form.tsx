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
import type { Experience, Profession } from "@/db/schema"
import { BIO_MAX, EXPERIENCES, RATE_MAX, RATE_MIN, SPECIALISATIONS } from "@/lib/professionnelle/rules"

/*
 * Step 2, "Complétez votre profil", with the guide's labels, and the same form
 * on her file's page once submitted. Every field keeps what she typed when the
 * server refuses the form. "Enregistrer et reprendre plus tard" saves whatever
 * is valid, even an incomplete step (D-21); "Continuer" needs the step whole.
 * The photo uploads on its own as soon as she picks it.
 */

export type ProfileValues = {
  profession: Profession | null
  specialisations: string[]
  communes: string[]
  nightRateEur: number | null
  experience: Experience | null
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
  /** The professions she may pick: the student option only while the switch allows it. */
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

  const profession = v?.profession ?? saved.profession ?? ""
  const specialisations = v?.specialisations ?? saved.specialisations
  const experience = v?.experience ?? saved.experience ?? ""
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

      <fieldset className="flex flex-col gap-3">
        <legend className={legend}>{t.champs.specialisations}</legend>
        <p className="px-6 text-legende text-encre-taupe">{t.aides.specialisations}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {SPECIALISATIONS.map((key) => (
            <label key={key} className="flex items-center gap-3 text-corps text-encre-taupe">
              <input
                type="checkbox"
                name="specialisations"
                value={key}
                defaultChecked={specialisations.includes(key)}
                className="size-5 shrink-0 accent-sauge"
              />
              {t.specialisations[key]}
            </label>
          ))}
        </div>
        {e.specialisations ? <p className={errorText}>{errorOf("specialisations")}</p> : null}
      </fieldset>

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
        max={RATE_MAX}
        step={1}
        label={t.champs.tarif}
        help={t.aides.tarif}
        defaultValue={v?.tarif ?? (saved.nightRateEur !== null ? String(saved.nightRateEur) : "")}
        error={errorOf("tarif")}
        className="max-w-48"
      />

      <fieldset className="flex flex-col gap-3">
        <legend className={legend}>{t.champs.experience}</legend>
        {EXPERIENCES.map((key) => (
          <label key={key} className="flex items-center gap-3 text-corps text-encre-taupe">
            <input
              type="radio"
              name="experience"
              value={key}
              defaultChecked={experience === key}
              className="size-5 shrink-0 accent-sauge"
            />
            {t.experiences[key]}
          </label>
        ))}
        {e.experience ? <p className={errorText}>{errorOf("experience")}</p> : null}
      </fieldset>

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
