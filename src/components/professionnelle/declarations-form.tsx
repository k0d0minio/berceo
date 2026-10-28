"use client"

import { useActionState, useRef, type ReactNode } from "react"

import {
  renewDeclarations,
  submitFile,
  type DeclarationsState,
} from "@/app/(portail)/espace/professionnelle/actions"
import { BlockingCount, FieldError, FormMessage, useFocusFirstBlocking } from "@/components/auth/field"
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
 * `CHARTER_TITLE_ID`. A refused send marks each box left empty in red, counts
 * them above the button and moves to the first one (onboarding-retour-1).
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
  // The boxes left empty, once the server refused the send for them.
  const empty =
    state.message === "declarations" ? DECLARATIONS.filter((key) => !state.ticked?.includes(key)) : []
  const form = useRef<HTMLFormElement>(null)
  useFocusFirstBlocking(form, state, empty.length)

  const box = (key: (typeof DECLARATIONS)[number]) => {
    const blocks = empty.includes(key)
    const errorId = `declaration-${key}-erreur`
    return (
      <div key={key} className="flex flex-col gap-2">
        {/* An outline, not a border: it marks the box without moving the text. */}
        <label
          className={
            blocks
              ? "flex items-start gap-3 rounded-carte text-corps text-encre-taupe outline-1 outline-offset-4 outline-destructive"
              : "flex items-start gap-3 text-corps text-encre-taupe"
          }
        >
          <input
            type="checkbox"
            name="declarations"
            value={key}
            required
            defaultChecked={state.ticked?.includes(key)}
            aria-invalid={blocks ? true : undefined}
            aria-describedby={blocks ? errorId : undefined}
            className="mt-1 size-5 shrink-0 accent-sauge"
          />
          <span>{t.declarations.textes[key]}</span>
        </label>
        {blocks ? (
          <FieldError id={errorId} className="px-8">
            {t.erreurs.caseRequise}
          </FieldError>
        ) : null}
      </div>
    )
  }

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

      <BlockingCount count={empty.length} />

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.boutons.enCours : mode === "inscription" ? t.declarations.envoyer : t.declarations.confirmer}
      </Button>
    </form>
  )
}

export { DeclarationsForm }
