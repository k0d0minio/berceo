"use client"

import { useActionState } from "react"

import { Field, FieldError, FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { contact } from "@/content/contact"
import { words } from "@/content/locale"
import { MESSAGE_MAX, TRAP_FIELD } from "@/lib/contact/rules"
import type { ContactState } from "@/lib/contact/send"

/*
 * The contact form (JAM-327): the name, the e-mail address and the message,
 * the DA's capsule fields and its button on white. A field that blocks the
 * form shows in red. After the send the form gives way to the confirmation;
 * after a failed send, or a message past the send limit (JAM-341), it keeps
 * what was typed. The trap field is off screen
 * and out of the tab order: a person never fills it.
 */
function ContactForm({
  action,
}: {
  action: (state: ContactState, form: FormData) => Promise<ContactState>
}) {
  const [state, submit, pending] = useActionState(action, {})
  const t = words(contact)

  if (state.sent) return <FormMessage>{t.confirmation}</FormMessage>

  const messageError = state.errors?.message ? t.erreurs[state.errors.message] : undefined

  return (
    <form action={submit} noValidate className="flex flex-col gap-6">
      {state.failed ? <FormMessage>{t.erreurs.envoi}</FormMessage> : null}
      {state.limited ? <FormMessage>{t.erreurs.limite}</FormMessage> : null}
      <Field
        name="nom"
        label={t.champs.nom}
        autoComplete="name"
        defaultValue={state.values?.nom}
        error={state.errors?.nom ? t.erreurs.nom : undefined}
        required
      />
      <Field
        name="email"
        type="email"
        label={t.champs.email}
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.errors?.email ? t.erreurs.email : undefined}
        required
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="champ-message" className="text-corps font-semibold text-taupe">
          {t.champs.message}
        </label>
        <textarea
          id="champ-message"
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          defaultValue={state.values?.message}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "champ-message-aide champ-message-erreur" : "champ-message-aide"}
          required
          className="w-full rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge aria-invalid:border-destructive"
        />
        <p id="champ-message-aide" className="px-6 text-legende text-taupe">
          {t.champs.messageAide}
        </p>
        {messageError ? <FieldError id="champ-message-erreur">{messageError}</FieldError> : null}
      </div>
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          {TRAP_FIELD}
          <input type="text" name={TRAP_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.enCours : t.bouton}
      </Button>
    </form>
  )
}

export { ContactForm }
