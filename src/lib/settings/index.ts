import "server-only";

import { eq } from "drizzle-orm";

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
