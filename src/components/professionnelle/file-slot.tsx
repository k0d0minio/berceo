"use client"

import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import {
  confirmUpload,
  removeFile,
  requestUpload,
} from "@/app/(portail)/espace/professionnelle/actions"
import { words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import type { DocumentKind } from "@/db/schema"
import { DOCUMENT_TYPES, FILES_PER_DOCUMENT_MAX, PHOTO_TYPES } from "@/lib/professionnelle/rules"

/*
 * One file slot: her photo (step 2) or one of her profession's documents
 * (step 3). Choosing a file uploads it straight away in three moves: the
 * server hands a presigned PUT for that type and size, the browser sends the
 * bytes to the private bucket, then the server checks what arrived and records
 * it. The page re-renders from the server afterwards, so what is listed is
 * always what is stored. Files open through /api/fichiers/[id] only.
 */

type Stored = { id: string; fileName: string }

type ErrorKey = keyof (typeof professionnelle)["fr"]["erreurs"]

function FileSlot({
  kind,
  label,
  help,
  files,
  error,
  disabled,
}: {
  kind: DocumentKind
  label: string
  help: string
  files: Stored[]
  /** A step-level error on this slot (e.g. a missing document). */
  error?: string
  disabled?: boolean
}) {
  const t = words(professionnelle)
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [failure, setFailure] = React.useState<ErrorKey | null>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const id = `fichier-${kind}`
  const photo = kind === "photo"
  const full = !photo && files.length >= FILES_PER_DOCUMENT_MAX
  const message = failure ? t.erreurs[failure] : error

  async function upload(file: File) {
    setBusy(true)
    setFailure(null)
    try {
      const ticket = await requestUpload({ kind, contentType: file.type, size: file.size })
      if (!ticket.ok) return setFailure(ticket.error)

      const sent = await fetch(ticket.url, {
        method: "PUT",
        body: file,
        headers: { "content-type": file.type },
      })
      if (!sent.ok) return setFailure("echec")

      const result = await confirmUpload({
        kind,
        key: ticket.key,
        contentType: file.type,
        fileName: file.name,
      })
      if (!result.ok) return setFailure(result.error)
      router.refresh()
    } catch {
      setFailure("echec")
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ""
    }
  }

  async function remove(fileId: string) {
    setBusy(true)
    setFailure(null)
    try {
      const result = await removeFile(fileId)
      if (!result.ok) return setFailure(result.error)
      router.refresh()
    } catch {
      setFailure("echec")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-corps font-semibold text-encre-taupe">
        {label}
      </label>

      {photo && files[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- a private file behind a session, not an optimisable asset
        <img
          src={`/api/fichiers/${files[0].id}`}
          alt=""
          className="size-32 rounded-capsule border border-solid border-perle object-cover"
        />
      ) : null}

      {!photo && files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center gap-3 rounded-carte bg-perle px-6 py-3 text-corps text-encre-taupe"
            >
              <FileText aria-hidden className="size-5 shrink-0" />
              <span className="min-w-0 flex-1 break-all">{file.fileName}</span>
              <a
                href={`/api/fichiers/${file.id}`}
                target="_blank"
                rel="noopener"
                className="text-encre-sauge underline"
              >
                {t.justificatifs.voir}
              </a>
              <button
                type="button"
                disabled={busy || disabled}
                onClick={() => remove(file.id)}
                className="text-encre-sauge underline disabled:opacity-50"
              >
                {t.justificatifs.retirer}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={input}
        id={id}
        type="file"
        accept={(photo ? PHOTO_TYPES : DOCUMENT_TYPES).join(",")}
        disabled={busy || disabled || full}
        aria-describedby={[`${id}-aide`, message ? `${id}-erreur` : ""].filter(Boolean).join(" ")}
        aria-invalid={message ? true : undefined}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
        className="peer sr-only"
      />
      {!full ? (
        <label
          htmlFor={id}
          aria-hidden
          className="inline-flex min-h-12 w-fit cursor-pointer items-center justify-center rounded-capsule border border-solid border-encre-sauge bg-blanc px-7 text-bouton font-semibold text-encre-sauge transition-[background-color,color] duration-200 ease-out peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-encre-sauge peer-disabled:cursor-default peer-disabled:opacity-50 hover:bg-encre-sauge hover:text-blanc"
        >
          {busy
            ? t.justificatifs.envoiEnCours
            : photo && files[0]
              ? t.justificatifs.remplacer
              : t.justificatifs.ajouter}
        </label>
      ) : null}

      <p id={`${id}-aide`} className="px-6 text-legende text-encre-taupe">
        {help}
      </p>
      {message ? (
        <p id={`${id}-erreur`} role="alert" className="px-6 text-legende font-semibold text-encre-taupe">
          {message}
        </p>
      ) : null}
    </div>
  )
}

export { FileSlot }
