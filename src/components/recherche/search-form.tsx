"use client"

import { CommuneCombobox } from "@/components/famille/commune-combobox"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { recherche } from "@/content/recherche"
import type { Locality } from "@/lib/communes"
import { SEARCH_PATH } from "@/lib/recherche/slugs"

/*
 * The guide's search field (« La recherche »): « Votre commune ou code
 * postal », its placeholder, « Rechercher ». The same combobox as the family's
 * profile; the form is a GET, so a search is a URL. The page resolves what it
 * posts (`q`: a picked locality, a postcode or a name) and answers with the
 * communes it names.
 */
function SearchForm({
  defaultValue,
  defaultText,
  error,
}: {
  defaultValue: Locality | null
  defaultText?: string
  error?: string
}) {
  const t = words(recherche).recherche
  return (
    <form method="get" action={SEARCH_PATH} role="search" className="flex max-w-2xl flex-col gap-4">
      <CommuneCombobox
        name="q"
        label={t.label}
        help={t.aide}
        error={error}
        placeholder={t.placeholder}
        emptyText={t.aucuneSuggestion}
        listLabel={t.suggestions}
        defaultValue={defaultValue}
        defaultText={defaultText}
      />
      <Button type="submit" className="self-start">
        {t.bouton}
      </Button>
    </form>
  )
}

export { SearchForm }
