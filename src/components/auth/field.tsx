import * as React from "react"

import { Input } from "@/components/ui/input"

/*
 * One labelled field of the account forms: the label above, the DA's capsule
 * input, the guide's helper line under it, and the error, if any, tied to the
 * input for screen readers (aria-invalid, aria-describedby).
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
      <label htmlFor={id} className="text-corps font-semibold text-taupe">
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
        <p id={helpId} className="px-6 text-legende text-taupe">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="px-6 text-legende font-semibold text-taupe">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** A message for the whole form, read out when it appears. */
function FormMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-carte bg-perle px-6 py-4 text-corps text-taupe">
      {children}
    </p>
  )
}

export { Field, FormMessage }
