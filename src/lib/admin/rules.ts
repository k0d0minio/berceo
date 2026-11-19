/**
 * The founders' review, as pure rules the tests hold to the spec
 * (verification-back-office): which files the queue lists and how it labels
 * them, which decision a file allows, what a reason must be, when a student
 * file is held by the switch (D-7, D-52), and when a refused file's documents
 * are purged (D-41, D-55). No database, no network: the actions call these.
 *
 * Errors and labels are catalogue keys (`admin`), never sentences.
 */
import type {
  AdminAction,
  CancellationAuthor,
  CancellationKind,
  CreditOrigin,
  PaymentStatus,
  Profession,
  ProfileStatus,
} from "@/db/schema";
import { isStudent } from "@/lib/professionnelle/rules";

// ---------------------------------------------------------------------------
// The queue
// ---------------------------------------------------------------------------

/** The states a founder can decide on; the queue lists these and nothing else. */
export const REVIEWABLE = ["en_attente", "complement_demande"] as const satisfies readonly ProfileStatus[];

export function isReviewable(status: ProfileStatus): boolean {
  return (REVIEWABLE as readonly ProfileStatus[]).includes(status);
}

/** What the queue needs to know about a file. */
export type ReviewFile = {
  status: ProfileStatus;
  profession: Profession | null;
  /** The reason of the last complément or refusal, null once validated. */
  reviewReason: string | null;
};

/**
 * A student file waiting while the founders do not admit students (D-7): it
 * stays `en_attente`, no state is added (D-52), and it cannot be validated.
 */
export function isHeldStudent(file: Pick<ReviewFile, "status" | "profession">, studentsAdmitted: boolean): boolean {
  return file.status === "en_attente" && isStudent(file.profession) && !studentsAdmitted;
}

/** The queue's Statut column (`admin.file.statuts`). */
export type QueueStatus = "enAttente" | "complementDemande" | "complementRecu" | "etudiantes";

export function queueStatus(file: ReviewFile, studentsAdmitted: boolean): QueueStatus {
  if (file.status === "complement_demande") return "complementDemande";
  if (isHeldStudent(file, studentsAdmitted)) return "etudiantes";
  // Waiting again with a reason on file: she answered a complément (D-50).
  return file.reviewReason ? "complementRecu" : "enAttente";
}

/** Oldest first by the date she sent her file (a file sent back keeps its place). */
export function byOldestSubmission<T extends { submittedAt: Date | null }>(a: T, b: T): number {
  const at = (f: T) => f.submittedAt?.getTime() ?? Number.POSITIVE_INFINITY;
  return at(a) - at(b);
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export const DECISIONS = ["valider", "complement", "refuser"] as const;
export type Decision = (typeof DECISIONS)[number];

export function isDecision(value: unknown): value is Decision {
  return typeof value === "string" && (DECISIONS as readonly string[]).includes(value);
}

/** The state each decision moves a file to. */
export const DECISION_STATUS = {
  valider: "valide",
  complement: "complement_demande",
  refuser: "refuse",
} as const satisfies Record<Decision, ProfileStatus>;

/** The journal's action for each decision. */
export const DECISION_ACTION = {
  valider: "profil_valide",
  complement: "complement_demande",
  refuser: "profil_refuse",
} as const satisfies Record<Decision, AdminAction>;

/** Whether a decision needs a reason she will read. */
export function needsReason(decision: Decision): boolean {
  return decision !== "valider";
}

export type DecisionRefusal = "traite" | "etudiantes";

/**
 * Whether a decision may be taken on a file in this state: only a waiting
 * file (`traite` otherwise: another founder acted first, or the page is
 * stale), and never a validation of a student file while the switch is off.
 */
export function refuseDecision(
  decision: Decision,
  file: Pick<ReviewFile, "status" | "profession">,
  studentsAdmitted: boolean,
): DecisionRefusal | null {
  if (!isReviewable(file.status)) return "traite";
  if (decision === "valider" && isStudent(file.profession) && !studentsAdmitted) return "etudiantes";
  return null;
}

export const REASON_MAX = 1000;

export type ReasonError = "motifRequis" | "motifLong";

/**
 * The founders' note on a credit they grant or on a garde they cancel for
 * Berceo (annulations-back-office): required, 500 characters at most, read by
 * the founders only.
 */
export const NOTE_MAX = 500;

/** A reason is plain text, trimmed, 1 to `max` characters (1,000 unless said). */
export function checkReason(
  raw: unknown,
  max: number = REASON_MAX,
): { ok: true; value: string } | { ok: false; error: ReasonError } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length === 0) return { ok: false, error: "motifRequis" };
  if (value.length > max) return { ok: false, error: "motifLong" };
  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// The purge of a refused file
// ---------------------------------------------------------------------------

export const PURGE_AFTER_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Refusals taken before this moment are due for the purge. */
export function purgeCutoff(now: Date): Date {
  return new Date(now.getTime() - PURGE_AFTER_DAYS * DAY_MS);
}

/** A refused file's documents go thirty days after the refusal, not a moment before. */
export function isPurgeDue(
  file: { status: ProfileStatus; reviewedAt: Date | null },
  now: Date,
): boolean {
  return (
    file.status === "refuse" &&
    file.reviewedAt !== null &&
    file.reviewedAt.getTime() < purgeCutoff(now).getTime()
  );
}

// ---------------------------------------------------------------------------
// The journal
// ---------------------------------------------------------------------------

export const JOURNAL_PAGE_SIZE = 50;

/** A `?page=` value as a page number from 1, anything else as 1. */
export function journalPage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 100_000 ? n : 1;
}

// ---------------------------------------------------------------------------
// The back-office's lists (back-office-admin)
// ---------------------------------------------------------------------------

/** Every list of the back-office pages by 50, like the journal. */
export const LIST_PAGE_SIZE = JOURNAL_PAGE_SIZE;

/** « Paiements récents »: the fees paid in the last 7 days, by payment instant (D-133). */
export const RECENT_PAYMENT_DAYS = 7;

/** The `?periode=` value the overview links to, and the only one the payments page reads. */
export const RECENT_PERIOD = "7j";

/** Payments made at or after this moment count as recent. */
export function recentPaymentCutoff(now: Date): Date {
  return new Date(now.getTime() - RECENT_PAYMENT_DAYS * DAY_MS);
}

/**
 * The bookings list's filters (D-133): `en-cours` is the overview's
 * « Réservations en cours », every confirmed garde whose night has not ended
 * (à venir and en cours); each other value is one state by the clock.
 */
export const BOOKING_FILTERS = ["en-cours", "a-venir", "commencee", "terminee", "annulee"] as const;
export type BookingFilter = (typeof BOOKING_FILTERS)[number];

export function bookingFilter(raw: string | undefined): BookingFilter | null {
  return (BOOKING_FILTERS as readonly string[]).includes(raw ?? "") ? (raw as BookingFilter) : null;
}

/** The requests list's filters: the state each space shows (`displayStatus`). */
export const REQUEST_FILTERS = ["ouverte", "passee", "attribuee", "annulee"] as const;
export type RequestFilter = (typeof REQUEST_FILTERS)[number];

export function requestFilter(raw: string | undefined): RequestFilter | null {
  return (REQUEST_FILTERS as readonly string[]).includes(raw ?? "") ? (raw as RequestFilter) : null;
}

/**
 * « Signalements »: « À traiter » by default, all of them (D-139), or every
 * garde in litige, handled or not (annulations-back-office).
 */
export const REPORT_FILTERS = ["a-traiter", "litige", "tous"] as const;
export type ReportFilter = (typeof REPORT_FILTERS)[number];

export function reportFilter(raw: string | undefined): ReportFilter {
  return raw === "tous" || raw === "litige" ? raw : "a-traiter";
}

/** What a report row knows of its fee and its credit (annulations-back-office). */
export type ReportFacts = {
  side: CancellationAuthor;
  kind: CancellationKind;
  disputed: boolean;
  /** The fee's status, or null for a garde booked before the fee existed. */
  fee: PaymentStatus | null;
  /** The origin of the garde's live credit, or null when it has none. */
  creditOrigin: CreditOrigin | null;
};

/** Where the delay stood for a cancellation: « dans le délai » (a credit) or « hors délai » (the fee kept). */
export type DelayVerdict = "dansLeDelai" | "horsDelai";

/**
 * The line of the founders' table a cancellation fell on (annulations-back-office,
 * Q1), read from what was written then and not from today's setting: only the
 * family's cancellation has a delay. Her credit of origin `annulation_famille`
 * means she cancelled before it; a fee left at Berceo (or one the founders
 * later turned into a credit by hand) means she cancelled within it. Null when
 * the delay did not apply or nothing says which side of it she was.
 */
export function delayVerdict(facts: ReportFacts): DelayVerdict | null {
  if (facts.kind !== "annulation" || facts.side !== "famille") return null;
  if (facts.creditOrigin === "annulation_famille") return "dansLeDelai";
  if (facts.creditOrigin === "geste_berceo") return "horsDelai";
  return facts.fee === "payee" || facts.fee === "remboursement_echoue" ? "horsDelai" : null;
}

/** What became of the fee, as the founders read it on « Signalements ». */
export type ReportOutcome = "litige" | "credit" | "geste" | "conserves" | "rembourses" | "aRembourser" | "aucun";

/**
 * The fee's outcome on a report (annulations-back-office): a litige until the
 * founders grant a credit; a credit of the table, or one they granted by hand;
 * a refund; a fee kept at Berceo; a professional's cancellation made before
 * the table, still to refund (D-162); or nothing, with no paid fee.
 */
export function reportOutcome(facts: ReportFacts): ReportOutcome {
  if (facts.disputed && !facts.creditOrigin) return "litige";
  if (facts.creditOrigin) return facts.creditOrigin === "geste_berceo" ? "geste" : "credit";
  if (facts.fee === "remboursee") return "rembourses";
  if (facts.fee !== "payee" && facts.fee !== "remboursement_echoue") return "aucun";
  if (facts.side === "professionnelle" && facts.kind === "annulation") return "aRembourser";
  return "conserves";
}

/**
 * Whether a founder may grant a credit of the fee (annulations-back-office):
 * on a garde in litige, or whose fee the family's own cancellation or absence
 * left at Berceo, while the fee is paid and the garde has no live credit.
 * `grantCreditStatement` holds the same rule in its SQL.
 */
export function canGrantCredit(facts: ReportFacts): boolean {
  if (facts.fee !== "payee" || facts.creditOrigin) return false;
  return facts.disputed || facts.side === "famille";
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A `?compte=` or `?famille=` value: an account id, anything else ignored. */
export function accountParam(raw: string | undefined): string | null {
  return raw && UUID.test(raw) ? raw.toLowerCase() : null;
}

// ---------------------------------------------------------------------------
// The account search
// ---------------------------------------------------------------------------

export const SEARCH_MAX = 100;

/**
 * The letters folded for the search, and what each folds to: the SQL side
 * folds with `translate(lower(…), FOLD_FROM, FOLD_TO)`, this module with the
 * same table, so « Zoé », « zoe » and « ZOË » find one another.
 */
export const FOLD_FROM = "àâäáãåçéèêëíìîïñóòôöõúùûüýÿ";
export const FOLD_TO = "aaaaaaceeeeiiiinooooouuuuyy";

/** Lower case, the letters above folded, spaces collapsed. */
export function foldText(value: string): string {
  let out = "";
  for (const char of value.toLowerCase()) {
    const at = FOLD_FROM.indexOf(char);
    out += at >= 0 ? FOLD_TO[at] : char;
  }
  return out.replace(/\s+/g, " ").trim();
}

export type SearchTerms = {
  /** The folded text, matched inside first name, last name, « prénom nom » and e-mail. */
  text: string;
  /**
   * The digits to find inside a phone number's digits, or null when the query
   * holds fewer than four. A leading 00 or 0 is dropped, so 0470 12 34 56,
   * +32470123456 and 470123456 all find +32470123456.
   */
  digits: string | null;
};

/** What a search box value searches for, or null when there is nothing to search. */
export function searchTerms(raw: string | undefined): SearchTerms | null {
  const value = (raw ?? "").slice(0, SEARCH_MAX);
  const text = foldText(value);
  if (text === "") return null;
  const typed = value.replace(/\D/g, "");
  if (typed.length < 4) return { text, digits: null };
  const digits = typed.startsWith("00") ? typed.slice(2) : typed.startsWith("0") ? typed.slice(1) : typed;
  return { text, digits };
}

// ---------------------------------------------------------------------------
// Suspending, reactivating, deleting, contacting (D-134 to D-138)
// ---------------------------------------------------------------------------

export type AccountFacts = {
  role: "parent" | "professionnel" | "admin";
  suspendedAt: Date | null;
  deletedAt: Date | null;
};

export type AccountRefusal = "admin" | "supprime" | "dejaSuspendu" | "nonSuspendu" | "gardesAVenir";

/** An admin account is never acted on from the back-office, a deleted one no more. */
function untouchable(account: AccountFacts): AccountRefusal | null {
  if (account.role === "admin") return "admin";
  if (account.deletedAt) return "supprime";
  return null;
}

export function suspendRefusal(account: AccountFacts): AccountRefusal | null {
  return untouchable(account) ?? (account.suspendedAt ? "dejaSuspendu" : null);
}

export function reactivateRefusal(account: AccountFacts): AccountRefusal | null {
  return untouchable(account) ?? (account.suspendedAt ? null : "nonSuspendu");
}

/** Only a suspended account with no garde still to come or under way is deleted (D-136). */
export function deleteRefusal(account: AccountFacts, upcomingGardes: number): AccountRefusal | null {
  const refusal = untouchable(account);
  if (refusal) return refusal;
  if (!account.suspendedAt) return "nonSuspendu";
  if (upcomingGardes > 0) return "gardesAVenir";
  return null;
}

/** An active or suspended account can be written to; not an admin, not a deleted one (D-138). */
export function contactRefusal(account: AccountFacts): AccountRefusal | null {
  return untouchable(account);
}

/** The deletion is confirmed by typing her last name, case and accents aside. */
export function confirmsLastName(typed: unknown, lastName: string): boolean {
  return typeof typed === "string" && foldText(typed) !== "" && foldText(typed) === foldText(lastName);
}

/** What a deleted account is called everywhere it still appears (D-137). */
export const ANONYMISED = { firstName: "Compte", lastName: "supprimé" } as const;

/** A unique address nobody can receive mail at: `.invalid` is reserved (RFC 2606). */
export function anonymisedEmail(userId: string): string {
  return `supprime-${userId.toLowerCase()}@invalid`;
}

export const CONTACT_SUBJECT_MAX = 150;
export const CONTACT_MESSAGE_MAX = 5000;

export type ContactError = "objetRequis" | "objetLong" | "messageRequis" | "messageLong";

export type ContactValues = { subject: string; message: string };

/** A subject of 1 to 150 characters on one line, a message of 1 to 5,000; both trimmed. */
export function checkContact(
  raw: { subject?: unknown; message?: unknown },
): { ok: true; value: ContactValues } | { ok: false; errors: Partial<Record<"subject" | "message", ContactError>> } {
  const subject = typeof raw.subject === "string" ? raw.subject.replace(/\s+/g, " ").trim() : "";
  const message = typeof raw.message === "string" ? raw.message.replace(/\r\n?/g, "\n").trim() : "";
  const errors: Partial<Record<"subject" | "message", ContactError>> = {};
  if (subject === "") errors.subject = "objetRequis";
  else if (subject.length > CONTACT_SUBJECT_MAX) errors.subject = "objetLong";
  if (message === "") errors.message = "messageRequis";
  else if (message.length > CONTACT_MESSAGE_MAX) errors.message = "messageLong";
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { subject, message } };
}

/** The message's paragraphs, split on blank lines; a single line break stays inside its paragraph. */
export function contactParagraphs(message: string): string[] {
  return message
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");
}
