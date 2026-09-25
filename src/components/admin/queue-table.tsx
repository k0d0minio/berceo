import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import { professionnelle } from "@/content/professionnelle"
import type { DocumentKind } from "@/db/schema"
import type { QueueRow } from "@/lib/admin/review"
import { queueStatus } from "@/lib/admin/rules"

const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })
const KINDS: readonly DocumentKind[] = ["diplome", "attestation_inscription", "photo"]

/*
 * "Dossiers en attente de vérification" (the guide's title and columns):
 * every waiting file, oldest first, each row opening the file. On a phone the
 * table scrolls inside its card; the page never does.
 */
function QueueTable({ rows, studentsAdmitted }: { rows: QueueRow[]; studentsAdmitted: boolean }) {
  const t = words(admin).file
  const p = words(professionnelle)

  if (rows.length === 0) return <p className="text-corps text-encre-taupe">{t.vide}</p>

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.nom}</TableHead>
            <TableHead>{t.colonnes.profession}</TableHead>
            <TableHead>{t.colonnes.date}</TableHead>
            <TableHead>{t.colonnes.documents}</TableHead>
            <TableHead>{t.colonnes.statut}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.profileId}>
              <TableCell>
                <Link
                  href={`/admin/dossiers/${row.profileId}`}
                  className="font-semibold text-encre-sauge underline underline-offset-4"
                >
                  {row.firstName} {row.lastName}
                </Link>
              </TableCell>
              <TableCell>{row.profession ? p.professions[row.profession] : ""}</TableCell>
              <TableCell>{row.submittedAt ? date.format(row.submittedAt) : ""}</TableCell>
              <TableCell>
                {KINDS.filter((kind) => row.files[kind])
                  .map((kind) => fill(t.nombre, { document: t.documents[kind], n: String(row.files[kind]) }))
                  .join(", ")}
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-capsule bg-perle px-3 py-1 text-legende whitespace-nowrap">
                  {t.statuts[queueStatus(row, studentsAdmitted)]}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { QueueTable }
