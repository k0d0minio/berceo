"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import {
  contactAccount,
  deleteAccount,
  reactivateAccount,
  suspendAccount,
  type ActResult,
  type ContactResult,
  type DeleteResult,
} from "@/lib/admin/accounts";
import { fullName } from "@/lib/admin/journal";
import { ADMIN_USERS_PATH, adminUserPath } from "@/lib/admin/paths";
import { UUID } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { SPACES } from "@/lib/auth/routing";
import { notifyDeclined } from "@/lib/reservations/notify";
import { siteOrigin } from "@/lib/site-origin";

/*
 * The four acts on an account (back-office-admin, D-134 to D-138). The role is
 * checked here at runtime, whatever the page showed: a server action is
 * reachable by anyone who can post to it (Learned rules), and it answers a
 * non-admin exactly as a failure. Every argument is checked too; the rules
 * are held again in each write's SQL.
 */

async function admin() {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] account action refused: not an admin", { status: who.status });
    return null;
  }
  return who.user;
}

function refresh(userId: string) {
  revalidatePath(SPACES.admin, "layout");
  revalidatePath(ADMIN_USERS_PATH);
  revalidatePath(adminUserPath(userId));
}

/** « Suspendre le compte »; the professionals whose answers it declined are told after the response. */
export async function suspendAction(userId: string): Promise<ActResult> {
  const user = await admin();
  if (!user || typeof userId !== "string" || !UUID.test(userId)) return { ok: false, error: "generique" };

  const result = await suspendAccount(userId, { id: user.id, name: fullName(user) }, new Date());
  if (!result.ok) return result;
  if (result.declined.length > 0) {
    const origin = await siteOrigin();
    const declined = result.declined;
    after(() => notifyDeclined(declined, origin));
  }
  refresh(userId);
  return { ok: true };
}

/** « Réactiver le compte ». */
export async function reactivateAction(userId: string): Promise<ActResult> {
  const user = await admin();
  if (!user || typeof userId !== "string" || !UUID.test(userId)) return { ok: false, error: "generique" };

  const result = await reactivateAccount(userId, { id: user.id, name: fullName(user) }, new Date());
  if (result.ok) refresh(userId);
  return result;
}

/** « Supprimer le compte », confirmed by her last name typed in the dialog. */
export async function deleteAction(userId: string, lastName: string): Promise<DeleteResult> {
  const user = await admin();
  if (!user || typeof userId !== "string" || !UUID.test(userId) || typeof lastName !== "string") {
    return { ok: false, error: "generique" };
  }

  const result = await deleteAccount(userId, lastName.slice(0, 200), { id: user.id, name: fullName(user) }, new Date());
  if (result.ok) refresh(userId);
  return result;
}

/** « Contacter l'utilisateur »: the e-mail leaves with the founder's own address to answer to. */
export async function contactAction(
  userId: string,
  input: { subject: string; message: string },
): Promise<ContactResult> {
  const user = await admin();
  if (!user || typeof userId !== "string" || !UUID.test(userId) || !input || typeof input !== "object") {
    return { ok: false, error: "introuvable" };
  }

  const result = await contactAccount(
    userId,
    { subject: input.subject, message: input.message },
    { id: user.id, name: fullName(user), email: user.email },
    await siteOrigin(),
    randomUUID(),
  );
  if (result.ok) refresh(userId);
  return result;
}
