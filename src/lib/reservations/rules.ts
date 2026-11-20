import {
  endTime,
  hasNightStarted,
  isChangeable,
  isStartTime,
  toHourMinute,
  type RequestStatus,
} from "@/lib/demandes/rules";

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
  | "dejaRepondu"
  | "horaire";

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
  /** The start she proposes for this night in place of the family's (JAM-306); absent or null for none. */
  proposedStartTime?: string | null;
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
  // A start she proposes before the family's (JAM-306) must be ahead too.
  if (facts.proposedStartTime && hasNightStarted(request.nightDate, facts.proposedStartTime, now)) return "commencee";
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
export type AcceptRefusal = "adresse" | "nonModifiable" | "indisponible" | "horaires";

export type AcceptFacts = {
  request: RequestFacts;
  /** The answer chosen, and whether its professional is still validated. */
  answer: { status: ApplicationStatus; profileStatus: string; proposedStartTime?: string | null };
  /** Whether the family's profile holds a street and a house number (D-77). */
  hasAddress: boolean;
};

export function acceptRefusal(facts: AcceptFacts, now: Date): AcceptRefusal | null {
  if (!isChangeable(facts.request, now)) return "nonModifiable";
  // An answer that proposes an earlier start (JAM-306) is booked only before that start.
  const proposed = facts.answer.proposedStartTime;
  if (proposed && hasNightStarted(facts.request.nightDate, proposed, now)) return "nonModifiable";
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

/** A night's rate and an extra hour's, in euros. */
export type Rates = { nightRateEur: number | null; extraHourRateEur: number | null };

/**
 * The rates a professional reads on a family's request, and where they come
 * from: `reponse` is the rate saved on her waiting answer, the one the family
 * reads; `profil` is her profile's current rate, which an answer would carry.
 */
export type ShownRates = Rates & { source: "reponse" | "profil" };

/**
 * The rates she reads on a request of one night (JAM-344). While her answer
 * waits, the rates saved on it: the family compares those, so the two sides
 * read one amount when she changed her profile's rate after she answered. An
 * answer saved with no extra hour's rate shows none. Before an answer, after a
 * withdrawal, or when the saved rates are not read, her profile's current
 * rates: a new answer carries those (D-74).
 */
export function shownRates(
  profile: Rates,
  answer: ApplicationStatus | null,
  saved: Rates | undefined,
): ShownRates {
  if (answer === "en_attente" && saved && saved.nightRateEur !== null) {
    return { source: "reponse", nightRateEur: saved.nightRateEur, extraHourRateEur: saved.extraHourRateEur };
  }
  return { source: "profil", nightRateEur: profile.nightRateEur, extraHourRateEur: profile.extraHourRateEur };
}

/**
 * The rates she reads on a regular request answered as one (JAM-302, JAM-344).
 * Her answer is one row for each night, written all or none at one rate. Once
 * every night her list holds carries her waiting answer, the rates saved on
 * the earliest night: the family's page reads the same row
 * (`familySeriesAnswers`). Otherwise her profile's current rates. `saved` is
 * her saved rates by request id.
 */
export function seriesShownRates(
  profile: Rates,
  nights: readonly { id: string; nightDate: string; answer: ApplicationStatus | null }[],
  saved: ReadonlyMap<string, Rates>,
): ShownRates {
  const current = shownRates(profile, null, undefined);
  if (seriesAnswerState(nights, nights.length) !== "repondu") return current;
  const [first] = [...nights].sort((a, b) => a.nightDate.localeCompare(b.nightDate));
  return shownRates(profile, first.answer, saved.get(first.id));
}

/** What she can do on a regular request answered as one (JAM-302). */
export type SeriesAnswerState = "repondre" | "repondu" | "aucun";

/**
 * Her answer on a regular request (JAM-302): she answers all its open nights
 * ahead or none. `nights` are the nights her list holds, `openNights` the
 * request's open nights ahead. She may answer when her list holds them all and
 * she never answered any, or withdrew. Once each night holds her waiting
 * answer, she has answered. Otherwise nothing is offered: a night she is
 * booked, or was declined on, is not on her list (Q5).
 */
export function seriesAnswerState(
  nights: readonly { answer: ApplicationStatus | null }[],
  openNights: number,
): SeriesAnswerState {
  if (nights.length === 0) return "aucun";
  if (nights.every((night) => night.answer === "en_attente")) return "repondu";
  const complete = nights.length === openNights;
  if (complete && nights.every((night) => night.answer === null || night.answer === "retiree")) return "repondre";
  return "aucun";
}

// ---------------------------------------------------------------------------
// The adapted schedule (JAM-306)
// ---------------------------------------------------------------------------

/*
 * A professional can answer a night with a start that differs from the
 * family's. The proposal lives on her answer (`proposed_start_time`). The
 * length of the night does not change, so the end moves with the start. The
 * family books the answer with its proposal or does not book it. The booking
 * writes the proposed start in the request's `start_time` and keeps the
 * family's in `requested_start_time` (`acceptAnswer`), so each reader of a
 * booked night reads the start the two sides agreed on. The functions below
 * are the only place that says which start is which.
 */

/** The name of the form field that carries her proposal for one night. */
export function proposalField(requestId: string): string {
  return `heure-${requestId}`;
}

export type ProposalRead = { ok: true; proposed: string | null } | { ok: false };

/**
 * Her proposal for a night, read from a form value: a half hour from 18:00 to
 * 23:00 that differs from the family's start. Empty, absent, or the family's
 * own start means no proposal. Any other value is refused.
 */
export function readProposal(familyStart: string, value: string | null | undefined): ProposalRead {
  const typed = (value ?? "").trim();
  if (typed === "") return { ok: true, proposed: null };
  const proposed = toHourMinute(typed);
  if (!/^\d{2}:\d{2}(:00)?$/.test(typed) || !isStartTime(proposed)) return { ok: false };
  if (proposed === toHourMinute(familyStart)) return { ok: true, proposed: null };
  return { ok: true, proposed };
}

/**
 * The start of a night under an answer: her proposed start, or the family's
 * when she proposed none. This is the start a booking of that answer gives the
 * night.
 */
export function effectiveStart(familyStart: string, proposedStart: string | null | undefined): string {
  return toHourMinute(proposedStart || familyStart);
}

/**
 * The start the family asked for. On a booked request whose answer proposed a
 * different start, `startTime` is the agreed start and `requestedStartTime`
 * the record. On any other request, `startTime` is the family's.
 */
export function requestedStart(request: { startTime: string; requestedStartTime?: string | null }): string {
  return toHourMinute(request.requestedStartTime || request.startTime);
}

/** Whether a booked night runs at a start that differs from the one the family asked for. */
export function isAdapted(request: { startTime: string; requestedStartTime?: string | null }): boolean {
  return Boolean(request.requestedStartTime) && requestedStart(request) !== toHourMinute(request.startTime);
}

/** One night whose answer proposes a different start. */
export type AdaptedNight = {
  requestId: string;
  nightDate: string;
  /** The family's start, `HH:MM`. */
  requested: string;
  /** Her proposed start, `HH:MM`. */
  proposed: string;
  /** The end of the night from the proposed start: the length does not change. */
  end: string;
};

/** A night as an answer reads it: the request's night and her proposal for it. */
export type AnsweredNight = {
  requestId: string;
  nightDate: string;
  startTime: string;
  extraHours: number;
  proposedStartTime: string | null;
};

/** The nights of an answer that carry a proposal, in night order. None for an answer at the family's times. */
export function adaptedNights(nights: readonly AnsweredNight[]): AdaptedNight[] {
  return nights
    .filter((night) => night.proposedStartTime && toHourMinute(night.proposedStartTime) !== toHourMinute(night.startTime))
    .map((night) => {
      const proposed = toHourMinute(night.proposedStartTime!);
      return {
        requestId: night.requestId,
        nightDate: night.nightDate,
        requested: toHourMinute(night.startTime),
        proposed,
        end: endTime(proposed, night.extraHours),
      };
    })
    .sort((a, b) => a.nightDate.localeCompare(b.nightDate));
}

/**
 * What the family confirms when it books an answer: each night's proposed
 * start, as one string. The page binds it to « Accepter et réserver », and the
 * checkout opens only when it is still what the answer holds, so a proposal
 * the family did not read is never booked. Empty for an answer with no
 * proposal.
 */
export function proposalsSignature(
  nights: readonly { requestId: string; proposedStartTime: string | null }[],
): string {
  return nights
    .filter((night) => night.proposedStartTime)
    .map((night) => `${night.requestId}=${toHourMinute(night.proposedStartTime!)}`)
    .sort()
    .join(",");
}
