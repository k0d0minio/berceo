"use client"

import Link from "next/link"
import { useActionState } from "react"

import type { NewPasswordState, ResetRequestState } from "@/app/(auth)/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { fieldError, formMessage } from "@/components/auth/messages"
import { Button } from "@/components/ui/button"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"

/*
 * "Mot de passe oublié" and the new-password page. The request always ends on
 * the guide's neutral line, so the form never says whether an address exists.
 */
function ResetRequestForm({
  action,
}: {
  action: (state: ResetRequestState, form: FormData) => Promise<ResetRequestState>
}) {
  const [state, submit, pending] = useActionState(action, {})
  const t = words(comptes)

  if (state.sent) {
    return (
      <div className="flex flex-col gap-6">
        <FormMessage>{t.motDePasseOublie.confirmation}</FormMessage>
        <Link href="/connexion" className="self-start text-corps text-encre-sauge underline">
          {t.motDePasseOublie.retour}
        </Link>
      </div>
    )
  }

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      <Field
        name="email"
        type="email"
        label={t.champs.email}
        autoComplete="email"
        defaultValue={state.email}
        error={state.invalid ? fieldError("email") : undefined}
        required
      />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.motDePasseOublie.enCours : t.motDePasseOublie.bouton}
      </Button>
      <Link href="/connexion" className="self-start text-corps text-encre-sauge underline">
        {t.motDePasseOublie.retour}
      </Link>
    </form>
  )
}

function NewPasswordForm({
  action,
}: {
  action: (state: NewPasswordState, form: FormData) => Promise<NewPasswordState>
}) {
  const [state, submit, pending] = useActionState(action, {})
  const t = words(comptes)
  const e = state.errors ?? {}

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      {state.message ? <FormMessage>{formMessage(state.message)}</FormMessage> : null}
      {state.message === "lienInvalide" ? (
        <Link href="/mot-de-passe-oublie" className="self-start text-corps text-encre-sauge underline">
          {t.connexion.oublie}
        </Link>
      ) : null}
      <Field
        name="motDePasse"
        type="password"
        label={t.champs.nouveauMotDePasse}
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
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.nouveauMotDePasse.enCours : t.nouveauMotDePasse.bouton}
      </Button>
    </form>
  )
}

export { NewPasswordForm, ResetRequestForm }
