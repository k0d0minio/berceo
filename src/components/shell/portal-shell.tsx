import * as React from "react"
import Link from "next/link"

import { BerceoLogomark } from "@/components/berceo-logo"
import { Badge, MobileMenu, type MenuLink } from "@/components/shell/mobile-menu"
import { portal } from "@/content/portal"
import { words } from "@/content/locale"

/*
 * The signed-in portal's frame: the logomark in the header, the portal's
 * navigation (passed in — each feature brings its own entries, a count
 * beside one when it has one), and the page
 * on white below. On desktop the navigation sits in the header; below md it
 * opens from the menu button. `actions` is the header's right-hand slot
 * (sign-out, later the account).
 */
function PortalShell({
  nav,
  home,
  actions,
  children,
}: {
  nav: readonly MenuLink[]
  /** Where the logomark leads: the portal's own home, never the public site. */
  home: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const t = words(portal)

  return (
    <div className="flex min-h-dvh flex-col bg-blanc">
      <header className="bg-perle">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-8">
          <Link
            href={home}
            aria-label={t.header.homeLabel}
            className="shrink-0 rounded-md text-sauge"
          >
            <BerceoLogomark className="h-12 w-auto" />
          </Link>

          <nav aria-label={t.header.navLabel} className="hidden md:block">
            <ul className="flex items-center gap-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-capsule px-4 py-2 font-display text-nav text-sauge transition-colors duration-200 ease-out hover:bg-beurre"
                  >
                    {item.label}
                    {item.badge && item.badge.count > 0 ? <Badge {...item.badge} /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {actions ? <div className="hidden md:block">{actions}</div> : null}
            <div className="md:hidden">
              <MobileMenu
                links={nav}
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
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8 md:py-16">
        {children}
      </main>
      {actions ? (
        <div className="border-t px-4 py-6 md:hidden">{actions}</div>
      ) : null}
    </div>
  )
}

export { PortalShell }
