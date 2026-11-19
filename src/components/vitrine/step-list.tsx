import { cn } from "@/lib/utils"

/*
 * A journey in steps (the guide: three at most, a title and one or two
 * sentences each); the words come in as props. The list stays ordered for a
 * screen reader, but no number is drawn: the DA has no numbered badges
 * (JAM-300).
 *
 * From md the steps sit side by side and share two rows (a subgrid): the
 * titles on one line, and the paragraphs start together however many lines a
 * title wraps to (blocs-accueil).
 */
function StepList({
  steps,
  className,
}: {
  steps: readonly { title: string; text: string }[]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-8 md:grid-cols-3 md:gap-y-3", className)}>
      {steps.map((step) => (
        <li
          key={step.title}
          className="flex flex-col gap-3 md:row-span-2 md:grid md:grid-rows-subgrid"
        >
          <h3 className="font-sans text-h3 font-bold text-balance">
            {step.title}
          </h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  )
}

export { StepList }
