import "server-only";

import type { RatingSide } from "@/db";
import { formatDate } from "@/lib/demandes/format";
import { sendEmail } from "@/lib/email/send";
import { ratingFamilyEmail, ratingProfessionalEmail } from "@/lib/email/templates";
import { gardeNotice } from "@/lib/gardes/gardes";

import { familyRatingPath, professionalRatingPath } from "./paths";
import { claimInvitation, invitationsDue, logError, releaseInvitation } from "./ratings";

/**
 * The invitation to rate (avis-etoiles, D-120): once a garde is terminée, each
 * side gets one e-mail linking to its form, the family the guide's
 * « Demande d'avis post-garde » verbatim. Called every hour by
 * `/api/cron/avis-invitations`. Each side is claimed just before its send and
 * released when the send fails, so the next pass tries again and two passes
 * never both send it; the idempotency key keeps a retried send single at
 * Resend. The SQL of `invitationsDue` and `claimInvitation` holds the rest: a
 * garde not annulée, inside its window, a side that has not rated.
 */

export type InvitationOutcome = { sent: number; failed: number };

async function invite(bookingId: string, side: RatingSide, siteUrl: string): Promise<void> {
  const notice = await gardeNotice(bookingId);
  if (!notice) return;
  const email =
    side === "famille"
      ? ratingFamilyEmail({
          siteUrl,
          prenom: notice.family.firstName,
          professionnelle: notice.professional.firstName,
          url: `${siteUrl}${familyRatingPath(bookingId)}`,
        })
      : ratingProfessionalEmail({
          siteUrl,
          prenom: notice.professional.firstName,
          prenomFamille: notice.family.firstName,
          date: formatDate(notice.nightDate),
          url: `${siteUrl}${professionalRatingPath(bookingId)}`,
        });
  const to = side === "famille" ? notice.family.email : notice.professional.email;
  await sendEmail(to, email, `avis-invitation-${bookingId}-${side}`);
}

export async function sendInvitations(now: Date, siteUrl: string): Promise<InvitationOutcome> {
  let sent = 0;
  let failed = 0;
  for (const { bookingId, side } of await invitationsDue()) {
    if (!(await claimInvitation(bookingId, side, now))) continue;
    try {
      await invite(bookingId, side, siteUrl);
      sent += 1;
    } catch (error) {
      failed += 1;
      logError("rating invitation not sent", { bookingId, side }, error);
      await releaseInvitation(bookingId, side).catch((releaseError: unknown) =>
        logError("rating invitation claim not released", { bookingId, side }, releaseError),
      );
    }
  }
  return { sent, failed };
}
