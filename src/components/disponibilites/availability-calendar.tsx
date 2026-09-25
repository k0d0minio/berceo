"use client"

import { useActionState, useState } from "react"

import type { NightsState } from "@/app/(portail)/espace/professionnelle/disponibilites/actions"
import { FormMessage } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { disponibilites } from "@/content/disponibilites"
import { fill, words } from "@/content/locale"
import { dayNumber, monthHeading, nightName } from "@/lib/disponibilites/format"
import type { CalendarMonth } from "@/lib/disponibilites/rules"
import { cn } from "@/lib/utils"

/*
 * « Mes disponibilités » on a phone (D-12, D-79, D-81): the window as one
 * block per month under its own heading, Monday-to-Sunday rows, one 44 px
 * tap target per night. Tapping selects a
 * night (tapping again deselects it); « Disponible » or « Indisponible » saves
 * the whole selection in one action, then the selection empties. A marked
 * night is filled sage; a selected one is outlined taupe (butter yellow when
 * not marked); each night's accessible name says its date and whether it is
 * marked, `aria-pressed` whether it is selected. The months come from the
 * server, computed in Brussels time: this component never reads the phone's
 * clock.
 */

const t = words(disponibilites)

function AvailabilityCalendar({
  months,
  marked,
  action,
}: {
  months: CalendarMonth[]
  marked: readonly string[]
  action: (state: NightsState, form: FormData) => Promise<NightsState>
}) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [state, submit, pending] = useActionState(
    async (previous: NightsState, form: FormData) => {
      const result = await action(previous, form)
      // A refused save keeps her selection, so she can try again.
      if (result.ok) setSelected(new Set())
      return result
    },
    {}
  )
  const markedSet = new Set(marked)
  const p = t.professionnelle

  function toggle(date: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <form action={submit} aria-busy={pending} className="flex max-w-md flex-col gap-6">
      <p className="text-corps text-taupe">{p.legende}</p>

      <div role="group" aria-label={p.calendrier} className="flex flex-col gap-4">
        {months.map((month) => (
          <div key={month.month} className="flex flex-col gap-0.5">
            <p className="pb-1 font-display text-h3 text-sauge">{monthHeading(month.month)}</p>
            <div aria-hidden="true" className="grid grid-cols-7 gap-0.5 pb-1 text-center text-legende text-taupe">
              {t.nuits.joursCourts.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            {month.weeks.map((week) => (
              <div key={week[0].date} className="grid grid-cols-7 gap-0.5">
                {week.map((day) => {
                  if (!day.inWindow) return <span key={day.date} aria-hidden="true" className="min-h-11" />
                  const isMarked = markedSet.has(day.date)
                  const isSelected = selected.has(day.date)
                  return (
                    <button
                      key={day.date}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={fill(isMarked ? p.etats.disponible : p.etats.nonIndiquee, {
                        nuit: nightName(day.date),
                      })}
                      onClick={() => toggle(day.date)}
                      className={cn(
                        "flex min-h-11 min-w-0 items-center justify-center rounded-md text-corps font-semibold transition-colors duration-200 ease-out",
                        isMarked ? "bg-sauge text-blanc" : "bg-perle text-taupe",
                        isSelected && "outline-[3px] outline-offset-[-3px] outline-solid outline-taupe",
                        isSelected && !isMarked && "bg-beurre"
                      )}
                    >
                      {dayNumber(day.date)}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {[...selected].sort().map((date) => (
        <input key={date} type="hidden" name="nuit" value={date} />
      ))}

      {state.message && !pending ? <FormMessage>{p.messages[state.message]}</FormMessage> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="etat" value="disponible" disabled={selected.size === 0 || pending}>
          {p.boutons.disponible}
        </Button>
        <Button
          type="submit"
          name="etat"
          value="indisponible"
          variant="raye"
          disabled={selected.size === 0 || pending}
        >
          {p.boutons.indisponible}
        </Button>
      </div>
    </form>
  )
}

export { AvailabilityCalendar }
