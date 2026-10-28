import "server-only";

import { and, eq } from "drizzle-orm";

import { db, subscriptions, users } from "@/db";
import { sendEmail } from "@/lib/email/send";
import { gracePeriodEmail } from "@/lib/email/templates";

import { planWords, renewalDate } from "./format";
import { SUBSCRIPTION_PATH } from "./paths";

/**
 * The family's one e-mail when a renewal fails (abonnements-espace-echec-paiement):
 * the grace period's last day and Stripe's page for the unpaid invoice, or
 * « Votre abonnement » when Stripe gave none. `syncSubscription` calls it
 * after the response (`after()`), once, from the call that moved the row into
 * `impayee`. The row is read again: a renewal paid in the meantime sends
 * nothing. Logged with ids only, one per grace period (the idempotency key).
 */
export async function notifyGracePeriod(rowId: string, invoiceUrl: string | null, siteUrl: string): Promise<void> {
  try {
    const [row] = await db
      .select({
        plan: subscriptions.plan,
        graceEndsAt: subscriptions.graceEndsAt,
        family: { email: users.email, firstName: users.firstName },
      })
      .from(subscriptions)
      .innerJoin(users, eq(users.id, subscriptions.userId))
      .where(and(eq(subscriptions.id, rowId), eq(subscriptions.status, "impayee")))
      .limit(1);
    if (!row?.graceEndsAt) return;
    await sendEmail(
      row.family.email,
      gracePeriodEmail({
        siteUrl,
        prenom: row.family.firstName,
        formule: planWords(row.plan).name,
        date: renewalDate(row.graceEndsAt),
        invoiceUrl,
        url: `${siteUrl}${SUBSCRIPTION_PATH}`,
      }),
      `abonnement-impaye-${rowId}-${row.graceEndsAt.getTime()}`,
    );
  } catch (error) {
    console.error("[abonnements] grace period e-mail not sent", {
      rowId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}
