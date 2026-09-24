"use client"

import { X } from "lucide-react"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import { COMMUNES_MAX } from "@/lib/professionnelle/rules"
import { communeName, searchCommunes } from "@/lib/communes"

/*
 * "Ma zone d'intervention" (D-11): she types a commune's French or Dutch name
 * or a postcode and picks from the suggestions (the shared register,
 * src/lib/communes, through its localities); each commune she picked shows
 * as a removable capsule. Only NIS codes leave the form (hidden inputs named
 * `communes`), never free text. Arrow keys move through the suggestions,
 * Enter picks, Escape closes (the ARIA combobox pattern).
 */
function CommunePicker({
  id,
  defaultValue,
  describedBy,
  invalid,
}: {
  id: string
  defaultValue: string[]
  describedBy?: string
  invalid?: boolean
}) {
  const t = words(professionnelle).aides
  const [selected, setSelected] = React.useState<string[]>(defaultValue)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = `${id}-suggestions`

  const suggestions = React.useMemo(
    () => searchCommunes(query).filter((c) => !selected.includes(c.ins)),
    [query, selected],
  )
  const open = query.trim().length > 0

  function pick(nis: string) {
    setSelected((current) =>
      current.includes(nis) || current.length >= COMMUNES_MAX ? current : [...current, nis],
    )
    setQuery("")
    setActive(0)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter") {
      // Enter picks a commune; it never submits the whole form from here.
      event.preventDefault()
      if (suggestions[active]) pick(suggestions[active].ins)
    } else if (event.key === "Escape") {
      setQuery("")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.map((nis) => (
        <input key={nis} type="hidden" name="communes" value={nis} />
      ))}

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((nis) => {
            const name = communeName(nis) ?? nis
            return (
              <li key={nis}>
                <button
                  type="button"
                  onClick={() => setSelected((current) => current.filter((n) => n !== nis))}
                  className="inline-flex min-h-10 items-center gap-2 rounded-capsule border border-solid border-sauge bg-blanc px-4 text-corps text-sauge"
                  aria-label={fill(t.retirerCommune, { commune: name })}
                >
                  {name}
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className="relative">
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions[active] ? `${listId}-${suggestions[active].ins}` : undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid ? true : undefined}
          aria-label={t.rechercheCommune}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
        />
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-2 flex max-h-72 w-full flex-col overflow-y-auto rounded-carte border border-solid border-perle bg-blanc py-2"
          >
            {suggestions.length === 0 ? (
              <li className="px-6 py-2 text-corps text-taupe">{t.aucuneCommune}</li>
            ) : (
              suggestions.map((commune, i) => (
                <li
                  key={commune.ins}
                  id={`${listId}-${commune.ins}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(event) => {
                    // Keep the focus in the field while the pointer picks.
                    event.preventDefault()
                    pick(commune.ins)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={
                    i === active
                      ? "cursor-pointer bg-perle px-6 py-2 text-corps text-taupe"
                      : "cursor-pointer px-6 py-2 text-corps text-taupe"
                  }
                >
                  <span className="font-semibold">{commune.name}</span>
                  <span className="text-legende"> {commune.postcodes.slice(0, 3).join(", ")}</span>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export { CommunePicker }
