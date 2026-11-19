import "server-only";

import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { sendEmail } from "@/lib/email/send";
import { creditGrantedEmail } from "@/lib/email/templates";
import { eurosFromCents } from "@/lib/paiements/rules";

import { grantedCreditNotice } from "./credits";
import { FAMILY_CREDITS_PATH } from "./paths";

/**
 * The family's e-mail when a founder grants her a credit of a garde's fee
 * (annulations-back-office): the amount, the night, the expiry and the way to
 * « Mes crédits », never the founders' note. It runs after the write
 * (`after()`), so a failed send is logged with ids only and never undoes the
 * credit; the idempotency key keeps a retried send single.
 */
export async function notifyCreditGranted(bookingId: string, siteUrl: string): Promise<void> {
  try {
    const credit = await grantedCreditNotice(bookingId);
    if (!credit) return;
    await sendEmail(
      credit.family.email,
      creditGrantedEmail({
        siteUrl,
        prenom: credit.family.firstName,
        montant: `${eurosFromCents(credit.amountCents)} €`,
        date: credit.nightDate ? formatDate(credit.nightDate) : "",
        expiration: formatDate(brusselsNow(credit.expiresAt).date),
        url: `${siteUrl}${FAMILY_CREDITS_PATH}`,
      }),
      `credit-offert-${credit.id}`,
    );
  } catch (error) {
    console.error("[credits] granted credit e-mail not sent", {
      bookingId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}
