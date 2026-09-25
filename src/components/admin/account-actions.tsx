"use client"

import * as React from "react"
import { useTransition } from "react"

import {
  contactAction,
  deleteAction,
  reactivateAction,
  suspendAction,
} from "@/app/(portail)/admin/utilisateurs/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import {
  CONTACT_MESSAGE_MAX,
  CONTACT_SUBJECT_MAX,
  checkContact,
  confirmsLastName,
  type AccountRefusal,
  type ContactError,
} from "@/lib/admin/rules"

const field =
  "w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-encre-sauge aria-invalid:border-destructive"

/*
 * The guide's actions on an account (« Contacter l'utilisateur », « Suspendre
 * le compte » or « Réactiver le compte », « Supprimer le compte »), each
 * behind a confirmation that shows the person's name (the guide; D-24: red
 * for the sensitive answer, green for the confirming one). Suspending lists
 * the gardes it leaves standing (D-134); deleting asks for her last name
 * (D-136). Every rule is checked here for a quick answer and again on the
 * server; the result is said above the buttons.
 */
function AccountActions({
  userId,
  name,
  lastName,
  suspended,
  deleteBlocked,
  upcoming,
}: {
  userId: string
  /** « Prénom Nom », for every dialog. */
  name: string
  lastName: string
  suspended: boolean
  /** Why « Supprimer le compte » is not offered, or null when it is. */
  deleteBlocked: "nonSuspendu" | "gardesAVenir" | null
  /** Her gardes still standing, one line each, for the suspension dialog. */
  upcoming: string[]
}) {
  const t = words(admin).actionsCompte
  const c = t.confirmation
  const [pending, start] = useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  const run = (act: () => Promise<{ ok: true } | { ok: false; error: AccountRefusal | "introuvable" | "generique" | "nomDifferent" }>, done: string) =>
    start(async () => {
      const result = await act()
      setMessage(result.ok ? done : t.erreurs[result.error])
    })

  return (
    <div className="flex flex-col gap-4">
      {message ? <FormMessage>{message}</FormMessage> : null}
      <div className="flex flex-wrap gap-4">
        <ContactDialog userId={userId} name={name} disabled={pending} onSent={() => setMessage(t.resultats.contacte)} />

        {suspended ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="raye" disabled={pending}>
                {t.reactiver}
              </Button>
            }
            title={fill(c.reactiverTitre, { nom: name })}
            description={fill(c.reactiver, { nom: name })}
            action={{
              label: c.oui,
              tone: "confirmation",
              onSelect: () => run(() => reactivateAction(userId), t.resultats.reactive),
            }}
            cancel={{ label: c.non, tone: "sensible" }}
          />
        ) : (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="raye" disabled={pending}>
                {t.suspendre}
              </Button>
            }
            title={fill(c.suspendreTitre, { nom: name })}
            description={fill(c.suspendre, { nom: name })}
            action={{
              label: c.oui,
              tone: "sensible",
              onSelect: () => run(() => suspendAction(userId), t.resultats.suspendu),
            }}
            cancel={{ label: c.non, tone: "confirmation" }}
          >
            {upcoming.length > 0 ? (
              <div className="flex flex-col gap-2 text-corps text-encre-taupe">
                <p className="font-semibold">{c.suspendreGardes}</p>
                <ul className="flex list-disc flex-col gap-1 pl-6">
                  {upcoming.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ConfirmDialog>
        )}

        {deleteBlocked ? (
          <div className="flex flex-col gap-1">
            <Button type="button" variant="raye" disabled aria-describedby={`${userId}-suppression`}>
              {t.supprimer}
            </Button>
            <p id={`${userId}-suppression`} className="px-2 text-legende text-encre-taupe">
              {t.indisponible[deleteBlocked]}
            </p>
          </div>
        ) : (
          <DeleteDialog
            name={name}
            lastName={lastName}
            disabled={pending}
            onConfirm={(typed) => run(() => deleteAction(userId, typed), t.resultats.supprime)}
          />
        )}
      </div>
    </div>
  )
}

/** « Supprimer le compte »: stays open until her last name is typed as it is on the account. */
function DeleteDialog({
  name,
  lastName,
  disabled,
  onConfirm,
}: {
  name: string
  lastName: string
  disabled: boolean
  onConfirm: (typed: string) => void
}) {
  const t = words(admin).actionsCompte
  const c = t.confirmation
  const id = React.useId()
  const [typed, setTyped] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="raye" disabled={disabled}>
          {t.supprimer}
        </Button>
      }
      title={fill(c.supprimerTitre, { nom: name })}
      description={c.supprimer}
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
          setTyped("")
        }
      }}
      action={{
        label: c.oui,
        tone: "sensible",
        onSelect: (event) => {
          if (!confirmsLastName(typed, lastName)) {
            event.preventDefault()
            setError(t.erreurs.nomDifferent)
            return
          }
          onConfirm(typed)
        },
      }}
      cancel={{ label: c.non, tone: "confirmation" }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-nom`} className="text-corps font-semibold text-encre-taupe">
          {fill(c.nom, { nom: lastName })}
        </label>
        <Input
          id={`${id}-nom`}
          value={typed}
          autoComplete="off"
          onChange={(event) => setTyped(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erreur` : undefined}
        />
        {error ? (
          <p id={`${id}-erreur`} role="alert" className="px-6 text-legende font-semibold text-encre-taupe">
            {error}
          </p>
        ) : null}
      </div>
    </ConfirmDialog>
  )
}

/** « Contacter l'utilisateur »: a subject and a message, checked here and on the server (D-138). */
function ContactDialog({
  userId,
  name,
  disabled,
  onSent,
}: {
  userId: string
  name: string
  disabled: boolean
  onSent: () => void
}) {
  const t = words(admin).actionsCompte
  const k = t.contact
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<Partial<Record<"subject" | "message", ContactError>>>({})
  const [failure, setFailure] = React.useState<string | null>(null)
  const [sending, start] = useTransition()

  const send = (event: React.MouseEvent<HTMLButtonElement>) => {
    // The dialog stays open until the server says the e-mail left.
    event.preventDefault()
    const checked = checkContact({ subject, message })
    if (!checked.ok) {
      setErrors(checked.errors)
      return
    }
    setErrors({})
    start(async () => {
      const result = await contactAction(userId, checked.value)
      if (result.ok) {
        setOpen(false)
        setSubject("")
        setMessage("")
        onSent()
      } else if ("errors" in result) {
        setErrors(result.errors)
      } else {
        setFailure(t.erreurs[result.error])
      }
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setErrors({})
          setFailure(null)
        }
      }}
      trigger={
        <Button type="button" disabled={disabled}>
          {t.contacter}
        </Button>
      }
      title={fill(k.titre, { nom: name })}
      description={k.description}
      action={{ label: k.envoyer, tone: "confirmation", onSelect: sending ? (event) => event.preventDefault() : send }}
      cancel={{ label: k.annuler, tone: "sensible" }}
    >
      <div className="flex flex-col gap-4">
        {failure ? <FormMessage>{failure}</FormMessage> : null}
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-objet`} className="text-corps font-semibold text-encre-taupe">
            {k.objet}
          </label>
          <Input
            id={`${id}-objet`}
            value={subject}
            maxLength={CONTACT_SUBJECT_MAX}
            onChange={(event) => setSubject(event.target.value)}
            aria-invalid={errors.subject ? true : undefined}
            aria-describedby={errors.subject ? `${id}-objet-erreur` : undefined}
          />
          {errors.subject ? (
            <p id={`${id}-objet-erreur`} role="alert" className="px-6 text-legende font-semibold text-encre-taupe">
              {k.erreurs[errors.subject]}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-message`} className="text-corps font-semibold text-encre-taupe">
            {k.message}
          </label>
          <textarea
            id={`${id}-message`}
            rows={8}
            maxLength={CONTACT_MESSAGE_MAX}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={[`${id}-aide`, errors.message ? `${id}-message-erreur` : ""].filter(Boolean).join(" ")}
            className={field}
          />
          <p id={`${id}-aide`} className="px-6 text-legende text-encre-taupe">
            {k.messageAide}
          </p>
          {errors.message ? (
            <p id={`${id}-message-erreur`} role="alert" className="px-6 text-legende font-semibold text-encre-taupe">
              {k.erreurs[errors.message]}
            </p>
          ) : null}
        </div>
      </div>
    </ConfirmDialog>
  )
}

export { AccountActions }
