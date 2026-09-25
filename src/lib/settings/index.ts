import "server-only";

import { eq } from "drizzle-orm";

import { appSettings, db } from "@/db";
import { journalInsert, type Person } from "@/lib/admin/journal";

/**
 * The founders' switches, stored in `app_settings`. No row means off.
 *
 * `etudiantes_admises` (D-7): whether "étudiante sage-femme (3e ou 4e année)"
 * is offered at step 2. Off until the founders' insurer confirms a solution.
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
