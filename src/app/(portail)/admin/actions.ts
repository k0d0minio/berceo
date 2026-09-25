"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { profileStatusEnum, type ProfileStatus } from "@/db/schema";
import { fullName } from "@/lib/admin/journal";
import { decide, type DecisionResult } from "@/lib/admin/review";
import { isDecision } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";
import { setStudentsAdmitted } from "@/lib/settings";

/*
 * The founders' actions: the students switch and the three decisions on a
 * file. The role is checked here at runtime, whatever the page showed: a
 * server action is reachable by anyone who can post to it (Learned rules), and
 * it answers a non-admin exactly as a failure. Every argument is checked too.
 */

async function admin() {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] action refused: not an admin", { status: who.status });
    return null;
  }
  return who.user;
}

export type SettingResult = { ok: true } | { ok: false };

export async function setStudents(value: boolean): Promise<SettingResult> {
  const user = await admin();
  if (!user) return { ok: false };
  if (typeof value !== "boolean") return { ok: false };

  try {
    await setStudentsAdmitted(value, { id: user.id, name: fullName(user) });
  } catch (error) {
    console.error("[admin] students switch not saved", { error });
    return { ok: false };
  }
  revalidatePath(SPACES.admin);
  return { ok: true };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DecisionRequest = {
  profileId: string;
  decision: string;
  reason?: string;
  expected: { status: string; reviewedAt: string | null };
};

/** "Valider le profil", "Demander un complément", "Refuser le profil". */
export async function decideFile(request: DecisionRequest): Promise<DecisionResult> {
  const user = await admin();
  if (!user) return { ok: false, error: "generique" };

  if (!request || typeof request !== "object") return { ok: false, error: "generique" };
  const { profileId, decision, reason, expected } = request;
  if (
    typeof profileId !== "string" ||
    !UUID.test(profileId) ||
    !isDecision(decision) ||
    !expected ||
    typeof expected !== "object" ||
    !(profileStatusEnum.enumValues as readonly string[]).includes(expected.status) ||
    (expected.reviewedAt !== null && (typeof expected.reviewedAt !== "string" || Number.isNaN(Date.parse(expected.reviewedAt))))
  ) {
    return { ok: false, error: "generique" };
  }

  const siteUrl = (await headers()).get("origin") ?? "";
  const result = await decide(
    {
      profileId,
      decision,
      reason,
      expected: { status: expected.status as ProfileStatus, reviewedAt: expected.reviewedAt },
    },
    user,
    siteUrl,
  );
  if (result.ok) {
    revalidatePath(SPACES.admin);
    revalidatePath(`${SPACES.admin}/dossiers/${profileId}`);
  }
  return result;
}
