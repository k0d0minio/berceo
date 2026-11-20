import * as React from "react"

import { CopyLinkButton } from "@/components/admin/copy-link-button"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"

/*
 * The share area of one commune (JAM-361): the full address of its public page
 * as text that one click selects, « Copier le lien », and a link that opens
 * the page. `children` is the place of what belongs to the same link: the
 * table puts the QR code and its two downloads there (`commune-qr.tsx`).
 */
function CommuneShare({
  commune,
  url,
  children,
}: {
  commune: string
  url: string
  children?: React.ReactNode
}) {
  const t = words(admin).communes

  return (
    <div data-slot="commune-share" className="flex min-w-72 flex-col gap-3">
      <span className="break-all text-corps text-taupe select-all">{url}</span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <CopyLinkButton
          url={url}
          label={t.copier}
          ariaLabel={fill(t.copierDe, { commune })}
          copied={t.copie}
          failed={t.echec}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={fill(t.ouvrirDe, { commune })}
          className="text-corps font-semibold text-sauge underline underline-offset-4"
        >
          {t.ouvrir}
        </a>
      </div>
      {children ? <div data-slot="commune-share-extra">{children}</div> : null}
    </div>
  )
}

export { CommuneShare }
