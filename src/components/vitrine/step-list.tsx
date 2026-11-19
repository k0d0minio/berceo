import type { IconComponent } from "@/components/berceo-icons"
import { cn } from "@/lib/utils"

/*
 * A journey in steps (the guide: three at most, a title and one or two
 * sentences each); the words come in as props. The list stays ordered for a
 * screen reader, but no number is drawn: the DA has no numbered badges
 * (JAM-300). Each step is a white card of 32 px, with one of Surya's icons
 * at the DA's service size, 40 to 56 px, when the caller gives them
 * (JAM-327).
 *
 * From md the steps sit side by side and share three rows (a subgrid): the
 * icons, the titles on one line, and the paragraphs start together however
 * many lines a title wraps to (blocs-accueil).
 */
function StepList({
  steps,
  icons,
  className,
}: {
  steps: readonly { title: string; text: string }[]
  /** One icon for each step, in order. */
  icons?: readonly IconComponent[]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-6 md:grid-cols-3 md:gap-y-3", className)}>
      {steps.map((step, i) => {
        const Icon = icons?.[i]
        return (
          <li
            key={step.title}
            className={cn(
              "flex flex-col gap-3 rounded-carte bg-blanc p-6 md:grid md:grid-rows-subgrid md:p-8",
              icons ? "md:row-span-3" : "md:row-span-2"
            )}
          >
            {Icon ? <Icon aria-hidden className="size-12 text-sauge" /> : null}
            <h3 className="font-sans text-h3 font-bold text-balance">
              {step.title}
            </h3>
            <p>{step.text}</p>
          </li>
        )
      })}
    </ol>
  )
}

export { StepList }
