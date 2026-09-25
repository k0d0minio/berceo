"use client"

import { useActionState } from "react"

import { submitFile, type DeclarationsState } from "@/app/(portail)/espace/professionnelle/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import { DECLARATIONS } from "@/lib/professionnelle/rules"

/*
 * Step 4, "Validez vos déclarations" (B-07, D-6): the cahier des charges' four
 * sworn declarations and the criminal-record line, all required. Sending
 * stores one timestamped row per declaration with its wording version and puts
 * the file in review.
 */
function DeclarationsForm() {
  const [state, submit, pending] = useActionState<DeclarationsState, FormData>(submitFile, {})
  const t = words(professionnelle)

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      {state.message && state.message !== "enregistre" ? (
        <FormMessage>{t.erreurs[state.message]}</FormMessage>
      ) : null}

      <p className="text-corps text-encre-taupe">{t.declarations.intro}</p>

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">{t.etapes.titres.declarations}</legend>
        {DECLARATIONS.map((key) => (
          <label key={key} className="flex items-start gap-3 text-corps text-encre-taupe">
            <input
              type="checkbox"
              name="declarations"
              value={key}
              required
              defaultChecked={state.ticked?.includes(key)}
              className="mt-1 size-5 shrink-0 accent-sauge"
            />
            <span>{t.declarations.textes[key]}</span>
          </label>
        ))}
      </fieldset>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.boutons.enCours : t.declarations.envoyer}
      </Button>
    </form>
  )
}

export { DeclarationsForm }
