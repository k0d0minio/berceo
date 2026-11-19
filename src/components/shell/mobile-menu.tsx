"use client"

import * as React from "react"
import Link from "next/link"
import { Dialog as DialogPrimitive } from "radix-ui"
import { MenuIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/*
 * The navigation below the md breakpoint, shared by the public header and the
 * portal shell: a capsule menu button opens a white panel over a pearl veil.
 * Radix keeps focus inside the panel, Escape closes it, focus returns to the
 * button. Following a link closes the panel. A link's count shows beside it
 * and, added up, on the menu button.
 */

/** A link; `badge` is a count beside it (the unread conversations), hidden at zero. */
type MenuLink = { label: string; href: string; badge?: { count: number; label: string } }

/** The count beside a link: butter yellow, like the other marks; its words for screen readers. */
function Badge({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-capsule bg-beurre px-2 font-sans text-legende font-semibold text-taupe">
      <span aria-hidden>{count}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

function MobileMenu({
  links,
  labels,
  actions = [],
}: {
  links: readonly MenuLink[]
  labels: { open: string; close: string; title: string; nav: string }
  /** Capsule buttons under the links (the account entries). */
  actions?: readonly MenuLink[]
}) {
  const [open, setOpen] = React.useState(false)
  const badges = links.flatMap((link) => (link.badge && link.badge.count > 0 ? [link.badge] : []))
  const total = badges.reduce((sum, badge) => sum + badge.count, 0)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          size="icon"
          aria-label={[labels.open, ...badges.map((badge) => badge.label)].join(", ")}
          className="relative"
        >
          <MenuIcon aria-hidden />
          {total > 0 ? (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-capsule bg-beurre px-1.5 font-sans text-legende font-semibold text-taupe"
            >
              {total}
            </span>
          ) : null}
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 voile-perle" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col gap-6 overflow-y-auto rounded-carte bg-blanc p-6 text-taupe"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-display text-nav text-sauge">
              {labels.title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button size="icon" aria-label={labels.close}>
                <XIcon aria-hidden />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <nav aria-label={labels.nav}>
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-capsule px-4 py-3 font-display text-nav text-sauge transition-colors duration-200 ease-out hover:bg-beurre"
                  >
                    {link.label}
                    {link.badge && link.badge.count > 0 ? <Badge {...link.badge} /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {actions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {actions.map((action) => (
                <Button key={action.href} asChild>
                  <Link href={action.href} onClick={() => setOpen(false)}>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Badge, MobileMenu, type MenuLink }
