import { CaretRightIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

/*
 * The DA's testimonial card (slide 27; JAM-327): a sage card of 32 px, five
 * butter-yellow stars, the quotation in white, then who says it in bold.
 * The cards sit in one row that scrolls sideways and snaps to each card, with
 * the next card showing at the right edge under a white arrow, as on the
 * slide. The row moves only when the reader scrolls it, so nothing animates
 * on its own.
 *
 * No real testimonial exists yet: the component shows on `/design-system`
 * only, with the deck's sample text marked as an example (Jamie's answer to
 * question 4). No public page may show a testimonial before the founders
 * supply a real one.
 */

const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z"

type Testimonial = { quote: string; name: string; detail: string }

function TestimonialCard({
  testimonial,
  starsLabel,
  mark,
  className,
}: {
  testimonial: Testimonial
  /** The stars' words for a screen reader. */
  starsLabel: string
  /** A short mark above the stars: « Exemple » while no real testimonial exists. */
  mark?: string
  className?: string
}) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-4 rounded-carte bg-sauge px-6 py-8 text-blanc md:px-10",
        className
      )}
    >
      {mark ? (
        <p className="w-fit rounded-capsule bg-beurre px-3 py-1 text-legende font-semibold text-taupe">
          {mark}
        </p>
      ) : null}
      <div role="img" aria-label={starsLabel} className="flex gap-1 text-beurre">
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-6">
            <path
              d={STAR_PATH}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <blockquote className="text-corps">{testimonial.quote}</blockquote>
      <figcaption className="flex flex-col text-corps font-bold">
        <span>{testimonial.name}</span>
        <span>{testimonial.detail}</span>
      </figcaption>
    </figure>
  )
}

function TestimonialRow({
  testimonials,
  label,
  starsLabel,
  mark,
}: {
  testimonials: readonly Testimonial[]
  /** The row's name for a screen reader. */
  label: string
  starsLabel: string
  mark?: string
}) {
  return (
    <div className="relative">
      <ul
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-carte pb-2"
      >
        {testimonials.map((testimonial, i) => (
          <li key={i} className="w-[85%] shrink-0 snap-start md:w-[45%]">
            <TestimonialCard
              testimonial={testimonial}
              starsLabel={starsLabel}
              mark={mark}
              className="h-full"
            />
          </li>
        ))}
      </ul>
      <CaretRightIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-10 -translate-y-1/2 text-blanc"
      />
    </div>
  )
}

export { TestimonialCard, TestimonialRow, type Testimonial }
