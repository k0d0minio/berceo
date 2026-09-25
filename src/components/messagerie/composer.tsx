"use client"

import * as React from "react"
import { useActionState } from "react"

import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { messagerie } from "@/content/messagerie"
import type { SendState } from "@/lib/messagerie/actions"

/*
 * The field and « Envoyer » (E-01). Each message gets its id here, as it
 * leaves: a send retried after a failure or clicked twice carries the same id,
 * and the server inserts it once. The id changes, and the field empties, only
 * once the server says this message was sent. The button waits while a send
 * is in flight. Plain text; the length rule is the server's alone (the
 * browser's `maxLength` counts an emoji as two, the rule as one).
 */

const t = words(messagerie)

function Composer({ action }: { action: (state: SendState, form: FormData) => Promise<SendState> }) {
  const [state, submit, pending] = useActionState(action, {})
  const [text, setText] = React.useState("")
  const [cleared, setCleared] = React.useState<string | undefined>()
  const messageId = React.useRef<string | null>(null)

  // The server confirmed a message: empty the field, once.
  if (state.sent && state.sent !== cleared) {
    setCleared(state.sent)
    setText("")
  }

  function send(form: FormData) {
    // A new message gets a new id; a retry of one the server has not confirmed keeps its own.
    if (messageId.current === null || messageId.current === state.sent) messageId.current = crypto.randomUUID()
    form.set("messageId", messageId.current)
    submit(form)
  }

  const error = state.error ? t.erreurs[state.error] : null

  return (
    <form action={send} noValidate className="flex flex-col gap-3">
      {error ? <FormMessage>{error}</FormMessage> : null}
      <label htmlFor="champ-message" className="text-corps font-semibold text-encre-taupe">
        {t.conversation.champ}
      </label>
      <textarea
        id="champ-message"
        name="message"
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-invalid={state.error === "vide" || state.error === "tropLong" ? true : undefined}
        className="w-full min-w-0 rounded-carte border border-solid border-input bg-blanc px-6 py-4 font-sans text-champ text-encre-taupe transition-[border-color] duration-200 ease-out focus-visible:border-sauge focus-visible:outline-none aria-invalid:border-destructive"
      />
      <Button type="submit" disabled={pending} className="w-fit">
        {t.conversation.envoyer}
      </Button>
    </form>
  )
}

export { Composer }
