import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { communeQrPath } from "@/lib/admin/commune-qr"

const link = "text-corps font-semibold text-sauge underline underline-offset-4"

/** The side of the code on the page, in CSS pixels. */
const SIZE = 160

/*
 * The QR code of one commune's share link (JAM-361), closed until the founder
 * opens it: a page has 50 communes, and a closed `<details>` with a lazy image
 * asks the server for no code. It works with no JavaScript. The image and the
 * two downloads come from the route `/admin/communes/[slug]/qr`, which makes
 * the code on the server; the address names the commune by its slug and never
 * carries the link. The image sits on white with the quiet zone of the code.
 */
function CommuneQr({ commune, slug }: { commune: string; slug: string }) {
  const t = words(admin).communes.qr

  return (
    <details data-slot="commune-qr">
      <summary className="cursor-pointer text-legende font-semibold text-sauge">{t.afficher}</summary>
      <div className="flex flex-col gap-3 pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- a private image made per request by the admin route, never optimised */}
        <img
          src={communeQrPath(slug, "svg")}
          alt={fill(t.alt, { commune })}
          width={SIZE}
          height={SIZE}
          loading="lazy"
          decoding="async"
          className="size-40 max-w-none"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href={communeQrPath(slug, "svg", true)} download aria-label={fill(t.svgDe, { commune })} className={link}>
            {t.svg}
          </a>
          <a href={communeQrPath(slug, "png", true)} download aria-label={fill(t.pngDe, { commune })} className={link}>
            {t.png}
          </a>
        </div>
        <p className="max-w-sm text-legende text-taupe">{t.aide}</p>
      </div>
    </details>
  )
}

export { CommuneQr }
