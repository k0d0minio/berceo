import { hasNightStarted, isChangeable, type RequestStatus } from "@/lib/demandes/rules";

/**
 * The rules of an answer and a booking that do not need the database: who may
 * answer a request, who may withdraw, and when a family may accept or
 * republish. Pure, so the pages, the server actions and the tests read the same
 * rules; the writes in ./answers.ts and ./bookings.ts hold them again in SQL,
 * where two people racing can meet.
 *
 * The rules only the SQL decides live there alone, each held by a statement
 * test: her list and the priority candidates (`src/lib/demandes/requests.ts`),
 * the answers declined when a request is cancelled, republished or booked, and
 * hers withdrawn that night (`./answers.ts`, `./bookings.ts`).
 */

export type ApplicationStatus = "en_attente" | "retenue" | "non_retenue" | "retiree";

/** The request fields these rules read. */
export type RequestFacts = {
  status: RequestStatus;
  nightDate: string;
  startTime: string;
  priorityProfileId: string | null;
};

/** Why an answer is refused, as a catalogue key. */
export type AnswerRefusal =
  | "nonValide"
  | "fermee"
  | "commencee"
  | "horsZone"
  | "declinee"
  | "dejaReservee"
  | "dejaRepondu";

export type AnswerFacts = {
  /** Her profile: only a validated one with a rate answers (D-5, D-4). */
  profile: { id: string; status: string; nightRateEur: number | null };
  request: RequestFacts;
  /** Whether the request's commune is one she serves. */
  servesCommune: boolean;
  /** Her answer on this request, if she ever gave one. */
  answer: ApplicationStatus | null;
  /** Whether she holds a booking on the request's night already (D-73). */
  bookedThatNight: boolean;
};

/** Whether the request was sent to this professional « en priorité » (D-71). */
export function isPriorityFor(request: Pick<RequestFacts, "priorityProfileId">, profileId: string): boolean {
  return request.priorityProfileId === profileId;
}

/**
 * Why « Je suis disponible pour cette garde » is refused, or null when she may
 * answer: a validated profile, an open request whose night has not started, in
 * a commune she serves or sent to her in priority, never after she was
 * declined on it, never on a night she is booked, and not twice.
 */
export function answerRefusal(facts: AnswerFacts, now: Date): AnswerRefusal | null {
  const { profile, request, answer } = facts;
  if (profile.status !== "valide" || profile.nightRateEur === null) return "nonValide";
  if (request.status !== "ouverte") return "fermee";
  if (hasNightStarted(request.nightDate, request.startTime, now)) return "commencee";
  if (!facts.servesCommune && !isPriorityFor(request, profile.id)) return "horsZone";
  if (answer === "non_retenue") return "declinee";
  if (facts.bookedThatNight) return "dejaReservee";
  if (answer === "en_attente" || answer === "retenue") return "dejaRepondu";
  return null;
}

/** She may withdraw an answer that still waits, while the request is open and ahead (D-73). */
export function canWithdraw(
  answer: ApplicationStatus | null,
  request: Pick<RequestFacts, "status" | "nightDate" | "startTime">,
  now: Date,
): boolean {
  return answer === "en_attente" && isChangeable(request, now);
}

/** Why « Accepter et réserver » is refused, or null. */
export type AcceptRefusal = "adresse" | "nonModifiable" | "indisponible";

export type AcceptFacts = {
  request: RequestFacts;
  /** The answer chosen, and whether its professional is still validated. */
  answer: { status: ApplicationStatus; profileStatus: string };
  /** Whether the family's profile holds a street and a house number (D-77). */
  hasAddress: boolean;
};

export function acceptRefusal(facts: AcceptFacts, now: Date): AcceptRefusal | null {
  if (!isChangeable(facts.request, now)) return "nonModifiable";
  if (facts.answer.status !== "en_attente" || facts.answer.profileStatus !== "valide") return "indisponible";
  if (!facts.hasAddress) return "adresse";
  return null;
}

/** An address the professional can find: a street and a house number, the box optional. */
export function hasAddress(address: { street: string | null; houseNumber: string | null } | null): boolean {
  return Boolean(address?.street?.trim() && address.houseNumber?.trim());
}

/**
 * « Republier ma demande »: offered on an open request, night ahead, with at
 * least one waiting answer, since republishing means none of them suits (D-70).
 */
export function canRepublish(request: RequestFacts, pendingAnswers: number, now: Date): boolean {
  return isChangeable(request, now) && pendingAnswers > 0;
}
