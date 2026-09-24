import * as React from "react"

import { signOut } from "@/app/(auth)/actions"
import { PortalShell } from "@/components/shell/portal-shell"
import { SignOutDialog } from "@/components/shell/sign-out-dialog"
import { comptes } from "@/content/comptes"
import { fill, words } from "@/content/locale"
import type { User } from "@/db"
import { homeFor } from "@/lib/auth/routing"

/*
 * A signed-in space: the portal shell with the role's home as its only entry
 * for now, the sign-out dialog wired to the session, and the greeting by first
 * name. Each feature stub adds its own navigation entries.
 */
function SpaceShell({
  user,
  title,
  children,
}: {
  user: User
  /** The page's heading; the greeting when omitted. */
  title?: string
  children?: React.ReactNode
}) {
  const t = words(comptes).espaces
  const home = homeFor(user.role)
  const greeting = fill(t.salutation, { prenom: user.firstName })

  return (
    <PortalShell
      nav={[{ label: t.navAccueil, href: home }]}
      home={home}
      actions={<SignOutDialog onSignOut={signOut} />}
    >
      <div className="flex flex-col gap-6">
        {title ? <p className="text-intro text-taupe">{greeting}</p> : null}
        <h1 className="font-display text-h1 text-sauge">{title ?? greeting}</h1>
        {children}
      </div>
    </PortalShell>
  )
}

export { SpaceShell }
