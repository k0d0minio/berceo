"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

/*
 * The confirmation dialog (DA, Couleurs de confirmation; D-24).
 *
 * This is the only component that may use the confirmation colours: red for
 * the sensitive answer (cancel, refuse, leave), green for the confirming one.
 * They never appear as page-wide buttons. Each answer says which it is, so a
 * dialog reads the same whichever of the two actually runs the action.
 *
 * Focus is trapped in the dialog, Escape closes it, and focus goes back to the
 * trigger (Radix alert dialog). Focus starts on the `cancel` answer, the one
 * that changes nothing.
 */

type Tone = "sensible" | "confirmation"

const toneClasses: Record<Tone, string> = {
  sensible:
    "border-rouge-confirmation bg-rouge-confirmation text-blanc hover:border-rouge-confirmation hover:bg-rouge-confirmation",
  confirmation:
    "border-vert-confirmation bg-vert-confirmation text-taupe hover:border-vert-confirmation hover:bg-vert-confirmation",
}

/* The DA's button construction, with the confirmation fill instead of a background variant. */
const answerClasses =
  "inline-flex min-h-12 w-full origin-center items-center justify-center rounded-capsule border border-solid px-7 font-sans text-bouton font-semibold whitespace-nowrap select-none transition-[transform,background-color,border-color,color] duration-200 ease-out hover:[transform:scale(1.03)] motion-reduce:hover:[transform:none] disabled:pointer-events-none disabled:opacity-50"

type Answer = {
  label: string
  tone: Tone
  onSelect?: () => void
}

function ConfirmDialog({
  trigger,
  title,
  description,
  action,
  cancel,
  open,
  onOpenChange,
}: {
  /** The element that opens the dialog; rendered as the trigger itself. */
  trigger?: React.ReactElement
  title: string
  description: string
  /** The answer that does the thing asked about ("Oui, me déconnecter"). */
  action: Answer
  /** The answer that leaves things as they are ("Non, rester connecté"). */
  cancel: Answer
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction
            className={cn(answerClasses, toneClasses[action.tone])}
            onClick={action.onSelect}
          >
            {action.label}
          </AlertDialogAction>
          <AlertDialogCancel
            className={cn(answerClasses, toneClasses[cancel.tone])}
            onClick={cancel.onSelect}
          >
            {cancel.label}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog, type Tone as ConfirmTone }
