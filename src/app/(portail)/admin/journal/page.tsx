import type { Metadata } from "next";
import Link from "next/link";

import { JournalTable } from "@/components/admin/journal-table";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { readJournal } from "@/lib/admin/journal";
import { journalPage } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";

const a = words(admin);

export const metadata: Metadata = {
  title: a.journal.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const JOURNAL = `${SPACES.admin}/journal`;
const link = "text-corps font-semibold text-encre-sauge underline underline-offset-4";

/*
 * "Journal des actions administratives" (verification-back-office): every
 * admin action, newest first, 50 per page. It cannot be edited or deleted,
 * here or in the database (D-54). A 404 to anyone but an admin (D-33).
 */
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAccess(JOURNAL);
  const page = journalPage((await searchParams).page);
  const { entries, pages } = await readJournal(page);

  return (
    <SpaceShell user={user} title={a.journal.titre}>
      <Link href={SPACES.admin} className={`self-start ${link}`}>
        {a.journal.retour}
      </Link>
      {entries.length === 0 ? (
        <p className="text-corps text-encre-taupe">{a.journal.vide}</p>
      ) : (
        <JournalTable entries={entries} />
      )}
      {pages > 1 ? (
        <nav className="flex flex-wrap items-center gap-6 text-corps text-encre-taupe">
          {page > 1 ? (
            <Link href={`${JOURNAL}?page=${page - 1}`} className={link}>
              {a.journal.precedente}
            </Link>
          ) : null}
          <span>{fill(a.journal.page, { n: String(page) })}</span>
          {page < pages ? (
            <Link href={`${JOURNAL}?page=${page + 1}`} className={link}>
              {a.journal.suivante}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </SpaceShell>
  );
}
