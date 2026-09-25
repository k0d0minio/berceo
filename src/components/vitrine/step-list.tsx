import { cn } from "@/lib/utils"

/*
 * A journey in numbered steps (the guide: three at most, a title and one or
 * two sentences each). The number is the step's place in the list, drawn in
 * a capsule; the words come in as props.
 */
function StepList({
  steps,
  className,
}: {
  steps: readonly { title: string; text: string }[]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-8 md:grid-cols-3", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-capsule border border-sauge font-display text-nav text-encre-sauge"
          >
            {index + 1}
          </span>
          <h3 className="font-sans text-h3 font-bold">{step.title}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  )
}

export { StepList }
