"use server";

import { revalidatePath } from "next/cache";

import { fullName } from "@/lib/admin/journal";
import { checkReason } from "@/lib/admin/rules";
import { currentUser } from "@/lib/auth/current-user";
import { UUID } from "@/lib/demandes/requests";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { refundFee } from "@/lib/paiements/payments";

/*
 * « Rembourser les frais » (D-101). The role is checked here at runtime,
 * whatever the page showed: a server action is reachable by anyone who can
 * post to it (Learned rules), and it answers a non-admin exactly as a failure.
 * The id and the reason are checked again; the refund itself holds its rules
 * in its SQL and at Stripe (one idempotency key per payment and attempt).
 */

export type RefundActionResult =
  | { ok: true; status: "remboursee" | "remboursement_echoue" }
  | { ok: false; error: "statut" | "generique" | "motifRequis" | "motifLong" };

export async function refundPaymentAction(paymentId: string, reason: string): Promise<RefundActionResult> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "admin") {
    console.error("[admin] refund refused: not an admin", { status: who.status });
    return { ok: false, error: "generique" };
  }
  if (typeof paymentId !== "string" || !UUID.test(paymentId)) return { ok: false, error: "generique" };
  const checked = checkReason(reason);
  if (!checked.ok) return { ok: false, error: checked.error };

  try {
    const result = await refundFee(paymentId, "berceo", new Date(), {
      admin: { id: who.user.id, name: fullName(who.user) },
      motif: checked.value,
    });
    if (!result.ok) return { ok: false, error: result.reason === "statut" ? "statut" : "generique" };
    revalidatePath(ADMIN_PAYMENTS_PATH);
    return { ok: true, status: result.status };
  } catch (error) {
    console.error("[admin] refund failed", {
      paymentId,
      error: error instanceof Error ? error.name : typeof error,
    });
    return { ok: false, error: "generique" };
  }
}
