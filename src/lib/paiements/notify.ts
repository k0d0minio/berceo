import "server-only";

import { and, eq } from "drizzle-orm";

import { paiement } from "@/content/paiement";
import { fill, words } from "@/content/locale";
import { db, payments, users } from "@/db";
import { formatDate } from "@/lib/demandes/format";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { sendEmail } from "@/lib/email/send";
import { refundFamilyEmail } from "@/lib/email/templates";

import { eurosFromCents } from "./rules";

type RefundNotice = {
  requestId: string | null;
  nightDate: string;
  amountCents: number;
  family: { email: string; firstName: string };
};

/** What the refund e-mail needs, read by id after the refund it follows. */
async function refundNotice(paymentId: string): Promise<RefundNotice | null> {
  const [row] = await db
    .select({
      requestId: payments.requestId,
      nightDate: payments.nightDate,
      amountCents: payments.amountCents,
      family: { email: users.email, firstName: users.firstName },
    })
    .from(payments)
    .innerJoin(users, eq(users.id, payments.familyUserId))
    .where(and(eq(payments.id, paymentId), eq(payments.status, "remboursee")))
    .limit(1);
  return row ?? null;
}

/**
 * The family's e-mail when her paid fee could not book the garde and was
 * refunded at once (D-103): she may have closed Stripe's tab before the return
 * page said so. After the response (`after()`), logged with ids only, one per
 * payment (the idempotency key).
 */
export async function notifyRefund(paymentId: string, siteUrl: string): Promise<void> {
  try {
    const notice = await refundNotice(paymentId);
    if (!notice) return;
    const path = notice.requestId ? familyRequestPath(notice.requestId) : FAMILY_REQUESTS_PATH;
    await sendEmail(
      notice.family.email,
      refundFamilyEmail({
        siteUrl,
        prenom: notice.family.firstName,
        date: formatDate(notice.nightDate),
        montant: fill(words(paiement).recapitulatif.montant, { montant: eurosFromCents(notice.amountCents) }),
        url: `${siteUrl}${path}`,
      }),
      `remboursement-frais-${paymentId}`,
    );
  } catch (error) {
    console.error("[paiements] refund e-mail not sent", {
      paymentId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}
