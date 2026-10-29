import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { familyBookingPath } from "@/lib/reservations/paths";

import type { ConfirmResult } from "./payments";

/**
 * Where a settled fee sends the family (D-102): the return page from Stripe,
 * and « Accepter et réserver » when her credit paid the whole fee
 * (credits-au-paiement). `sessionId` is the Checkout to settle again with
 * « Actualiser la page »; a fee with no Checkout has none, and the request's
 * page reads it again.
 */
export function paymentDestination(result: ConfirmResult, sessionId: string | null): string {
  const request = (requestId: string | null, notice: string) =>
    requestId ? `${familyRequestPath(requestId)}?paiement=${notice}` : FAMILY_REQUESTS_PATH;
  switch (result.kind) {
    case "reservee":
      return `${familyBookingPath(result.bookingId)}?confirmee=1`;
    case "enCours":
      if (!result.requestId) return FAMILY_REQUESTS_PATH;
      return sessionId
        ? `${request(result.requestId, "enCours")}&session=${encodeURIComponent(sessionId)}`
        : request(result.requestId, "enCours");
    case "remboursee":
      return request(result.requestId, "rembourse");
    case "remboursementEnAttente":
      return request(result.requestId, "remboursementEnAttente");
    case "nonPayee":
      return request(result.requestId, "abandonne");
    case "inconnue":
      return FAMILY_REQUESTS_PATH;
  }
}
