import { CommuneShare } from "@/components/admin/commune-share"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { words } from "@/content/locale"
import type { CommuneRow } from "@/lib/admin/communes"

/*
 * The founders' communes (JAM-361): the name, the postcodes, the number of
 * validated professionals who serve the commune, and its share area. A count
 * only: no name of a family or of a professional. On a phone the table scrolls
 * inside its card; the page never does.
 */
function CommunesTable({ rows }: { rows: CommuneRow[] }) {
  const t = words(admin).communes

  return (
    <div className="rounded-carte bg-blanc p-4 md:p-6">
      <Table className="text-corps text-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.commune}</TableHead>
            <TableHead>{t.colonnes.codesPostaux}</TableHead>
            <TableHead>{t.colonnes.professionnelles}</TableHead>
            <TableHead>{t.colonnes.lien}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ins}>
              <TableCell className="align-top font-semibold">{row.name}</TableCell>
              <TableCell className="max-w-56 align-top whitespace-normal">{row.postcodes.join(", ")}</TableCell>
              <TableCell className="align-top">{row.professionals}</TableCell>
              <TableCell className="align-top whitespace-normal">
                <CommuneShare commune={row.name} url={row.shareUrl} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { CommunesTable }
