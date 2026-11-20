import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { appSettings, db } from "@/db";
import { journalInsert, type Person } from "@/lib/admin/journal";
import { CANCELLATION_DELAY_HOURS, isCancellationDelay } from "@/lib/gardes/rules";

/**
 * The founders' settings, stored in `app_settings`. No row means the default.
 *
 * `etudiantes_admises` (D-7): whether the two student years ("étudiante
 * sage-femme, 3e année" and "4e année") are offered at step 2. Off until the founders' insurer confirms a solution.
 */
export const STUDENTS_ADMITTED = "etudiantes_admises";

export async function studentsAdmitted(): Promise<boolean> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, STUDENTS_ADMITTED))
    .limit(1);
  return row?.value === true;
}

/** The journal's detail for the switch's new value (`admin.journal.details`). */
export const STUDENTS_DETAIL = { true: "admises", false: "non_admises" } as const;

/**
 * Records the switch, who flipped it and when, and its journal entry in the
 * same transaction (Neon runs a batch as one). The caller has checked the role.
 */
export async function setStudentsAdmitted(value: boolean, by: Person): Promise<void> {
  const now = new Date();
  await db.batch([
    db
      .insert(appSettings)
      .values({ key: STUDENTS_ADMITTED, value, updatedAt: now, updatedBy: by.id })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value, updatedAt: now, updatedBy: by.id },
      }),
    journalInsert({
      action: "reglage_etudiantes",
      subject: null,
      admin: by,
      detail: STUDENTS_DETAIL[`${value}`],
      at: now,
    }),
  ]);
}

/** When the switch last moved and who moved it, for the admin page. */
export async function studentsSetting(): Promise<{
  value: boolean;
  updatedAt: Date | null;
  updatedBy: string | null;
}> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, STUDENTS_ADMITTED))
    .limit(1);
  return {
    value: row?.value === true,
    updatedAt: row?.updatedAt ?? null,
    updatedBy: row?.updatedBy ?? null,
  };
}

/**
 * A counter in a time window (JAM-341, the contact form's send limit): rows
 * whose key starts with `prefix`, whose `value` is the count and whose
 * `updated_at` is the start of the window. They are not founders' settings:
 * they have no author and no journal entry.
 *
 * Adds one to the counter of `key` and returns the new count. The count is one
 * atomic statement (an upsert), so two requests at the same time get two
 * different counts. A window that started at or before `expiredAt` is over:
 * the batch first removes each such row of the prefix, so no key stays after
 * its window, and the upsert starts a new window at 1. The caller gives both
 * instants (`src/lib/contact/rate-limit.ts` has the rule).
 */
export async function countInWindow(input: {
  key: string;
  prefix: string;
  now: Date;
  expiredAt: Date;
}): Promise<number> {
  const { key, prefix, now, expiredAt } = input;
  const over = sql`${appSettings.updatedAt} <= ${expiredAt.toISOString()}::timestamptz`;
  const [, rows] = await db.batch([
    db.delete(appSettings).where(and(sql`starts_with(${appSettings.key}, ${prefix})`, over)),
    db
      .insert(appSettings)
      .values({ key, value: 1, updatedAt: now, updatedBy: null })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: sql`case when ${over} then '1'::jsonb else to_jsonb((${appSettings.value} #>> '{}')::int + 1) end`,
          updatedAt: sql`case when ${over} then ${now.toISOString()}::timestamptz else ${appSettings.updatedAt} end`,
        },
      })
      .returning({ value: appSettings.value }),
  ]);
  const count = rows[0]?.value;
  if (typeof count !== "number") throw new Error("settings: the counter has no count");
  return count;
}

/**
 * `delai_annulation_heures` (annulations-delai-et-motif, the answers [9.2]):
 * how many hours before the start hour a cancellation becomes late. 24 by
 * default; a missing or broken row reads as the default. The rules of
 * `src/lib/gardes/rules.ts` take it as `delayHours`.
 */
export const CANCELLATION_DELAY = "delai_annulation_heures";

function delayOf(value: unknown): number {
  return isCancellationDelay(value) ? value : CANCELLATION_DELAY_HOURS;
}

export async function cancellationDelayHours(): Promise<number> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, CANCELLATION_DELAY))
    .limit(1);
  return delayOf(row?.value);
}

/**
 * Records the delay, who changed it and when, and its journal entry with the
 * new value in hours, in the same transaction. The caller has checked the role
 * and the value.
 */
export async function setCancellationDelayHours(hours: number, by: Person): Promise<void> {
  const now = new Date();
  await db.batch([
    db
      .insert(appSettings)
      .values({ key: CANCELLATION_DELAY, value: hours, updatedAt: now, updatedBy: by.id })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: hours, updatedAt: now, updatedBy: by.id },
      }),
    journalInsert({
      action: "reglage_delai_annulation",
      subject: null,
      admin: by,
      detail: String(hours),
      at: now,
    }),
  ]);
}

/**
 * The delay, and when it last changed and who changed it, for the admin page.
 * The migration's row has no author: it reads as never changed.
 */
export async function cancellationDelaySetting(): Promise<{
  value: number;
  updatedAt: Date | null;
  updatedBy: string | null;
}> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, CANCELLATION_DELAY))
    .limit(1);
  const changed = row?.updatedBy ? row : null;
  return {
    value: delayOf(row?.value),
    updatedAt: changed?.updatedAt ?? null,
    updatedBy: changed?.updatedBy ?? null,
  };
}
