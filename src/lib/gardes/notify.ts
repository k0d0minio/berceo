import "server-only";

import { formatDate, formatTime } from "@/lib/demandes/format";
import { sendEmail } from "@/lib/email/send";
import {
  absenceReportedEmail,
  gardeCancelledByFamilyEmail,
  gardeCancelledByProfessionalEmail,
  reminderFamilyEmail,
  reminderProfessionalEmail,
} from "@/lib/email/templates";
import { bookingFees } from "@/lib/paiements/payments";
import { familyBookingPath, PROFESSIONAL_BOOKINGS_PATH, professionalBookingPath } from "@/lib/reservations/paths";

import { claimReminders, gardeNotice, logError } from "./gardes";

/**
 * The e-mails of a garde's life. Each runs after the write it follows
 * (`after()`, or the reminder route after its claim), so a failed send is
 * logged with ids only and never undoes the write. Each send carries an
 * idempotency key, so a retry never sends twice. Links point at the
 * deployment that sent them.
 */

/** A cancellation (D-105): one e-mail to the other side of the one recorded. */
export async function notifyCancellation(bookingId: string, siteUrl: string): Promise<void> {
  try {
    const notice = await gardeNotice(bookingId);
    if (!notice || notice.cancellationKind !== "annulation") return;
    const date = formatDate(notice.nightDate);
    const key = `garde-annulee-${bookingId}`;
    if (notice.cancelledBy === "famille") {
      await sendEmail(
        notice.professional.email,
        gardeCancelledByFamilyEmail({
          siteUrl,
          prenom: notice.professional.firstName,
          prenomFamille: notice.family.firstName,
          date,
          url: `${siteUrl}${PROFESSIONAL_BOOKINGS_PATH}`,
        }),
        key,
      );
    } else {
      // The refund was attempted before this e-mail: say it is done only once Stripe did it (D-2).
      const fee = (await bookingFees([bookingId])).get(bookingId);
      const refund =
        fee?.status === "remboursee"
          ? "fait"
          : fee?.status === "payee" || fee?.status === "remboursement_echoue"
            ? "enCours"
            : null;
      await sendEmail(
        notice.family.email,
        gardeCancelledByProfessionalEmail({
          siteUrl,
          prenom: notice.family.firstName,
          professionnelle: notice.professional.firstName,
          date,
          refund,
          url: `${siteUrl}${familyBookingPath(bookingId)}`,
        }),
        key,
      );
    }
  } catch (error) {
    logError("cancellation e-mail not sent", { bookingId }, error);
  }
}

/** An absence reported (D-106): one e-mail to the side recorded absent, naming who reported it. */
export async function notifyAbsence(bookingId: string, siteUrl: string): Promise<void> {
  try {
    const notice = await gardeNotice(bookingId);
    if (!notice || notice.cancellationKind !== "absence") return;
    const date = formatDate(notice.nightDate);
    const familyAbsent = notice.cancelledBy === "famille";
    const absent = familyAbsent ? notice.family : notice.professional;
    const reporter = familyAbsent ? notice.professional : notice.family;
    await sendEmail(
      absent.email,
      absenceReportedEmail({
        siteUrl,
        prenom: absent.firstName,
        auteur: reporter.firstName,
        date,
        url: `${siteUrl}${familyAbsent ? familyBookingPath(bookingId) : professionalBookingPath(bookingId)}`,
      }),
      `garde-absence-${bookingId}`,
    );
  } catch (error) {
    logError("absence e-mail not sent", { bookingId }, error);
  }
}

export type ReminderOutcome = { gardes: number; failed: number };

/** Both reminders of one garde; returns how many of its two sends failed. */
async function remind(bookingId: string, siteUrl: string): Promise<number> {
  try {
    const notice = await gardeNotice(bookingId);
    if (!notice) return 0;
    const date = formatDate(notice.nightDate);
    const heure = formatTime(notice.startTime);
    const results = await Promise.allSettled([
      sendEmail(
        notice.family.email,
        reminderFamilyEmail({
          siteUrl,
          prenom: notice.family.firstName,
          professionnelle: notice.professional.firstName,
          date,
          heure,
          url: `${siteUrl}${familyBookingPath(bookingId)}`,
        }),
        `garde-rappel-${bookingId}-famille`,
      ),
      sendEmail(
        notice.professional.email,
        reminderProfessionalEmail({
          siteUrl,
          prenom: notice.professional.firstName,
          prenomFamille: notice.family.firstName,
          date,
          heure,
          url: `${siteUrl}${professionalBookingPath(bookingId)}`,
        }),
        `garde-rappel-${bookingId}-professionnelle`,
      ),
    ]);
    const failures = results.filter((result) => result.status === "rejected");
    for (const failure of failures) logError("reminder e-mail not sent", { bookingId }, failure.reason);
    return failures.length;
  } catch (error) {
    logError("reminder e-mails failed", { bookingId }, error);
    return 2;
  }
}

/**
 * The reminder of the day before (D-108): claims tomorrow's confirmed gardes,
 * then sends every garde's two e-mails at once rather than one garde after
 * another, so a long list finishes inside the function's time. The caller has
 * checked the hour.
 */
export async function sendReminders(now: Date, siteUrl: string): Promise<ReminderOutcome> {
  const ids = await claimReminders(now);
  const failed = await Promise.all(ids.map((bookingId) => remind(bookingId, siteUrl)));
  return { gardes: ids.length, failed: failed.reduce((sum, n) => sum + n, 0) };
}
