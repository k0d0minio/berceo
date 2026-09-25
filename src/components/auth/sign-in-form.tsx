"use client"

import Link from "next/link"
import { useActionState } from "react"

import { resendVerification, type SignInState } from "@/app/(auth)/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { formMessage } from "@/components/auth/messages"
import { Button } from "@/components/ui/button"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"

/*
 * The guide's sign-in: two fields and "Mot de passe oublié ?". A wrong e-mail
 * or password gets one message that never says which. An unconfirmed address
 * gets its own message and a button that resends the link.
 */
function SignInForm({
  action,
  notice,
}: {
  action: (state: SignInState, form: FormData) => Promise<SignInState>
  /** A message carried in by the URL (an expired link, a changed password). */
  notice?: string
}) {
  const [state, submit, pending] = useActionState(action, {})
  const t = words(comptes)
  const message = formMessage(state.message) ?? notice

  return (
    <div className="flex flex-col gap-6">
      <form action={submit} noValidate className="flex flex-col gap-6">
        {message ? <FormMessage>{message}</FormMessage> : null}
        <Field
          name="email"
          type="email"
          label={t.champs.email}
          autoComplete="email"
          defaultValue={state.email}
          required
        />
        <Field
          name="motDePasse"
          type="password"
          label={t.champs.motDePasse}
          autoComplete="current-password"
          required
        />
        <Link href="/mot-de-passe-oublie" className="self-start text-corps text-encre-sauge underline">
          {t.connexion.oublie}
        </Link>
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? t.connexion.enCours : t.connexion.bouton}
        </Button>
      </form>

      {state.message === "nonVerifie" ? (
        <form action={resendVerification}>
          <input type="hidden" name="email" value={state.email ?? ""} />
          <Button type="submit" variant="blanc">
            {t.connexion.renvoyer}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

export { SignInForm }
