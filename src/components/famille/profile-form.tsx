"use client"

import * as React from "react"
import { useActionState } from "react"

import type { ProfileState } from "@/app/(portail)/espace/famille/profil/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { CommuneCombobox } from "@/components/famille/commune-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comptes } from "@/content/comptes"
import { famille } from "@/content/famille"
import { fill, words } from "@/content/locale"
import { parseLocalityValue, type Locality } from "@/lib/communes"
import { CONTEXT_MAX } from "@/lib/famille/limits"
import { characterCount, type ProfileError } from "@/lib/famille/validation"

/*
 * The family's profile form: her details (the e-mail shown, not editable), her
 * commune and optional address, and an optional line about the family. The
 * same form serves the first completion and every edit. Validation is the
 * server's; a refused form keeps what was typed.
 */

export type ProfileDefaults = {
  prenom: string
  nom: string
  email: string
  telephone: string
  locality: Locality | null
  rue: string
  numero: string
  boite: string
  contexte: string
}

const c = words(comptes)
const t = words(famille).profil

function errorText(error: ProfileError | undefined): string | undefined {
  if (error === undefined) return undefined
  if (error === "requis" || error === "telephone") return c.erreurs[error]
  return t.erreurs[error]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-h3 text-encre-sauge">{children}</h2>
}

function ProfileForm({
  action,
  defaults,
}: {
  action: (state: ProfileState, form: FormData) => Promise<ProfileState>
  defaults: ProfileDefaults
}) {
  const [state, submit, pending] = useActionState(action, {})
  const e = state.errors ?? {}
  // A refused form shows what was typed; otherwise what is stored.
  const v = state.values
  const [contexte, setContexte] = React.useState(v?.contexte ?? defaults.contexte)
  const locality = v ? parseLocalityValue(v.commune) : defaults.locality

  return (
    <form action={submit} noValidate className="flex max-w-2xl flex-col gap-10">
      {state.message ? <FormMessage>{c.erreurs[state.message]}</FormMessage> : null}
      {state.saved ? <FormMessage>{t.enregistre}</FormMessage> : null}

      <section className="flex flex-col gap-6">
        <SectionTitle>{t.sections.coordonnees}</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            name="prenom"
            label={c.champs.prenom}
            autoComplete="given-name"
            defaultValue={v?.prenom ?? defaults.prenom}
            error={errorText(e.prenom)}
            required
          />
          <Field
            name="nom"
            label={c.champs.nom}
            autoComplete="family-name"
            defaultValue={v?.nom ?? defaults.nom}
            error={errorText(e.nom)}
            required
          />
        </div>
        {/* Not a form field: the server never reads an e-mail from this form. */}
        <div className="flex flex-col gap-2">
          <label htmlFor="champ-email" className="text-corps font-semibold text-encre-taupe">
            {c.champs.email}
          </label>
          <Input
            id="champ-email"
            type="email"
            value={defaults.email}
            readOnly
            aria-readonly
            aria-describedby="champ-email-aide"
            className="bg-perle"
          />
          <p id="champ-email-aide" className="px-6 text-legende text-encre-taupe">
            {t.aides.email}
          </p>
        </div>
        <Field
          name="telephone"
          type="tel"
          label={c.champs.telephone}
          autoComplete="tel"
          defaultValue={v?.telephone ?? defaults.telephone}
          error={errorText(e.telephone)}
          required
        />
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle>{t.sections.adresse}</SectionTitle>
        <CommuneCombobox
          // A refused form remounts the field with what was typed.
          key={v?.commune ?? "stored"}
          name="commune"
          label={t.champs.commune}
          help={t.aides.commune}
          error={errorText(e.commune)}
          placeholder={t.commune.exemple}
          emptyText={t.commune.aucunResultat}
          listLabel={t.commune.liste}
          defaultValue={locality}
          defaultText={v && !locality ? v.commune : undefined}
        />
        <p className="text-corps text-encre-taupe">{t.aides.adresse}</p>
        <div className="grid gap-6 md:grid-cols-[1fr_8rem_8rem]">
          <Field
            name="rue"
            label={t.champs.rue}
            autoComplete="address-line1"
            defaultValue={v?.rue ?? defaults.rue}
            error={errorText(e.rue)}
          />
          <Field
            name="numero"
            label={t.champs.numero}
            defaultValue={v?.numero ?? defaults.numero}
            error={errorText(e.numero)}
          />
          <Field
            name="boite"
            label={t.champs.boite}
            defaultValue={v?.boite ?? defaults.boite}
            error={errorText(e.boite)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle>{t.sections.famille}</SectionTitle>
        <div className="flex flex-col gap-2">
          <label htmlFor="champ-contexte" className="text-corps font-semibold text-encre-taupe">
            {t.champs.contexte}
          </label>
          <textarea
            id="champ-contexte"
            name="contexte"
            rows={4}
            value={contexte}
            onChange={(event) => setContexte(event.target.value)}
            aria-invalid={e.contexte ? true : undefined}
            aria-describedby={["champ-contexte-aide", e.contexte ? "champ-contexte-erreur" : ""]
              .filter(Boolean)
              .join(" ")}
            className="w-full min-w-0 rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge focus-visible:outline-none aria-invalid:border-destructive"
          />
          <p id="champ-contexte-aide" className="px-6 text-legende text-encre-taupe">
            {t.aides.contexte}{" "}
            <span aria-live="polite">
              {fill(t.aides.compteur, { n: String(characterCount(contexte.trim())) })}
            </span>
          </p>
          {e.contexte ? (
            <p id="champ-contexte-erreur" className="px-6 text-legende font-semibold text-encre-taupe">
              {errorText(e.contexte)}
            </p>
          ) : characterCount(contexte.trim()) > CONTEXT_MAX ? (
            <p className="px-6 text-legende font-semibold text-encre-taupe">{t.erreurs.contexteLong}</p>
          ) : null}
        </div>
      </section>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.enCours : t.bouton}
      </Button>
    </form>
  )
}

export { ProfileForm }
