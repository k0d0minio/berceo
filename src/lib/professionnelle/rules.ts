/**
 * The professional's file, as pure rules the tests hold to the spec
 * (onboarding-professionnelle): what each profession must provide, what makes a
 * step complete, which step comes next, which state a change leads to, and
 * which files are accepted. No database, no network: the actions call these.
 *
 * Errors are catalogue keys (`professionnelle.erreurs`), never sentences, so
 * the words stay in `src/content/`.
 */
import type {
  Declaration,
  DocumentKind,
  Experience,
  Profession,
  ProfileStatus,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// The lists
// ---------------------------------------------------------------------------

export const PROFESSIONS = [
  "sage_femme",
  "infirmiere_neonatologie",
  "puericultrice",
  "etudiante_sage_femme",
] as const satisfies readonly Profession[];

/** The profession the founders' switch gates (D-7). */
export const STUDENT: Profession = "etudiante_sage_femme";

export const EXPERIENCES = [
  "moins_d_un_an",
  "un_a_trois_ans",
  "trois_a_cinq_ans",
  "plus_de_cinq_ans",
] as const satisfies readonly Experience[];

/** The draft list the founders and Surya correct (`@relecture` in the catalogue). */
export const SPECIALISATIONS = [
  "allaitement",
  "prematurite",
  "jumeaux",
  "reanimation_neonatale",
  "sommeil_nourrisson",
  "soutien_post_partum",
] as const;

export type Specialisation = (typeof SPECIALISATIONS)[number];

/** The five step-4 declarations, in the order they are shown. */
export const DECLARATIONS = [
  "documents_authentiques",
  "autorisee_a_exercer",
  "fausse_declaration",
  "verifications",
  "casier_judiciaire",
] as const satisfies readonly Declaration[];

/**
 * The wording the declarations were accepted under: the cahier des charges of
 * 2026-08-02, until the founders deliver the final text. A new version means a
 * new value here, and a re-acceptance flow comes with it.
 */
export const DECLARATIONS_VERSION = "cdc-2026-08-02";

// ---------------------------------------------------------------------------
// What each profession provides at step 3
// ---------------------------------------------------------------------------

export type Requirement = {
  /** The document kinds she must upload, one to three files each. */
  documents: readonly Exclude<DocumentKind, "photo">[];
  /** Whether she types her INAMI number. */
  inami: boolean;
};

export const REQUIREMENTS: Record<Profession, Requirement> = {
  sage_femme: { documents: ["diplome"], inami: true },
  infirmiere_neonatologie: { documents: ["diplome"], inami: true },
  puericultrice: { documents: ["diplome"], inami: false },
  etudiante_sage_femme: { documents: ["attestation_inscription"], inami: false },
};

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

export const RATE_MIN = 100;
export const RATE_MAX = 300;
export const BIO_MAX = 500;
export const COMMUNES_MIN = 1;
export const COMMUNES_MAX = 50;
export const FILES_PER_DOCUMENT_MAX = 3;

export const MB = 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 10 * MB;
export const PHOTO_MAX_BYTES = 5 * MB;

export const DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type FileType = (typeof DOCUMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Parsing and checking what she typed
// ---------------------------------------------------------------------------

export type FieldError =
  | "requis"
  | "profession"
  | "etudiantesFermees"
  | "communesMin"
  | "communesMax"
  | "commune"
  | "tarif"
  | "experience"
  | "bioLongue"
  | "specialisation"
  | "photo"
  | "inami"
  | "document"
  | "declarations";

export type ProfileField =
  | "profession"
  | "specialisations"
  | "communes"
  | "tarif"
  | "experience"
  | "bio"
  | "photo";

export type FieldErrors<F extends string> = Partial<Record<F, FieldError>>;

export function isProfession(value: unknown): value is Profession {
  return (PROFESSIONS as readonly unknown[]).includes(value);
}

export function isExperience(value: unknown): value is Experience {
  return (EXPERIENCES as readonly unknown[]).includes(value);
}

export function isSpecialisation(value: unknown): value is Specialisation {
  return (SPECIALISATIONS as readonly unknown[]).includes(value);
}

/**
 * A night rate in whole euros from 100 to 300, or an error. "150", " 150 " and
 * "150,00" are 150; "150,5", "99", "301" and "abc" are refused (D-4).
 */
export function parseRate(raw: string): { ok: true; value: number } | { ok: false } {
  const text = raw.trim().replace(/[,.]0+$/, "");
  if (!/^\d+$/.test(text)) return { ok: false };
  const value = Number(text);
  return value >= RATE_MIN && value <= RATE_MAX ? { ok: true, value } : { ok: false };
}

/** Eleven digits, separators dropped, or null (no checksum: the founders verify it). */
export function normalizeInami(raw: string): string | null {
  const digits = raw.replace(/[\s.\-/]/g, "");
  return /^\d{11}$/.test(digits) ? digits : null;
}

/** The step-2 answers as they are kept, each one optional until the step is complete. */
export type ProfileDraft = {
  profession: Profession | null;
  specialisations: Specialisation[];
  communes: string[];
  nightRateEur: number | null;
  experience: Experience | null;
  bio: string | null;
};

export type ProfileInput = {
  profession: string;
  specialisations: string[];
  communes: string[];
  tarif: string;
  experience: string;
  bio: string;
};

/**
 * Step 2's form, checked field by field. Every well-formed answer is kept in
 * `values` even when another field is wrong, so "Enregistrer et reprendre plus
 * tard" saves what is valid (D-21); an empty field is simply not answered yet.
 *
 * - `studentsAdmitted` is the founders' switch; `currentProfession` lets a file
 *   that already carries the student option keep it when the switch is off.
 * - `isKnownCommune` checks a NIS code against the register.
 */
export function checkProfile(
  input: ProfileInput,
  context: {
    studentsAdmitted: boolean;
    currentProfession: Profession | null;
    isKnownCommune: (nis: string) => boolean;
  },
): { values: ProfileDraft; errors: FieldErrors<ProfileField> } {
  const errors: FieldErrors<ProfileField> = {};
  const values: ProfileDraft = {
    profession: null,
    specialisations: [],
    communes: [],
    nightRateEur: null,
    experience: null,
    bio: null,
  };

  const profession = input.profession.trim();
  if (profession) {
    if (!isProfession(profession)) errors.profession = "profession";
    else if (
      profession === STUDENT &&
      !context.studentsAdmitted &&
      context.currentProfession !== STUDENT
    ) {
      errors.profession = "etudiantesFermees";
    } else values.profession = profession;
  }

  const specialisations = [...new Set(input.specialisations.map((s) => s.trim()).filter(Boolean))];
  if (specialisations.every(isSpecialisation)) values.specialisations = specialisations;
  else errors.specialisations = "specialisation";

  const communes = [...new Set(input.communes.map((c) => c.trim()).filter(Boolean))];
  if (!communes.every(context.isKnownCommune)) errors.communes = "commune";
  else if (communes.length > COMMUNES_MAX) errors.communes = "communesMax";
  else values.communes = communes;

  if (input.tarif.trim()) {
    const rate = parseRate(input.tarif);
    if (rate.ok) values.nightRateEur = rate.value;
    else errors.tarif = "tarif";
  }

  const experience = input.experience.trim();
  if (experience) {
    if (isExperience(experience)) values.experience = experience;
    else errors.experience = "experience";
  }

  const bio = input.bio.trim();
  if (bio) {
    if (bio.length > BIO_MAX) errors.bio = "bioLongue";
    else values.bio = bio;
  }

  return { values, errors };
}

/** What step 2 still lacks before "Continuer" (spécialisations are optional). */
export function missingProfile(
  draft: ProfileDraft,
  hasPhoto: boolean,
): FieldErrors<ProfileField> {
  const missing: FieldErrors<ProfileField> = {};
  if (!draft.profession) missing.profession = "requis";
  if (draft.communes.length < COMMUNES_MIN) missing.communes = "communesMin";
  if (draft.nightRateEur === null) missing.tarif = "requis";
  if (!draft.experience) missing.experience = "requis";
  if (!draft.bio) missing.bio = "requis";
  if (!hasPhoto) missing.photo = "photo";
  return missing;
}

// ---------------------------------------------------------------------------
// The steps
// ---------------------------------------------------------------------------

/** Steps 2 to 4; step 1, the account, is always done by the time she is here. */
export type Step = "profil" | "justificatifs" | "declarations";
export const STEPS: readonly Step[] = ["profil", "justificatifs", "declarations"];

/** What the rules need to know about a file, whatever stores it. */
export type FileState = {
  status: ProfileStatus;
  draft: ProfileDraft;
  inamiNumber: string | null;
  /** How many files of each kind she has uploaded. */
  files: Partial<Record<DocumentKind, number>>;
};

export function isProfileComplete(file: FileState): boolean {
  return Object.keys(missingProfile(file.draft, (file.files.photo ?? 0) > 0)).length === 0;
}

export type DocumentsField = "inami" | Exclude<DocumentKind, "photo">;

/** What step 3 still lacks for her profession (nothing to say before one is chosen). */
export function missingDocuments(file: FileState): FieldErrors<DocumentsField> {
  const missing: FieldErrors<DocumentsField> = {};
  if (!file.draft.profession) return missing;
  const requirement = REQUIREMENTS[file.draft.profession];
  for (const kind of requirement.documents) {
    if ((file.files[kind] ?? 0) === 0) missing[kind] = "document";
  }
  if (requirement.inami && !file.inamiNumber) missing.inami = "inami";
  return missing;
}

export function areDocumentsComplete(file: FileState): boolean {
  return (
    file.draft.profession !== null && Object.keys(missingDocuments(file)).length === 0
  );
}

/** The first step not yet complete: where `/espace/professionnelle` sends a draft. */
export function firstIncompleteStep(file: FileState): Step {
  if (!isProfileComplete(file)) return "profil";
  if (!areDocumentsComplete(file)) return "justificatifs";
  return "declarations";
}

/** A step opens only once every step before it is complete. */
export function canOpenStep(file: FileState, step: Step): boolean {
  return STEPS.indexOf(step) <= STEPS.indexOf(firstIncompleteStep(file));
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

/** Submitting the declarations: only a complete draft goes to review. */
export function canSubmit(file: FileState, ticked: readonly string[]): boolean {
  return (
    file.status === "brouillon" &&
    isProfileComplete(file) &&
    areDocumentsComplete(file) &&
    DECLARATIONS.every((d) => ticked.includes(d))
  );
}

/**
 * "Renvoyer mon dossier" (verification-back-office, D-50): once she has
 * answered a complément, her complete file goes back to the founders. It keeps
 * its `submitted_at`, so its place in the queue, and she does not tick the
 * declarations again.
 */
export function canResend(file: FileState): boolean {
  return file.status === "complement_demande" && isProfileComplete(file) && areDocumentsComplete(file);
}

/** Whether she may change her file at all in this state. */
export function isEditable(status: ProfileStatus): boolean {
  return status !== "refuse";
}

/** A change she makes on a submitted file. */
export type Change = "profession" | "documents" | "details";

/**
 * Whether a change needs the founders to look again. On a validated file a new
 * profession or any document added, replaced or removed does; everything else
 * (spécialisations, zone, rate, experience, bio, photo) applies at once. While
 * the file is still waiting (or a complement was asked), nothing does: it is
 * already under review and keeps its `submitted_at`.
 */
export function changeNeedsReview(status: ProfileStatus, change: Change): boolean {
  return status === "valide" && change !== "details";
}

/**
 * The state a submitted file goes to once she confirms she wants a new
 * profession or new documents: back to the draft, so she passes through the
 * steps again, ticks the five declarations afresh and resubmits, which sets a
 * new `submitted_at`. Until then the profile is hidden, as the confirmation
 * dialog tells her. On a waiting file she needs it only for a profession whose
 * documents she has not yet provided; every other edit keeps the file waiting.
 */
export function reopenedStatus(status: ProfileStatus): ProfileStatus {
  return status === "valide" || status === "en_attente" || status === "complement_demande"
    ? "brouillon"
    : status;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** Which kinds she may upload now: her photo, and her profession's documents. */
export function allowedKinds(profession: Profession | null): DocumentKind[] {
  return ["photo", ...(profession ? REQUIREMENTS[profession].documents : [])];
}

export type UploadError = "type" | "taille" | "nombre" | "genre";

/** Checks a file she is about to upload, before any byte leaves her browser. */
export function checkUpload(
  kind: DocumentKind,
  contentType: string,
  size: number,
  context: { profession: Profession | null; existing: number },
): UploadError | null {
  if (!allowedKinds(context.profession).includes(kind)) return "genre";
  const photo = kind === "photo";
  const types: readonly string[] = photo ? PHOTO_TYPES : DOCUMENT_TYPES;
  if (!types.includes(contentType)) return "type";
  if (!Number.isInteger(size) || size <= 0 || size > (photo ? PHOTO_MAX_BYTES : DOCUMENT_MAX_BYTES)) {
    return "taille";
  }
  // The photo replaces the one she has; documents stop at three per kind.
  if (!photo && context.existing >= FILES_PER_DOCUMENT_MAX) return "nombre";
  return null;
}

/** The first bytes each accepted type starts with. */
export function sniffType(head: Uint8Array): FileType | null {
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf"; // %PDF-
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  // RIFF....WEBP
  if (starts(0x52, 0x49, 0x46, 0x46) && [0x57, 0x45, 0x42, 0x50].every((b, i) => head[8 + i] === b)) {
    return "image/webp";
  }
  return null;
}

/**
 * Whether an uploaded object is what she declared: its size within the limit
 * and its first bytes those of the declared type. A renamed executable fails.
 */
export function uploadMatches(
  kind: DocumentKind,
  declaredType: string,
  size: number,
  head: Uint8Array,
): boolean {
  const limit = kind === "photo" ? PHOTO_MAX_BYTES : DOCUMENT_MAX_BYTES;
  return size > 0 && size <= limit && sniffType(head) === declaredType;
}

/** Who may read a file: its owner and the admins, nobody else. */
export function canReadFile(
  ownerUserId: string,
  viewer: { id: string; role: "parent" | "professionnel" | "admin" } | null,
): boolean {
  if (!viewer) return false;
  return viewer.role === "admin" || viewer.id === ownerUserId;
}
