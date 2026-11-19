"use client"

import { useActionState } from "react"

import { signOut, type SignInCodeState } from "@/app/(auth)/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { formMessage } from "@/components/auth/messages"
import { Button } from "@/components/ui/button"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"

/*
 * The code page's form (comptes-2fa): one field for the six digits, « Valider
 * le code », « Renvoyer le code » on the same action with its intention, and
 * « Se déconnecter » for who cannot reach the mailbox now. One message at a
 * time, from the last answer.
 */
function SignInCodeForm({
  action,
  notice,
}: {
  action: (state: SignInCodeState, form: FormData) => Promise<SignInCodeState>
  /** What the page already knows: the e-mail did not leave. */
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
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          label={t.code.champ}
          help={t.verification.aide}
          required
        />
        <div className="flex flex-wrap gap-4">
          <Button type="submit" name="intention" value="valider" disabled={pending}>
            {pending ? t.code.enCours : t.code.bouton}
          </Button>
          <Button type="submit" name="intention" value="renvoyer" variant="blanc" disabled={pending} formNoValidate>
            {t.code.renvoyer}
          </Button>
        </div>
      </form>

      <form action={signOut}>
        <button type="submit" className="text-corps text-sauge underline">
          {t.code.deconnexion}
        </button>
      </form>
    </div>
  )
}

export { SignInCodeForm }
