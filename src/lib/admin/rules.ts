/**
 * The founders' review, as pure rules the tests hold to the spec
 * (verification-back-office): which files the queue lists and how it labels
 * them, which decision a file allows, what a reason must be, when a student
 * file is held by the switch (D-7, D-52), and when a refused file's documents
 * are purged (D-41, D-55). No database, no network: the actions call these.
 *
 * Errors and labels are catalogue keys (`admin`), never sentences.
 */
import type { AdminAction, Profession, ProfileStatus } from "@/db/schema";
import { STUDENT } from "@/lib/professionnelle/rules";

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
  return file.status === "en_attente" && file.profession === STUDENT && !studentsAdmitted;
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
  if (decision === "valider" && file.profession === STUDENT && !studentsAdmitted) return "etudiantes";
  return null;
}

export const REASON_MAX = 1000;

export type ReasonError = "motifRequis" | "motifLong";

/** A reason is plain text, trimmed, 1 to 1,000 characters. */
export function checkReason(raw: unknown): { ok: true; value: string } | { ok: false; error: ReasonError } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length === 0) return { ok: false, error: "motifRequis" };
  if (value.length > REASON_MAX) return { ok: false, error: "motifLong" };
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
