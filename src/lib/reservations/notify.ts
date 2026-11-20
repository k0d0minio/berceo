import "server-only";

import { fill, words } from "@/content/locale";
import { paiement } from "@/content/paiement";
import { formatDate, formatTime } from "@/lib/demandes/format";
import { logFailures, seriesSummary, summary } from "@/lib/demandes/notify";
import { PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths";
import { sendEmail } from "@/lib/email/send";
import { eurosFromCents } from "@/lib/paiements/rules";
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
        horaireAdapte: notice.adapted,
      }),
      `reponse-${applicationId}-${answerCount}`,
    );
  } catch (error) {
    logError("answer e-mail not sent", { applicationId }, error);
  }
}

/**
 * « Not retained »: to each professional whose waiting answer was declined
 * (D-70, D-76). Her declined nights of one regular request are told once, with
 * one of its nights (JAM-302): she answered them as one.
 */
export async function notifyDeclined(applicationIds: string[], siteUrl: string): Promise<void> {
  if (applicationIds.length === 0) return;
  try {
    const all = await declinedNotices(applicationIds);
    const seen = new Set<string>();
    const notices = all.filter((n) => {
      if (!n.seriesId) return true;
      const key = `${n.email}|${n.seriesId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const url = `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`;
    const results = await Promise.allSettled(
      notices.map((n) =>
        sendEmail(
          n.email,
          // The request can be booked by now: its start is then another professional's proposal (JAM-306).
          // `summary` gives her the night at the start the family asked for (JAM-351).
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

/**
 * The credit line of her confirmation (credits-au-paiement): the fee, the
 * credit's part and what Stripe took. Nothing when no credit paid.
 */
function creditLine(fee: { amountCents: number; creditCents: number }) {
  if (fee.creditCents <= 0) return undefined;
  const euros = (cents: number) => fill(words(paiement).recapitulatif.montant, { montant: eurosFromCents(cents) });
  const rest = fee.amountCents - fee.creditCents;
  return { montant: euros(fee.amountCents), credit: euros(fee.creditCents), reste: rest > 0 ? euros(rest) : null };
}

/** A booking: the guide's two confirmations, then « not retained » to the others who waited. */
export async function notifyBooking(
  bookingId: string,
  declined: string[],
  siteUrl: string,
  /** The fee that made the booking, from the caller that holds it: its credit part goes in her e-mail. */
  fee?: { amountCents: number; creditCents: number },
): Promise<void> {
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
            credit: fee ? creditLine(fee) : undefined,
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

/**
 * The booking of a regular request (JAM-302): one pair of confirmations for
 * all its nights, keyed by the first night's booking, so a retry sends it
 * once; then « not retained » to the others who waited, once each. The dates
 * are every night booked, in order. The hour is the agreed start: said once
 * when every night has the same, and night by night when they differ (JAM-351),
 * because each night of an answer can hold its own proposed start (JAM-306).
 */
export async function notifySeriesBooking(
  bookingIds: readonly string[],
  declined: string[],
  siteUrl: string,
  fee?: { amountCents: number; creditCents: number },
): Promise<void> {
  const [firstId] = bookingIds;
  if (!firstId) return;
  try {
    const notices = (await Promise.all(bookingIds.map((id) => bookingNotice(id)))).filter(
      (n): n is NonNullable<typeof n> => n !== null,
    );
    const sorted = [...notices].sort((a, b) => a.nightDate.localeCompare(b.nightDate));
    const [notice] = sorted;
    if (notice) {
      const date = sorted.map((n) => formatDate(n.nightDate)).join(", ");
      const heures = sorted.map((n) => formatTime(n.startTime));
      const nuits = heures.some((heure) => heure !== heures[0])
        ? sorted.map((n, i) => ({ date: formatDate(n.nightDate), heure: heures[i] }))
        : undefined;
      const results = await Promise.allSettled([
        sendEmail(
          notice.family.email,
          bookingFamilyEmail({
            siteUrl,
            prenom: notice.family.firstName,
            professionnelle: notice.professional.firstName,
            date,
            heure: heures[0],
            nuits,
            url: `${siteUrl}${familyBookingPath(notice.id)}`,
            credit: fee ? creditLine(fee) : undefined,
          }),
          `reservation-famille-${firstId}`,
        ),
        sendEmail(
          notice.professional.email,
          bookingProfessionalEmail({
            siteUrl,
            prenom: notice.professional.firstName,
            prenomFamille: notice.family.firstName,
            date,
            url: `${siteUrl}${professionalBookingPath(notice.id)}`,
          }),
          `reservation-professionnelle-${firstId}`,
        ),
      ]);
      logFailures("booking e-mail", results, [firstId, firstId]);
    }
  } catch (error) {
    logError("booking e-mails failed", { bookingId: firstId }, error);
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

/**
 * Regular nights sent in priority (demande-nuits-regulieres, D-71): one e-mail
 * for the series, with each night still open, keyed by its first night, so a
 * retry sends it once. Each night is a request she answers on its own.
 */
export async function notifySeriesPriority(requestIds: readonly string[], siteUrl: string): Promise<void> {
  if (requestIds.length === 0) return;
  try {
    const notices = (await Promise.all(requestIds.map((id) => priorityNotice(id)))).filter(
      (notice) => notice !== null,
    );
    if (notices.length === 0) return;
    const [first] = notices;
    const nights = notices
      .map((notice) => notice.request)
      .sort((a, b) => a.nightDate.localeCompare(b.nightDate));
    await sendEmail(
      first.email,
      priorityRequestEmail({
        siteUrl,
        prenom: first.firstName,
        url: `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`,
        request: seriesSummary(nights),
      }),
      `priorite-${requestIds[0]}`,
    );
  } catch (error) {
    logError("priority e-mail not sent", { requestId: requestIds[0] }, error);
  }
}
