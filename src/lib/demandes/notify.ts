import "server-only";

import { createHash } from "node:crypto";

import { communeName } from "@/lib/communes";
import { sendEmail } from "@/lib/email/send";
import {
  requestDigestEmail,
  urgentRequestEmail,
  type RequestSummary,
} from "@/lib/email/templates";

import { childrenLine, formatDate, nightLine } from "./format";
import { PROFESSIONAL_REQUESTS_PATH } from "./paths";
import {
  claimDigestRequests,
  digestSentOn,
  professionalsServing,
  requestForNotice,
  type Recipient,
  type RequestCard,
} from "./requests";
import { brusselsNow, isDigestTime } from "./rules";

/**
 * The two e-mails a professional receives about requests in her communes
 * (D-61): an urgent request at once, the normal ones in one digest a day at
 * 18:00 in Brussels. Links point at the deployment that sent them, so a UAT
 * e-mail opens UAT. A failed send is logged with ids only and never undoes a
 * request.
 */


function summary(request: RequestCard): RequestSummary {
  return {
    commune: communeName(request.communeIns) ?? request.locality,
    nuit: nightLine(request.nightDate, request.startTime),
    enfants: childrenLine(request.children, request.babyAgeValue, request.babyAgeUnit),
    date: formatDate(request.nightDate),
  };
}

function logFailures(what: string, results: PromiseSettledResult<unknown>[], ids: string[]): number {
  let failed = 0;
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      failed += 1;
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`[demandes] ${what} not sent`, { profileId: ids[i], reason });
    }
  });
  return failed;
}

/** One e-mail per validated professional serving the urgent request's commune. */
export async function notifyUrgentRequest(requestId: string, siteUrl: string): Promise<void> {
  try {
    const request = await requestForNotice(requestId);
    if (!request || !request.urgent || request.status !== "ouverte") return;

    const recipients = dedupe(await professionalsServing([request.communeIns]));
    const url = `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`;
    const results = await Promise.allSettled(
      recipients.map((r) =>
        sendEmail(
          r.email,
          urgentRequestEmail({ siteUrl, prenom: r.firstName, url, request: summary(request) }),
          `demande-${request.id}-${r.profileId}`,
        ),
      ),
    );
    logFailures("urgent e-mail", results, recipients.map((r) => r.profileId));
  } catch (error) {
    console.error("[demandes] urgent e-mails failed", {
      requestId,
      error: error instanceof Error ? error.name : typeof error,
    });
  }
}

function dedupe(recipients: Recipient[]): Recipient[] {
  return [...new Map(recipients.map((r) => [r.profileId, r])).values()];
}

export type DigestOutcome =
  | { skipped: "avant-18h" | "deja-envoye" }
  | { requests: number; professionals: number; failed: number };

/**
 * The daily digest. Before 18:00 in Brussels it does nothing, and once a
 * digest has carried requests today it does nothing more, so it can be called
 * at 16:00 and 17:00 UTC (18:00 and 19:00 in summer, 17:00 and 18:00 in
 * winter) and a professional gets one digest a day at most. A request
 * published after today's digest waits for tomorrow's; when the first call of
 * the evening found nothing to send, a later call that evening still sends.
 * It claims every normal request no digest has carried (a request is in one
 * digest at most, even when no professional serves its commune), then sends
 * each validated professional one e-mail with her requests. A professional
 * with none gets nothing.
 */
export async function sendRequestDigest(now: Date, siteUrl: string): Promise<DigestOutcome> {
  if (!isDigestTime(now)) return { skipped: "avant-18h" };
  const day = brusselsNow(now).date;
  if (await digestSentOn(day)) return { skipped: "deja-envoye" };

  const claimed = await claimDigestRequests(now);
  if (claimed.length === 0) return { requests: 0, professionals: 0, failed: 0 };

  const recipients = await professionalsServing([...new Set(claimed.map((r) => r.communeIns))]);

  const byProfessional = new Map<string, { recipient: Recipient; communes: Set<string> }>();
  for (const r of recipients) {
    const entry = byProfessional.get(r.profileId) ?? { recipient: r, communes: new Set<string>() };
    entry.communes.add(r.communeIns);
    byProfessional.set(r.profileId, entry);
  }

  const url = `${siteUrl}${PROFESSIONAL_REQUESTS_PATH}`;
  const sends = [...byProfessional.values()].map(({ recipient, communes }) => {
    const hers = claimed
      .filter((r) => communes.has(r.communeIns))
      .sort((a, b) => `${a.nightDate}T${a.startTime}`.localeCompare(`${b.nightDate}T${b.startTime}`));
    // Per professional, per day and per set of requests: a retry of the same
    // digest sends it once.
    const batch = createHash("sha256")
      .update(hers.map((r) => r.id).sort().join(","))
      .digest("hex")
      .slice(0, 16);
    return {
      profileId: recipient.profileId,
      send: sendEmail(
        recipient.email,
        requestDigestEmail({
          siteUrl,
          prenom: recipient.firstName,
          url,
          requests: hers.map(summary),
        }),
        `digest-${recipient.profileId}-${day}-${batch}`,
      ),
    };
  });

  const results = await Promise.allSettled(sends.map((s) => s.send));
  const failed = logFailures("digest", results, sends.map((s) => s.profileId));
  return { requests: claimed.length, professionals: sends.length, failed };
}
