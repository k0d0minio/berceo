import Link from "next/link"

import { BerceoWordmark } from "@/components/berceo-logo"
import { MobileMenu } from "@/components/shell/mobile-menu"
import { Button } from "@/components/ui/button"
import { common } from "@/content/common"
import { words } from "@/content/locale"

/*
 * The public header: the wordmark home, the vitrine's pages, the two account
 * entries. The full row needs about 1,075 px, which only the max-w-6xl
 * container at xl gives, so below xl the pages and entries move into the menu
 * panel (premier-ecran). Links never wrap; the capsules keep their height and
 * type, and only their side padding tightens here, to the DA's 24 px floor.
 */
function PublicHeader() {
  const t = words(common)
  const links = [
    t.pages.commentCaMarche,
    t.pages.tarifs,
    t.pages.quiSommesNous,
    t.pages.faq,
  ]
  const accounts = [
    t.pages.inscriptionFamille,
    t.pages.inscriptionProfessionnelle,
  ]

  return (
    <header className="bg-blanc">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-6">
        <Link
          href="/"
          aria-label={t.header.homeLabel}
          className="shrink-0 rounded-md text-encre-sauge"
        >
          <BerceoWordmark aria-hidden className="w-32 md:w-36" />
        </Link>

        <nav aria-label={t.header.navLabel} className="hidden xl:block">
          <ul className="flex items-center gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-display text-nav whitespace-nowrap text-encre-sauge underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {accounts.map((account) => (
            <Button key={account.href} asChild className="px-6">
              <Link href={account.href}>{account.label}</Link>
            </Button>
          ))}
        </div>

        <div className="xl:hidden">
          <MobileMenu
            links={links}
            labels={{
              open: t.header.openMenu,
              close: t.header.closeMenu,
              title: t.header.menuTitle,
              nav: t.header.navLabel,
            }}
            actions={accounts}
          />
        </div>
      </div>
    </header>
  )
}

export { PublicHeader }
