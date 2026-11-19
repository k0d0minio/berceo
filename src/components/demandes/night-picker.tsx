"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { disponibilites } from "@/content/disponibilites"
import { demandes } from "@/content/demandes"
import { fill, words } from "@/content/locale"
import { addDays } from "@/lib/demandes/rules"
// Pure date helpers only: the calendar's months and the night's words. Nothing here reads availability (D-12).
import { dayNumber, monthHeading, nightName } from "@/lib/disponibilites/format"
import { calendarMonths, weekdayIndex } from "@/lib/disponibilites/rules"
import { cn } from "@/lib/utils"

/*
 * « Date de la garde » as a month the family reads on her phone: Monday-to-
 * Sunday rows that fill the form's width, one 44 px tap target per day, the
 * month's name and the weekday initials at body size. The native date input
 * opened the phone's own picker, too small to read. One month shows at a time,
 * with the previous and next months a tap away. Only the nights inside the
 * window (D-60) can be chosen; the others show greyed and refuse the tap. The
 * calendar opens on the month of the chosen night, or of the first night
 * allowed, and leaves out the weeks that end before it: a month with one
 * night left in the window shows one row, not thirty greyed days. The
 * keyboard moves day by day (arrows), week by week (up, down), to the week's
 * ends (Home, End) and month by month (Page Up, Page Down); Enter or Space
 * chooses. The chosen night goes to the server in a hidden `date` field, as
 * the native input sent it, and the server still checks it. With `multiple`
 * (« Nuits régulières », demande-nuits-regulieres) each tap ticks or unticks a
 * night, up to `maxCount`, and the hidden field holds the nights in date order,
 * joined by commas.
 */

const t = words(demandes).formulaire.calendrier
const n = words(disponibilites).nuits

function firstOfNextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number)
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`
}

/** The same day `delta` months away, or that month's last day when it is shorter. */
function shiftMonth(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number)
  const target = new Date(Date.UTC(y, m - 1 + delta, 1))
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  return addDays(target.toISOString().slice(0, 10), Math.min(d, last) - 1)
}

/** The whole of `month` (`YYYY-MM`) as Monday-to-Sunday rows, `inWindow` meaning in this month. */
function monthWeeks(month: string) {
  return calendarMonths({ first: `${month}-01`, last: addDays(firstOfNextMonth(month), -1) })[0].weeks
}

function NightPicker({
  name,
  labelId,
  min,
  max,
  defaultValue,
  invalid,
  describedBy,
  multiple = false,
  maxCount,
}: {
  name: string
  /** The id of the visible label, « Date de la garde ». */
  labelId: string
  /** The first and last night allowed, `YYYY-MM-DD`, computed on the server in Brussels. */
  min: string
  max: string
  /** One night, or with `multiple` the nights joined by commas. */
  defaultValue?: string
  invalid?: boolean
  describedBy?: string
  /** Tick several nights (« Nuits régulières »). */
  multiple?: boolean
  /** With `multiple`: the most nights a tap may tick. */
  maxCount?: number
}) {
  function clamp(date: string): string {
    return date < min ? min : date > max ? max : date
  }

  const [selected, setSelected] = useState<string[]>(() =>
    (defaultValue ?? "").split(",").filter(Boolean).sort()
  )
  // The day that holds the tab stop: the chosen night, else the first night allowed.
  const [active, setActive] = useState(() => clamp(selected[0] || min))
  // The month on screen. An edited request opens on its night's month, also when that
  // night is now before the window and the tab stop sits in the next month.
  const [month, setMonth] = useState(() => (selected[0] || min).slice(0, 7))
  // The weeks that end before this day stay hidden: the first night allowed, or the
  // edited night when it is earlier.
  const [floor] = useState(() => (selected[0] && selected[0] < min ? selected[0] : min))
  const grid = useRef<HTMLDivElement>(null)
  const moved = useRef(false)

  const firstMonth = min.slice(0, 7)
  const lastMonth = max.slice(0, 7)

  // A key that moved the tab stop moves the focus with it, once the new month has rendered.
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${active}"]`)?.focus()
  }, [active])

  const weeks = monthWeeks(month).filter((week) => week[6].date >= floor)

  function showMonth(target: string) {
    setMonth(target)
    setActive(clamp(`${target}-01`))
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const weekday = weekdayIndex(date)
    const targets: Record<string, () => string> = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -weekday),
      End: () => addDays(date, 6 - weekday),
      PageUp: () => shiftMonth(date, -1),
      PageDown: () => shiftMonth(date, 1),
    }
    const target = targets[event.key]
    if (!target) return
    event.preventDefault()
    const next = clamp(target())
    if (next === date) return
    moved.current = true
    setMonth(next.slice(0, 7))
    setActive(next)
  }

  function choose(date: string) {
    setActive(date)
    if (!multiple) {
      setSelected([date])
      return
    }
    if (selected.includes(date)) setSelected(selected.filter((night) => night !== date))
    else if (maxCount === undefined || selected.length < maxCount) setSelected([...selected, date].sort())
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <input type="hidden" name={name} value={selected.join(",")} />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={t.precedent}
          disabled={month <= firstMonth}
          onClick={() => showMonth(addDays(`${month}-01`, -1).slice(0, 7))}
          className="flex size-11 items-center justify-center rounded-capsule text-sauge transition-colors duration-200 ease-out hover:bg-beurre disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </button>
        <p aria-live="polite" className="text-h3 font-bold text-sauge">
          {monthHeading(month)}
        </p>
        <button
          type="button"
          aria-label={t.suivant}
          disabled={month >= lastMonth}
          onClick={() => showMonth(firstOfNextMonth(month).slice(0, 7))}
          className="flex size-11 items-center justify-center rounded-capsule text-sauge transition-colors duration-200 ease-out hover:bg-beurre disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight aria-hidden="true" className="size-6" />
        </button>
      </div>

      <div
        ref={grid}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        className="flex flex-col gap-px sm:gap-1"
      >
        <div aria-hidden="true" className="grid grid-cols-7 gap-px pb-1 text-center text-corps text-taupe sm:gap-1">
          {n.joursCourts.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].date} className="grid grid-cols-7 gap-px sm:gap-1">
            {week.map((day) => {
              if (!day.inWindow) return <span key={day.date} aria-hidden="true" className="min-h-11" />
              const open = day.date >= min && day.date <= max
              const isSelected = selected.includes(day.date)
              return (
                <button
                  key={day.date}
                  type="button"
                  data-date={day.date}
                  aria-label={nightName(day.date)}
                  aria-pressed={isSelected}
                  disabled={!open}
                  tabIndex={day.date === active ? 0 : -1}
                  onClick={() => choose(day.date)}
                  onKeyDown={(event) => onKeyDown(event, day.date)}
                  className={cn(
                    "flex min-h-11 min-w-0 items-center justify-center rounded-md text-corps font-semibold transition-colors duration-200 ease-out focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-taupe focus-visible:outline-solid disabled:opacity-50",
                    // The focus ring sits on the cell's own fill: butter on the ink, the ink elsewhere.
                    isSelected
                      ? "bg-sauge text-blanc focus-visible:outline-beurre"
                      : open
                        ? "bg-perle text-taupe hover:bg-beurre"
                        : "text-taupe"
                  )}
                >
                  {dayNumber(day.date)}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selected.length > 0 ? (
        <p aria-live="polite" className="px-2 text-corps font-semibold text-taupe">
          {!multiple
            ? nightName(selected[0])
            : selected.length === 1
              ? t.uneNuitChoisie
              : fill(t.nuitsChoisies, { n: String(selected.length) })}
        </p>
      ) : null}
    </div>
  )
}

export { NightPicker }
