"use client"

import { useActionState, type ReactNode } from "react"

import {
  renewDeclarations,
  submitFile,
  type DeclarationsState,
} from "@/app/(portail)/espace/professionnelle/actions"
import { FormMessage } from "@/components/auth/field"
import { CHARTER_TITLE_ID } from "@/components/professionnelle/charte"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import { DECLARATIONS } from "@/lib/professionnelle/rules"

/*
 * Step 4, "Validez vos déclarations" (B-07, D-6, onboarding-retour-1): the six
 * sworn declarations, then « Charte des professionnelles Berceo » in full and
 * its own checkbox, all required. Sending stores one timestamped row per
 * checkbox with its wording version and puts the file in review. With
 * `mode="renouvellement"` the same block serves a submitted file whose
 * declarations carry an older version: it appends the new set and changes no
 * status. The charter comes rendered from the server page, its title carrying
 * `CHARTER_TITLE_ID`.
 */
function DeclarationsForm({
  mode = "inscription",
  charte,
}: {
  mode?: "inscription" | "renouvellement"
  charte: ReactNode
}) {
  const [state, submit, pending] = useActionState<DeclarationsState, FormData>(
    mode === "inscription" ? submitFile : renewDeclarations,
    {},
  )
  const t = words(professionnelle)

  const box = (key: (typeof DECLARATIONS)[number]) => (
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
  )

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      {state.message && state.message !== "enregistre" ? (
        <FormMessage>{t.erreurs[state.message]}</FormMessage>
      ) : null}

      <p className="text-corps text-encre-taupe">
        {mode === "inscription" ? t.declarations.intro : t.declarations.nouvellesIntro}
      </p>

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">{t.etapes.titres.declarations}</legend>
        {DECLARATIONS.filter((key) => key !== "charte").map(box)}
      </fieldset>

      {/* The charter in full, in a card she scrolls with the mouse or the keyboard. */}
      <section
        aria-labelledby={CHARTER_TITLE_ID}
        tabIndex={0}
        className="max-h-[32rem] overflow-y-auto rounded-carte bg-perle px-6 py-6 md:px-8"
      >
        {charte}
      </section>

      {box("charte")}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.boutons.enCours : mode === "inscription" ? t.declarations.envoyer : t.declarations.confirmer}
      </Button>
    </form>
  )
}

export { DeclarationsForm }
