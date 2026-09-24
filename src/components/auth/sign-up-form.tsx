"use client"

import Link from "next/link"
import { useActionState } from "react"

import type { SignUpState } from "@/app/(auth)/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { fieldError, formMessage } from "@/components/auth/messages"
import { Button } from "@/components/ui/button"
import { common } from "@/content/common"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"

/*
 * The short sign-up form both roles share (D-21: a professional's account
 * first, onboarding after). The guide's six fields and helper lines, one
 * required consent checkbox linking the two legal pages, "Créer mon compte".
 * Validation is the server's; a refused form keeps what was typed, minus the
 * passwords.
 */
function SignUpForm({
  action,
}: {
  action: (state: SignUpState, form: FormData) => Promise<SignUpState>
}) {
  const [state, submit, pending] = useActionState(action, {})
  const t = words(comptes)
  const pages = words(common).pages
  const e = state.errors ?? {}
  const v = state.values

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      {state.message ? <FormMessage>{formMessage(state.message)}</FormMessage> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          name="prenom"
          label={t.champs.prenom}
          autoComplete="given-name"
          defaultValue={v?.prenom}
          error={fieldError(e.prenom)}
          required
        />
        <Field
          name="nom"
          label={t.champs.nom}
          autoComplete="family-name"
          defaultValue={v?.nom}
          error={fieldError(e.nom)}
          required
        />
      </div>
      <Field
        name="email"
        type="email"
        label={t.champs.email}
        autoComplete="email"
        help={t.aides.email}
        defaultValue={v?.email}
        error={fieldError(e.email)}
        required
      />
      <Field
        name="telephone"
        type="tel"
        label={t.champs.telephone}
        autoComplete="tel"
        help={t.aides.telephone}
        defaultValue={v?.telephone}
        error={fieldError(e.telephone)}
        required
      />
      <Field
        name="motDePasse"
        type="password"
        label={t.champs.motDePasse}
        autoComplete="new-password"
        help={t.aides.motDePasse}
        error={fieldError(e.motDePasse)}
        required
      />
      <Field
        name="confirmation"
        type="password"
        label={t.champs.confirmation}
        autoComplete="new-password"
        error={fieldError(e.confirmation)}
        required
      />

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-corps text-taupe">
          <input
            type="checkbox"
            name="consentement"
            required
            aria-invalid={e.consentement ? true : undefined}
            aria-describedby={e.consentement ? "champ-consentement-erreur" : undefined}
            className="mt-1 size-5 shrink-0 accent-sauge"
          />
          <span>
            {t.inscription.consentement.avant}
            <Link href={pages.conditionsGenerales.href} className="text-sauge underline">
              {t.inscription.consentement.cgu}
            </Link>
            {t.inscription.consentement.entre}
            <Link href={pages.confidentialite.href} className="text-sauge underline">
              {t.inscription.consentement.confidentialite}
            </Link>
            {t.inscription.consentement.apres}
          </span>
        </label>
        {e.consentement ? (
          <p id="champ-consentement-erreur" className="px-8 text-legende font-semibold text-taupe">
            {fieldError(e.consentement)}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.inscription.enCours : t.inscription.bouton}
      </Button>

      <p className="text-corps text-taupe">
        {t.inscription.dejaInscrit}{" "}
        <Link href="/connexion" className="text-sauge underline">
          {t.inscription.seConnecter}
        </Link>
      </p>
    </form>
  )
}

export { SignUpForm }
