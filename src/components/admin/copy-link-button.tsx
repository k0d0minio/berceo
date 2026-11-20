"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

/*
 * « Copier le lien » (JAM-361): writes a share link to the clipboard and says
 * so for a moment. The link is text beside the button, so a browser with no
 * JavaScript, or one that refuses the clipboard, still has it to select. The
 * words come as props: the catalogue stays on the server.
 */
function CopyLinkButton({
  url,
  label,
  ariaLabel,
  copied,
  failed,
}: {
  url: string
  label: string
  /** The button's name with its commune, so two buttons of a list differ for a screen reader. */
  ariaLabel: string
  copied: string
  failed: string
}) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")

  React.useEffect(() => {
    if (state === "idle") return
    const timer = window.setTimeout(() => setState("idle"), 4000)
    return () => window.clearTimeout(timer)
  }, [state])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setState("copied")
    } catch {
      setState("failed")
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <Button type="button" variant="raye" aria-label={ariaLabel} onClick={copy}>
        {label}
      </Button>
      <span aria-live="polite" className="text-legende text-taupe">
        {state === "copied" ? copied : state === "failed" ? failed : ""}
      </span>
    </span>
  )
}

export { CopyLinkButton }
