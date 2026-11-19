"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_PROMO_CODES_PATH } from "@/lib/abonnements/paths";
import { createPromoCode, deactivatePromoCode } from "@/lib/abonnements/promo-codes";
import { parsePromoCode, type PromoCodeError, type PromoCodeInput } from "@/lib/abonnements/rules";
import { fullName } from "@/lib/admin/journal";
import { currentUser } from "@/lib/auth/current-user";

/*
 * « Codes promo » (JAM-304): make a code, deactivate a code. The role is
 * checked here at runtime, whatever the page showed: a server action is
 * reachable by anyone who can post to it, and it answers a non-admin exactly
 * as a failure. The form is read again with `parsePromoCode`.
 */

async function admin() {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] promotion code action refused: not an admin", { status: who.status });
    return null;
  }
  return who.user;
}

export type CreatePromoCodeActionResult =
  | { ok: true; code: string }
  | { ok: false; error: PromoCodeError | "pris" | "generique" };

export async function createPromoCodeAction(input: PromoCodeInput): Promise<CreatePromoCodeActionResult> {
  const user = await admin();
  if (!user) return { ok: false, error: "generique" };
  const fields: PromoCodeInput = {
    code: String(input?.code ?? ""),
    kind: String(input?.kind ?? ""),
    value: String(input?.value ?? ""),
    endsOn: String(input?.endsOn ?? ""),
    maxUses: String(input?.maxUses ?? ""),
  };
  const now = new Date();
  const parsed = parsePromoCode(fields, now);
  if (!parsed.ok) return parsed;

  const result = await createPromoCode(parsed.draft, { id: user.id, name: fullName(user) }, now);
  if (result.ok) revalidatePath(ADMIN_PROMO_CODES_PATH);
  return result;
}

export async function deactivatePromoCodeAction(id: string): Promise<{ ok: boolean }> {
  const user = await admin();
  if (!user) return { ok: false };
  const result = await deactivatePromoCode(String(id), { id: user.id, name: fullName(user) }, new Date());
  if (result.ok) revalidatePath(ADMIN_PROMO_CODES_PATH);
  return result;
}
