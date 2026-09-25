import { admin } from "@/content/admin"
import { words } from "@/content/locale"

/*
 * One file of a professional's dossier, read on the page: an image as an
 * image, a PDF embedded, each with a link that opens it in a new tab (the
 * fallback where a phone will not embed a PDF). Every byte comes through
 * /api/fichiers/[id], which serves admins; no store URL reaches the browser.
 */
function DocumentView({
  id,
  fileName,
  contentType,
  label,
}: {
  id: string
  fileName: string
  contentType: string
  /** What the file is: "diplôme", "photo". */
  label: string
}) {
  const t = words(admin).dossier
  const src = `/api/fichiers/${id}`

  return (
    <figure className="flex flex-col gap-3 rounded-carte border border-solid border-perle bg-blanc p-4">
      {contentType === "application/pdf" ? (
        <object data={src} type="application/pdf" className="h-[36rem] w-full rounded-carte bg-perle">
          <p className="p-4 text-corps text-encre-taupe">{t.pdfIndisponible}</p>
        </object>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a private file streamed per request, never optimised or cached
        <img src={src} alt={`${label} : ${fileName}`} className="max-h-[36rem] w-full rounded-carte object-contain" />
      )}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-legende text-encre-taupe">
        <span className="break-all">
          {label} : {fileName}
        </span>
        <a href={src} target="_blank" rel="noopener noreferrer" className="font-semibold text-encre-sauge underline underline-offset-4">
          {t.ouvrir}
        </a>
      </figcaption>
    </figure>
  )
}

export { DocumentView }
