"use client"

import { useActionState } from "react"

import { saveDocuments, type DocumentsState } from "@/app/(portail)/espace/professionnelle/actions"
import { Field, FormMessage } from "@/components/auth/field"
import { FileSlot } from "@/components/professionnelle/file-slot"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import type { Profession } from "@/db/schema"
import { REQUIREMENTS } from "@/lib/professionnelle/rules"

/*
 * Step 3, "Déposez vos justificatifs" (D-5, D-6): exactly the documents her
 * profession requires, one to three files each, and her INAMI number where it
 * applies. The criminal record is not here: it is a declaration at step 4.
 * The files upload on their own; the form carries the INAMI number and the
 * way forward.
 */

type Stored = { id: string; fileName: string }

function DocumentsForm({
  profession,
  inamiNumber,
  files,
  mode,
  locked,
}: {
  profession: Profession
  inamiNumber: string | null
  files: { diplome: Stored[]; attestation_inscription: Stored[] }
  mode: "onboarding" | "dossier"
  /** A validated file changes its documents only once reopened. */
  locked?: boolean
}) {
  const [state, submit, pending] = useActionState<DocumentsState, FormData>(saveDocuments, {})
  const t = words(professionnelle)
  const e = state.errors ?? {}
  const requirement = REQUIREMENTS[profession]

  return (
    <form action={submit} noValidate className="flex flex-col gap-8">
      {state.message ? (
        <FormMessage>
          {state.message === "enregistre" ? t.messages.enregistre : t.erreurs[state.message]}
        </FormMessage>
      ) : null}

      {requirement.documents.map((kind) => (
        <FileSlot
          key={kind}
          kind={kind}
          label={t.justificatifs.documents[profession]}
          help={t.aides.documents}
          files={files[kind]}
          error={e[kind] ? t.erreurs[e[kind]!] : undefined}
          disabled={locked}
        />
      ))}

      {requirement.inami ? (
        <Field
          name="inami"
          inputMode="numeric"
          autoComplete="off"
          label={t.champs.inami}
          help={t.aides.inami}
          defaultValue={state.values?.inami ?? inamiNumber ?? ""}
          error={e.inami ? t.erreurs[e.inami] : undefined}
          readOnly={locked}
          className="max-w-72"
        />
      ) : null}

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
        ) : requirement.inami && !locked ? (
          <Button type="submit" name="intent" value="enregistrer" disabled={pending}>
            {pending ? t.boutons.enCours : t.boutons.enregistrer}
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export { DocumentsForm }
