import Link from "next/link"

import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { cn } from "@/lib/utils"

const link = "text-corps font-semibold text-encre-sauge underline underline-offset-4"

/** A list's address with these parameters, empty ones left out. */
export function listHref(path: string, params: Record<string, string | null | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value)
  const text = query.toString()
  return text ? `${path}?${text}` : path
}

/*
 * A list's filters as capsule links, the current one marked (the DA's filters
 * are capsules). A link, not a form: each filter is an address the overview
 * can point at (D-133).
 */
function FilterLinks({
  label,
  options,
}: {
  label: string
  options: readonly { label: string; href: string; current: boolean }[]
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              aria-current={option.current ? "true" : undefined}
              className={cn(
                "inline-flex min-h-12 items-center rounded-capsule border border-solid border-encre-taupe px-5 text-corps text-encre-taupe transition-colors duration-200 ease-out hover:bg-beurre",
                option.current && "border-beurre bg-beurre font-semibold",
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Previous and next page, and where we are; nothing when the list fits one page. */
function Pager({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  const t = words(admin).pages
  if (pages <= 1) return null
  return (
    <nav className="flex flex-wrap items-center gap-6 text-corps text-encre-taupe">
      {page > 1 ? (
        <Link href={href(page - 1)} className={link}>
          {t.precedente}
        </Link>
      ) : null}
      <span>{fill(t.position, { n: String(page) })}</span>
      {page < pages ? (
        <Link href={href(page + 1)} className={link}>
          {t.suivante}
        </Link>
      ) : null}
    </nav>
  )
}

export { FilterLinks, Pager }
