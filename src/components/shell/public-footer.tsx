import Link from "next/link"

import { BerceoLogomark } from "@/components/berceo-logo"
import { common } from "@/content/common"
import { words } from "@/content/locale"

/*
 * The public footer: on sage, the brand's identity surface. Every page of the
 * guide's URL map, the legal ones last. No contact: Berceo has no published
 * address yet (AGENTS.md → Standing rules).
 */
function PublicFooter() {
  const t = words(common)
  const links = [
    t.pages.commentCaMarche,
    t.pages.tarifs,
    t.pages.quiSommesNous,
    t.pages.faq,
    t.pages.inscriptionFamille,
    t.pages.inscriptionProfessionnelle,
    t.pages.conditionsGenerales,
    t.pages.confidentialite,
  ]

  return (
    <footer className="bg-sauge text-blanc">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8 md:py-16">
        <div className="flex max-w-sm flex-col gap-4">
          <BerceoLogomark className="h-16 w-auto self-start" />
          <p className="text-corps">{t.footer.tagline}</p>
        </div>
        <nav aria-label={t.footer.navLabel}>
          <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-corps underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export { PublicFooter }
