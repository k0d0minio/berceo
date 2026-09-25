import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { admin } from "@/content/admin"
import { fill, words } from "@/content/locale"
import type { AdminJournalEntry } from "@/db/schema"
import { formatDate } from "@/lib/demandes/format"

const day = new Intl.DateTimeFormat("fr-BE", { dateStyle: "short", timeZone: "Europe/Brussels" })
const time = new Intl.DateTimeFormat("fr-BE", { timeStyle: "short", timeZone: "Europe/Brussels" })

/*
 * The journal's rows with the guide's columns (Date, Heure, Action, Compte
 * concerné, Administrateur), in Brussels time, the reason or the detail under
 * the action. Read only: nothing on this page or anywhere else changes an
 * entry.
 */
function JournalTable({ entries }: { entries: AdminJournalEntry[] }) {
  const t = words(admin).journal

  const detail = (entry: AdminJournalEntry): string | null => {
    if (entry.action === "reglage_etudiantes") {
      return entry.detail === "admises" ? t.details.etudiantesAdmises : t.details.etudiantesNonAdmises
    }
    if (entry.action === "documents_supprimes") {
      return entry.detail === "suppression" ? t.details.suppression : t.details.purge
    }
    if (entry.action === "utilisateur_contacte" && entry.detail) return fill(t.details.objet, { objet: entry.detail })
    if (entry.action === "signalement_traite" && entry.detail) {
      return fill(t.details.garde, { date: formatDate(entry.detail) })
    }
    return entry.detail
  }

  return (
    <div className="rounded-carte border border-solid border-perle bg-blanc p-4">
      <Table className="text-corps text-encre-taupe">
        <TableHeader>
          <TableRow>
            <TableHead>{t.colonnes.date}</TableHead>
            <TableHead>{t.colonnes.heure}</TableHead>
            <TableHead>{t.colonnes.action}</TableHead>
            <TableHead>{t.colonnes.compte}</TableHead>
            <TableHead>{t.colonnes.administrateur}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const more = detail(entry)
            return (
              <TableRow key={entry.id} className="align-top">
                <TableCell>{day.format(entry.occurredAt)}</TableCell>
                <TableCell>{time.format(entry.occurredAt)}</TableCell>
                <TableCell className="whitespace-normal">
                  <span className="font-semibold">{t.actions[entry.action]}</span>
                  {more ? <span className="block max-w-md text-legende break-words">{more}</span> : null}
                </TableCell>
                <TableCell>{entry.subjectName ?? ""}</TableCell>
                <TableCell>{entry.adminUserId ? entry.adminName : t.automatique}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { JournalTable }
