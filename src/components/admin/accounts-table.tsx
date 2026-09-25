import Link from "next/link"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { words } from "@/content/locale"
import type { AccountRow } from "@/lib/admin/accounts"
import { adminUserPath } from "@/lib/admin/paths"

const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })

/*
 * The accounts the search found, or the newest ones: name (opening « Voir le
 * profil »), role, e-mail, phone, state and sign-up date. On a phone the table
 * scrolls inside its card; the page never does.
 */
function AccountsTable({ rows }: { rows: AccountRow[] }) {
  const t = words(admin).utilisateurs

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.nom}</TableHead>
            <TableHead>{t.colonnes.role}</TableHead>
            <TableHead>{t.colonnes.email}</TableHead>
            <TableHead>{t.colonnes.telephone}</TableHead>
            <TableHead>{t.colonnes.etat}</TableHead>
            <TableHead>{t.colonnes.inscription}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link
                  href={adminUserPath(row.id)}
                  className="font-semibold text-encre-sauge underline underline-offset-4"
                >
                  {`${row.firstName} ${row.lastName}`.trim()}
                </Link>
              </TableCell>
              <TableCell>{t.roles[row.role]}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone ?? ""}</TableCell>
              <TableCell className={row.suspendedAt ? "font-semibold" : undefined}>
                {row.suspendedAt ? t.etats.suspendu : t.etats.actif}
              </TableCell>
              <TableCell>{date.format(row.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { AccountsTable }
