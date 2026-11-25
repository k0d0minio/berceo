"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"
import { cn } from "@/lib/utils"

/*
 * A password input with a button that shows or hides the typed text
 * (JAM-583). The text is hidden on load. The button is type="button", so it
 * never submits the form. Its accessible name says what a press does next.
 */
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)
  const t = words(comptes).motDePasseVisible

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-28", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.masquerLibelle : t.afficherLibelle}
        aria-controls={props.id}
        className="absolute inset-y-0 right-0 rounded-capsule px-6 text-legende font-semibold text-sauge underline focus-visible:outline-2 focus-visible:outline-sauge"
      >
        {visible ? t.masquer : t.afficher}
      </button>
    </div>
  )
}

export { PasswordInput }
