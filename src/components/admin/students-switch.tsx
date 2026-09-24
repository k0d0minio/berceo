"use client"

import * as React from "react"
import { useTransition } from "react"

import { setStudents } from "@/app/(portail)/admin/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"

/*
 * "Accueillir les étudiantes sages-femmes" (D-7): off by default, flipped only
 * through the confirmation dialog (D-24), and the last change named with who
 * made it and when.
 */
function StudentsSwitch({
  value,
  changed,
}: {
  value: boolean
  /** The last change, already formatted, or null when never changed. */
  changed: { date: string; name: string } | null
}) {
  const t = words(admin).etudiantes
  const [pending, start] = useTransition()
  const [failed, setFailed] = React.useState(false)
  const next = !value

  return (
    <section className="flex flex-col gap-4 rounded-carte border border-solid border-perle bg-blanc p-8">
      <h2 className="font-display text-h3 text-sauge">{t.titre}</h2>
      <p className="max-w-2xl text-corps text-taupe">{t.description}</p>
      <p className="text-corps font-semibold text-taupe">{value ? t.active : t.desactive}</p>
      <p className="text-legende text-taupe">
        {changed ? fill(t.modifie, { date: changed.date, nom: changed.name }) : t.jamais}
      </p>
      {failed ? <FormMessage>{t.erreur}</FormMessage> : null}
      <ConfirmDialog
        trigger={
          <Button type="button" disabled={pending} className="self-start">
            {next ? t.activer : t.desactiver}
          </Button>
        }
        title={next ? t.confirmation.titreActiver : t.confirmation.titreDesactiver}
        description={next ? t.confirmation.descriptionActiver : t.confirmation.descriptionDesactiver}
        action={{
          label: t.confirmation.oui,
          tone: "confirmation",
          onSelect: () =>
            start(async () => {
              const result = await setStudents(next)
              setFailed(!result.ok)
            }),
        }}
        cancel={{ label: t.confirmation.non, tone: "sensible" }}
      />
    </section>
  )
}

export { StudentsSwitch }
