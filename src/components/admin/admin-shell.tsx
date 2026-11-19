import * as React from "react"
import Link from "next/link"

import { SpaceShell } from "@/components/shell/space-shell"
import { admin } from "@/content/admin"
import { words } from "@/content/locale"
import type { User } from "@/db"
import { ADMIN_PROMO_CODES_PATH, ADMIN_SUBSCRIPTIONS_PATH } from "@/lib/abonnements/paths"
import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_FILES_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_OVERVIEW_PATH,
  ADMIN_REPORTS_PATH,
  ADMIN_REQUESTS_PATH,
  ADMIN_USERS_PATH,
} from "@/lib/admin/paths"
import { ADMIN_RATINGS_PATH } from "@/lib/avis/paths"
import { ADMIN_CREDITS_PATH } from "@/lib/credits/paths"
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths"
import { cn } from "@/lib/utils"

/** The back-office's entries, in the order the navigation shows them (D-132). */
export type AdminSection =
  | "vueEnsemble"
  | "dossiers"
  | "utilisateurs"
  | "demandes"
  | "reservations"
  | "signalements"
  | "paiements"
  | "creditsBerceo"
  | "abonnements"
  | "codesPromo"
  | "avis"
  | "journal"

const SECTIONS: readonly [AdminSection, string][] = [
  ["vueEnsemble", ADMIN_OVERVIEW_PATH],
  ["dossiers", ADMIN_FILES_PATH],
  ["utilisateurs", ADMIN_USERS_PATH],
  ["demandes", ADMIN_REQUESTS_PATH],
  ["reservations", ADMIN_BOOKINGS_PATH],
  ["signalements", ADMIN_REPORTS_PATH],
  ["paiements", ADMIN_PAYMENTS_PATH],
  ["creditsBerceo", ADMIN_CREDITS_PATH],
  ["abonnements", ADMIN_SUBSCRIPTIONS_PATH],
  ["codesPromo", ADMIN_PROMO_CODES_PATH],
  ["avis", ADMIN_RATINGS_PATH],
  ["journal", ADMIN_JOURNAL_PATH],
]

/*
 * Every back-office page: the admin's space with the back-office navigation
 * above the page (D-132). Eleven capsules wrap on a phone rather than scroll;
 * the current one reads as the current page and carries the butter fill. The
 * page is pearl (JAM-327), so a capsule that is not the current one is white.
 */
async function AdminShell({
  user,
  title,
  current,
  children,
}: {
  user: User
  title: string
  current: AdminSection
  children?: React.ReactNode
}) {
  const t = words(admin).nav

  return (
    <SpaceShell user={user} title={title}>
      <nav aria-label={t.libelle}>
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map(([section, href]) => (
            <li key={section}>
              <Link
                href={href}
                aria-current={section === current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center rounded-capsule border border-solid border-sauge bg-blanc px-5 text-corps font-semibold text-sauge transition-colors duration-200 ease-out hover:bg-beurre",
                  section === current && "border-beurre bg-beurre",
                )}
              >
                {t[section]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </SpaceShell>
  )
}

export { AdminShell }
