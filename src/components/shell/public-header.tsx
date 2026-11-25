import Link from "next/link"

import { UserIcon } from "@/components/icons"
import { HeaderFrame } from "@/components/shell/header-frame"
import { HeaderLogo } from "@/components/shell/header-logo"
import { MobileMenu } from "@/components/shell/mobile-menu"
import { common } from "@/content/common"
import { words } from "@/content/locale"
import { SIGN_IN_PATH } from "@/lib/auth/routing"
import { contactEnabled } from "@/lib/contact/config"

/*
 * The public header of the DA's slide 19 (JAM-327): the white logomark, the
 * deck's links in white capitals, one account icon. « Tarifs » is back between
 * « Nos gardes de nuit » and « Contact » at the client's request (JAM-581,
 * Jamie, 2026-11-25), although the deck put it in the footer. It lies on the
 * home's photograph and on the sage band of every other page (HeaderFrame).
 * The account icon opens the sign-in page, which sends a signed-in person to
 * their own space. « Contact » exists only where the environment has a
 * contact address (src/lib/contact/config.ts). Below md the links move into
 * the menu panel; the account icon stays.
 */
function PublicHeader({ fullLogo }: { fullLogo?: boolean } = {}) {
  const t = words(common)
  const links = [
    t.nav.accueil,
    t.nav.histoire,
    t.nav.gardesDeNuit,
    t.pages.tarifs,
    ...(contactEnabled() ? [t.nav.contact] : []),
  ]

  return (
    <HeaderFrame>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-6">
        <Link href="/" aria-label={t.header.homeLabel} className="shrink-0 rounded-md">
          <HeaderLogo full={fullLogo} />
        </Link>

        <nav aria-label={t.header.navLabel} className="hidden md:block">
          <ul className="flex items-center gap-6 lg:gap-10">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md font-display text-nav whitespace-nowrap underline-offset-8 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={SIGN_IN_PATH}
            aria-label={t.header.compte}
            className="inline-flex size-12 items-center justify-center rounded-capsule transition-transform duration-200 ease-out hover:[transform:scale(1.03)] motion-reduce:hover:[transform:none]"
          >
            <UserIcon aria-hidden className="size-7" />
          </Link>
          <div className="md:hidden">
            <MobileMenu
              variant="sauge"
              links={links}
              labels={{
                open: t.header.openMenu,
                close: t.header.closeMenu,
                title: t.header.menuTitle,
                nav: t.header.navLabel,
              }}
            />
          </div>
        </div>
      </div>
    </HeaderFrame>
  )
}

export { PublicHeader }
