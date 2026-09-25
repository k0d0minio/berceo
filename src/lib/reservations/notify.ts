import "server-only";

import { formatDate, formatTime } from "@/lib/demandes/format";
import { logFailures, summary } from "@/lib/demandes/notify";
import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { sendEmail } from "@/lib/email/send";
import {
  bookingFamilyEmail,
  bookingProfessionalEmail,
  newAnswerEmail,
  notRetainedEmail,
  priorityRequestEmail,
} from "@/lib/email/templates";

import { professionInSentence } from "./format";
import { answerNotice, bookingNotice, declinedNotices, priorityNotice } from "./notices";
import { familyBookingPath, professionalBookingPath, professionalProfilePath } from "./paths";

/**
 * The e-mails of an answer and a booking. Each runs after the response
 * (`after()`), so a failed send is logged with ids only and never undoes the
 * write it follows. Links point at the deployment that sent them. Each send
 * carries an idempotency key, so a retry never sends twice.
 */

function logError(what: string, context: Record<string, unknown>, error: unknown): void {
  console.error(`[reservations] ${what}`, {
    ...context,
    error: error instanceof Error ? error.name : typeof error,
  });
}

/** A new answer: « [Prénom] a répondu à votre demande », one per answer given (a re-answer included). */
export async function notifyNewAnswer(applicationId: string, answerCount: number, siteUrl: string): Promise<void> {
  try {
    const notice = await answerNotice(applicationId);
    if (!notice) return;
    const { family, professional } = notice;
    await sendEmail(
      family.email,
      newAnswerEmail({
        siteUrl,
        prenom: family.firstName,
        professionnelle: {
          prenom: professional.firstName,
          profession: professionInSentence(professional.profession),
        },
        date: formatDate(notice.nightDate),
        url: `${siteUrl}${professionalProfilePath(professional.profileId, notice.requestId)}`,
      }),
      `reponse-${applicationId}-${answerCount}`,
    );
  } catch (error) {
    logError("answer e-mail not sent", { applicationId }, error);
  }
}

/** « Not retained »: to each professional whose waiting answer was declined (D-70, D-76). */
export async function notifyDeclined(applicationIds: string[], siteUrl: string): Promise<void> {
  if (applicationIds.length === 0) return;
  try {
    const notices = await declinedNotices(applicationIds);
    const url = `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`;
    const results = await Promise.allSettled(
      notices.map((n) =>
        sendEmail(
          n.email,
          notRetainedEmail({ siteUrl, prenom: n.firstName, url, request: summary(n.request) }),
          `non-retenue-${n.key}`,
        ),
      ),
    );
    logFailures("not-retained e-mail", results, notices.map((n) => n.key));
  } catch (error) {
    logError("not-retained e-mails failed", { applicationIds }, error);
  }
}

/** A booking: the guide's two confirmations, then « not retained » to the others who waited. */
export async function notifyBooking(bookingId: string, declined: string[], siteUrl: string): Promise<void> {
  try {
    const notice = await bookingNotice(bookingId);
    if (notice) {
      const date = formatDate(notice.nightDate);
      const results = await Promise.allSettled([
        sendEmail(
          notice.family.email,
          bookingFamilyEmail({
            siteUrl,
            prenom: notice.family.firstName,
            professionnelle: notice.professional.firstName,
            date,
            heure: formatTime(notice.startTime),
            url: `${siteUrl}${familyBookingPath(bookingId)}`,
          }),
          `reservation-famille-${bookingId}`,
        ),
        sendEmail(
          notice.professional.email,
          bookingProfessionalEmail({
            siteUrl,
            prenom: notice.professional.firstName,
            prenomFamille: notice.family.firstName,
            date,
            url: `${siteUrl}${professionalBookingPath(bookingId)}`,
          }),
          `reservation-professionnelle-${bookingId}`,
        ),
      ]);
      logFailures("booking e-mail", results, [bookingId, bookingId]);
    }
  } catch (error) {
    logError("booking e-mails failed", { bookingId }, error);
  }
  await notifyDeclined(declined, siteUrl);
}

/** A request sent in priority: to the professional it was sent to, at once (D-71). */
export async function notifyPriority(requestId: string, siteUrl: string): Promise<void> {
  try {
    const notice = await priorityNotice(requestId);
    if (!notice) return;
    await sendEmail(
      notice.email,
      priorityRequestEmail({
        siteUrl,
        prenom: notice.firstName,
        url: `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`,
        request: summary(notice.request),
      }),
      `priorite-${requestId}`,
    );
  } catch (error) {
    logError("priority e-mail not sent", { requestId }, error);
  }
}
