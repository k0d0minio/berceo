import { hasNightStarted, isChangeable, type RequestStatus } from "@/lib/demandes/rules";

/**
 * The rules of an answer and a booking that do not need the database: who may
 * answer a request and see it, who may withdraw, when a family may accept,
 * republish or send a request in priority, and what each of those does to the
 * answers. Pure, so the pages, the server actions and the tests read the same
 * rules; the writes in ./answers.ts and ./bookings.ts hold them again in SQL,
 * where two people racing can meet.
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

/**
 * Whether a request is on her list: open, ahead, in her zone or sent to her in
 * priority, not one she was declined on, and not on a night she is booked.
 */
export function isOnHerList(facts: Omit<AnswerFacts, "profile"> & { profileId: string }, now: Date): boolean {
  const { request } = facts;
  if (request.status !== "ouverte") return false;
  if (hasNightStarted(request.nightDate, request.startTime, now)) return false;
  if (!facts.servesCommune && !isPriorityFor(request, facts.profileId)) return false;
  if (facts.answer === "non_retenue") return false;
  return !facts.bookedThatNight;
}

/** She may withdraw an answer that still waits, while the request is open and ahead (D-73). */
export function canWithdraw(answer: ApplicationStatus | null, request: RequestFacts, now: Date): boolean {
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

export type AnswerRow = { id: string; status: ApplicationStatus };

export type AcceptTransition = {
  /** The answer booked. */
  retenue: string;
  /** The others that waited on this request: told « non retenue ». */
  nonRetenues: string[];
  /** Her own answers elsewhere that same night: withdrawn silently (D-73). */
  retirees: string[];
};

/**
 * What accepting `chosenId` does to the answers: the chosen one is `retenue`,
 * every other waiting answer on the request `non_retenue`, and the chosen
 * professional's waiting answers on other requests for that night `retiree`.
 * Answers already withdrawn or declined stay as they are.
 */
export function acceptTransition(
  chosenId: string,
  onRequest: readonly AnswerRow[],
  hersThatNight: readonly AnswerRow[],
): AcceptTransition {
  const waiting = (a: AnswerRow) => a.status === "en_attente";
  return {
    retenue: chosenId,
    nonRetenues: onRequest.filter((a) => a.id !== chosenId && waiting(a)).map((a) => a.id),
    retirees: hersThatNight.filter((a) => a.id !== chosenId && waiting(a)).map((a) => a.id),
  };
}

/**
 * « Republier ma demande »: offered on an open request, night ahead, with at
 * least one waiting answer, since republishing means none of them suits (D-70).
 */
export function canRepublish(request: RequestFacts, pendingAnswers: number, now: Date): boolean {
  return isChangeable(request, now) && pendingAnswers > 0;
}

/**
 * The answers declined when the family republishes or cancels: every one
 * still waiting becomes `non_retenue`, and its professional is told (D-70,
 * D-76). A withdrawn answer gets nothing.
 */
export function declinedOnClose(answers: readonly AnswerRow[]): string[] {
  return answers.filter((a) => a.status === "en_attente").map((a) => a.id);
}

/**
 * Whether a request can still be sent in priority: open, ahead, and never sent
 * to anyone before. A priority professional is set once (D-71).
 */
export function canSendInPriority(
  request: RequestFacts & { prioritySentAt: Date | null },
  now: Date,
): boolean {
  return isChangeable(request, now) && request.priorityProfileId === null && request.prioritySentAt === null;
}
