import Link from "next/link"

import { BerceoWordmark } from "@/components/berceo-logo"
import { common } from "@/content/common"
import { words } from "@/content/locale"
import { sleepConsultationEnabled } from "@/lib/consultation-sommeil/config"
import { contactEnabled } from "@/lib/contact/config"

/*
 * The public footer: on the sage ink, the brand's identity colour deep enough
 * to carry white text (finition-accueil D-2); the focus ring turns white here. Every page of the
 * guide's URL map, the legal ones last. « FAQ » lives here since it left
 * the header (JAM-327, question 5). « Tarifs » is in both since JAM-581. « Contact » is a link to
 * the form, where the environment has a contact address: no address is ever
 * published. « Consultation sommeil » is a link where the environment has
 * the address of the founders' calendar (JAM-305).
 */
function PublicFooter() {
  const t = words(common)
  const links = [
    t.pages.commentCaMarche,
    t.pages.tarifs,
    t.pages.quiSommesNous,
    t.pages.faq,
    ...(sleepConsultationEnabled() ? [t.pages.consultationSommeil] : []),
    ...(contactEnabled() ? [t.nav.contact] : []),
    t.pages.inscriptionFamille,
    t.pages.inscriptionProfessionnelle,
    t.pages.conditionsGenerales,
    t.pages.confidentialite,
  ]

  return (
    <footer className="bg-sauge text-blanc [--ring:var(--blanc)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8 md:py-16">
        <div className="flex max-w-sm flex-col gap-4">
          <BerceoWordmark aria-hidden className="w-40 self-start" />
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
