import "server-only";

import { count, desc, eq, sql, type SQL } from "drizzle-orm";

import { adminJournal, db, type AdminAction, type AdminJournalEntry } from "@/db";

import { JOURNAL_PAGE_SIZE } from "./rules";

/**
 * The admin journal (verification-back-office, D-54): the one way an admin
 * action is recorded, for this stub's decisions, the students switch and the
 * purge, and for every later admin action (stub 14). It only ever inserts and
 * reads: there is no update or delete here, and the database refuses both
 * anyway (the trigger in drizzle/0004_verification_back_office.sql).
 *
 * People are kept as an id and their name as it was, so a later change to an
 * account never rewrites what was done. `admin: null` means Berceo did it.
 */

export type Person = { id: string; name: string };

export type NewJournalEntry = {
  action: AdminAction;
  subject: Person | null;
  admin: Person | null;
  detail?: string | null;
  at?: Date;
};

/** "Prénom Nom", the way the journal and the dialogs name someone. */
export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

/**
 * The insert for one entry, unawaited, so a caller can put it in the same
 * `db.batch` (one transaction) as the change it records, or await it alone.
 */
export function journalInsert(entry: NewJournalEntry) {
  return db.insert(adminJournal).values({
    occurredAt: entry.at ?? new Date(),
    action: entry.action,
    subjectUserId: entry.subject?.id ?? null,
    subjectName: entry.subject?.name ?? null,
    adminUserId: entry.admin?.id ?? null,
    adminName: entry.admin?.name ?? null,
    detail: entry.detail ?? null,
  });
}

/**
 * The same insert as a statement that writes the entry only when `condition`
 * holds, for a batch whose earlier statement may not have taken (a second
 * founder acted first): the entry and the change it records stand or fall
 * together (back-office-admin).
 */
export function journalInsertIf(entry: NewJournalEntry, condition: SQL) {
  return db.execute<{ id: string }>(sql`
    insert into ${adminJournal} (occurred_at, action, subject_user_id, subject_name, admin_user_id, admin_name, detail)
    select ${(entry.at ?? new Date()).toISOString()}::timestamptz, ${entry.action}::admin_action,
           ${entry.subject?.id ?? null}::uuid, ${entry.subject?.name ?? null}::text,
           ${entry.admin?.id ?? null}::uuid, ${entry.admin?.name ?? null}::text, ${entry.detail ?? null}::text
    where ${condition}
    returning id
  `);
}

/** One page of the journal, newest first. */
export async function readJournal(
  page: number,
): Promise<{ entries: AdminJournalEntry[]; pages: number }> {
  const [entries, [total]] = await Promise.all([
    db
      .select()
      .from(adminJournal)
      .orderBy(desc(adminJournal.occurredAt), desc(adminJournal.id))
      .limit(JOURNAL_PAGE_SIZE)
      .offset((page - 1) * JOURNAL_PAGE_SIZE),
    db.select({ n: count() }).from(adminJournal),
  ]);
  return { entries, pages: Math.max(1, Math.ceil(total.n / JOURNAL_PAGE_SIZE)) };
}

/** Every entry about one account, newest first: a file's history. */
export async function journalFor(subjectUserId: string): Promise<AdminJournalEntry[]> {
  return db
    .select()
    .from(adminJournal)
    .where(eq(adminJournal.subjectUserId, subjectUserId))
    .orderBy(desc(adminJournal.occurredAt), desc(adminJournal.id));
}
