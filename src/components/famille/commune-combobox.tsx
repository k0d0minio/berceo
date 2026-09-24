"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import {
  localityLabel,
  localityValue,
  searchLocalities,
  type Locality,
} from "@/lib/communes"
import { cn } from "@/lib/utils"

/*
 * The commune field: a combobox over the official list of Belgian localities
 * (src/lib/communes), searched in the browser by postcode or by name. The
 * family picks one entry; the hidden input posts « 1050|Ixelles ». Text typed
 * but not picked is posted as typed, so the server answers "choose from the
 * list" rather than "required". Keyboard: arrows move, Enter picks, Escape
 * closes (the ARIA 1.2 combobox pattern).
 */
function CommuneCombobox({
  name,
  label,
  help,
  error,
  placeholder,
  emptyText,
  listLabel,
  defaultValue,
  defaultText,
}: {
  name: string
  label: string
  help: string
  error?: string
  placeholder: string
  emptyText: string
  listLabel: string
  defaultValue: Locality | null
  /** Text typed but not picked, kept when a refused form comes back. */
  defaultText?: string
}) {
  const id = `champ-${name}`
  const listId = `${id}-liste`
  const helpId = `${id}-aide`
  const errorId = error ? `${id}-erreur` : undefined

  const [selected, setSelected] = React.useState<Locality | null>(defaultValue)
  const [query, setQuery] = React.useState(
    defaultValue ? localityLabel(defaultValue) : (defaultText ?? ""),
  )
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)

  const results = React.useMemo(
    () => (open && !selected ? searchLocalities(query, 12) : []),
    [open, query, selected],
  )
  const showList = open && !selected && query.trim() !== ""

  function pick(locality: Locality) {
    setSelected(locality)
    setQuery(localityLabel(locality))
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter" && showList && results[active]) {
      event.preventDefault()
      pick(results[active])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-corps font-semibold text-taupe">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helpId, errorId].filter(Boolean).join(" ")}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelected(null)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <input type="hidden" name={name} value={selected ? localityValue(selected) : query} />
        {showList ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={listLabel}
            className="absolute inset-x-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-carte border border-input bg-blanc py-2"
          >
            {results.length === 0 ? (
              <li className="px-6 py-3 text-corps text-taupe">{emptyText}</li>
            ) : (
              results.map((locality, index) => (
                <li
                  key={localityValue(locality)}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown, not click: it fires before the input's blur closes the list.
                  onMouseDown={(event) => {
                    event.preventDefault()
                    pick(locality)
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "cursor-pointer px-6 py-3 text-corps text-taupe",
                    index === active && "bg-beurre",
                  )}
                >
                  {localityLabel(locality)}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <p id={helpId} className="px-6 text-legende text-taupe">
        {help}
      </p>
      {error ? (
        <p id={errorId} className="px-6 text-legende font-semibold text-taupe">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { CommuneCombobox }
