import { CheckIcon } from "@/components/icons"

import { Progress } from "@/components/ui/progress"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import { cn } from "@/lib/utils"
import type { Step } from "@/lib/professionnelle/rules"

/*
 * The four steps of D-21 with the guide's titles and a progress bar. A step
 * is marked by a capsule, filled with a check once done, never a number (no
 * numbered badges, JAM-300).
 * Step 1, the account, is always done by the time she is here. A step already
 * complete says so; the one she is on is marked for screen readers
 * (aria-current). The steps are a list, not links: the pages themselves send
 * her to the first incomplete one.
 */
const ORDER = ["compte", "profil", "justificatifs", "declarations"] as const

function StepsHeader({ current, done }: { current: Step; done: readonly Step[] }) {
  const t = words(professionnelle).etapes
  const index = ORDER.indexOf(current)
  const completed = 1 + done.length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-legende font-semibold text-taupe">{fill(t.position, { n: String(index + 1) })}</p>
      <Progress
        value={(completed / ORDER.length) * 100}
        aria-label={t.progression}
        className="h-2 bg-perle [&>[data-slot=progress-indicator]]:bg-sauge"
      />
      <ol className="grid gap-3 md:grid-cols-4">
        {ORDER.map((step, i) => {
          const isDone = step === "compte" || done.includes(step as Step)
          const isCurrent = i === index
          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-carte border border-solid px-4 py-3 text-corps",
                isCurrent ? "border-sauge bg-blanc text-sauge" : "border-perle bg-blanc text-taupe",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-capsule border border-solid font-semibold",
                  isDone ? "border-sauge bg-sauge text-blanc" : "border-current",
                )}
              >
                {isDone && !isCurrent ? <CheckIcon aria-hidden className="size-5" /> : null}
              </span>
              <span className="flex flex-col">
                <span className={cn(isCurrent && "font-semibold")}>{t.titres[step]}</span>
                {isDone && !isCurrent ? <span className="text-legende">{t.faite}</span> : null}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export { StepsHeader }
