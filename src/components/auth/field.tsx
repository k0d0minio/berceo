import * as React from "react"

import { Input } from "@/components/ui/input"
import { comptes } from "@/content/comptes"
import { fill, words } from "@/content/locale"
import { cn } from "@/lib/utils"

/*
 * One labelled field of the account forms: the label above, the DA's capsule
 * input, the guide's helper line under it, and the error, if any, tied to the
 * input for screen readers (aria-invalid, aria-describedby). A field that
 * blocks the form shows in red: its border and its message (onboarding-retour-1,
 * the founders' feedback, which bends D-24 for form errors).
 */
function Field({
  name,
  label,
  help,
  error,
  ...input
}: React.ComponentProps<typeof Input> & {
  name: string
  label: string
  help?: string
  error?: string
}) {
  const id = `champ-${name}`
  const helpId = help ? `${id}-aide` : undefined
  const errorId = error ? `${id}-erreur` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-corps font-semibold text-encre-taupe">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        {...input}
      />
      {help ? (
        <p id={helpId} className="px-6 text-legende text-encre-taupe">
          {help}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  )
}

/** The red message under a field that blocks the form. */
function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("px-6 text-legende font-semibold text-destructive", className)} {...props} />
}

/** A message for the whole form, read out when it appears. */
function FormMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-carte bg-perle px-6 py-4 text-corps text-encre-taupe">
      {children}
    </p>
  )
}

/** The line above the buttons: how many fields block the form. Nothing when none does. */
function BlockingCount({ count }: { count: number }) {
  if (count === 0) return null
  const t = words(comptes).blocage
  return (
    <p className="text-corps font-semibold text-destructive">
      {count === 1 ? t.un : fill(t.plusieurs, { n: String(count) })}
    </p>
  )
}

/**
 * After a refused submit, scrolls to the form's first blocking field and gives
 * it focus. `refusal` is the action's state: a new object on every answer, so
 * each refusal moves the focus once. A field whose input is hidden (a file
 * slot) or grouped (radios) scrolls its `data-champ` block into view.
 * Client forms only: it runs an effect.
 */
function useFocusFirstBlocking(
  form: React.RefObject<HTMLFormElement | null>,
  refusal: unknown,
  count: number,
) {
  React.useEffect(() => {
    if (count === 0) return
    const field = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!field) return
    const block = field.closest<HTMLElement>("[data-champ]") ?? field
    block.scrollIntoView({ block: "center" })
    field.focus({ preventScroll: true })
  }, [form, refusal, count])
}

export { BlockingCount, Field, FieldError, FormMessage, useFocusFirstBlocking }
