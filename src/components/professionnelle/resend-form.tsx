"use client"

import { useActionState } from "react"

import { resendFile, type ResendState } from "@/app/(portail)/espace/professionnelle/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"

/*
 * A complément was asked (verification-back-office, D-50): the founders'
 * reason, and "Renvoyer mon dossier" once she has completed her file. The file
 * goes back to them in its place in the queue; no declaration is asked again.
 */
function ResendForm({ reason }: { reason: string | null }) {
  const t = words(professionnelle)
  const [state, submit, pending] = useActionState<ResendState, FormData>(resendFile, {})

  return (
    <form
      action={submit}
      className="flex flex-col gap-4 rounded-carte border border-solid border-perle bg-blanc p-8"
    >
      <h2 className="font-display text-h3 text-sauge">{t.renvoi.titre}</h2>
      {reason ? <p className="max-w-2xl text-corps text-taupe">{fill(t.messages.motif, { motif: reason })}</p> : null}
      <p className="max-w-2xl text-corps text-taupe">{t.renvoi.aide}</p>
      {state.message ? (
        <FormMessage>{state.message === "incomplet" ? t.renvoi.incomplet : t.erreurs.generique}</FormMessage>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.renvoi.enCours : t.renvoi.bouton}
      </Button>
    </form>
  )
}

export { ResendForm }
