"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";
import { setStudentsAdmitted } from "@/lib/settings";

/*
 * The founders' switches. The role is checked here at runtime, whatever the
 * page showed: a server action is reachable by anyone who can post to it
 * (Learned rules), and it answers a non-admin exactly as a failure.
 */

export type SettingResult = { ok: true } | { ok: false };

export async function setStudents(value: boolean): Promise<SettingResult> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] students switch refused: not an admin", { status: who.status });
    return { ok: false };
  }
  if (typeof value !== "boolean") return { ok: false };

  try {
    await setStudentsAdmitted(value, who.user.id);
  } catch (error) {
    console.error("[admin] students switch not saved", { error });
    return { ok: false };
  }
  revalidatePath(SPACES.admin);
  return { ok: true };
}
