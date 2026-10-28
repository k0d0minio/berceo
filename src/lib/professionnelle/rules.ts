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
  "etudiante_sage_femme_3e",
  "etudiante_sage_femme_4e",
] as const satisfies readonly Profession[];

/** The two student years, which the founders' switch gates together (D-7). */
export const STUDENTS = [
  "etudiante_sage_femme_3e",
  "etudiante_sage_femme_4e",
] as const satisfies readonly Profession[];

export function isStudent(profession: Profession | null): boolean {
  return (STUDENTS as readonly (Profession | null)[]).includes(profession);
}

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
  /**
   * Whether the INAMI field is shown. It is never required: not every midwife
   * has a number (onboarding-retour-1). A filled field still needs eleven digits.
   */
  inami: "optional" | false;
};

export const REQUIREMENTS: Record<Profession, Requirement> = {
  sage_femme: { documents: ["diplome"], inami: "optional" },
  infirmiere_neonatologie: { documents: ["diplome"], inami: "optional" },
  puericultrice: { documents: ["diplome"], inami: false },
  etudiante_sage_femme_3e: { documents: ["attestation_inscription"], inami: false },
  etudiante_sage_femme_4e: { documents: ["attestation_inscription"], inami: false },
};

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

/** The night rate's floor, with no ceiling (onboarding-retour-1, Jamie 2026-10-23). */
export const RATE_MIN = 130;
/** The extra hour's floor: any whole euro (onboarding-retour-1). */
export const EXTRA_HOUR_RATE_MIN = 1;
/**
 * The largest rate the database holds with its fee: the fee in cents is the
 * rate × 3, in a Postgres integer. A guard against a typing error, not a ceiling.
 */
export const RATE_STORABLE_MAX = Math.floor(2_147_483_647 / 3);
export const BIO_MAX = 500;
/** « Formations complémentaires », free text: hundreds of trainings exist (onboarding-retour-1). */
export const FORMATIONS_MAX = 300;
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
  | "tarifHeure"
  | "bioLongue"
  | "formationsLongues"
  | "photo"
  | "inami"
  | "document"
  | "declarations";

export type ProfileField =
  | "profession"
  | "formations"
  | "communes"
  | "tarif"
  | "tarifHeure"
  | "bio"
  | "photo";

export type FieldErrors<F extends string> = Partial<Record<F, FieldError>>;

export function isProfession(value: unknown): value is Profession {
  return (PROFESSIONS as readonly unknown[]).includes(value);
}

/** Whole euros from `min`, or an error. "150", " 150 " and "150,00" are 150; "150,5" and "abc" are refused. */
function parseWholeEuros(raw: string, min: number): { ok: true; value: number } | { ok: false } {
  const text = raw.trim().replace(/[,.]0+$/, "");
  if (!/^\d+$/.test(text)) return { ok: false };
  const value = Number(text);
  return value >= min && value <= RATE_STORABLE_MAX ? { ok: true, value } : { ok: false };
}

/** A night rate in whole euros from 130, with no ceiling: "129" is refused, "450" accepted. */
export function parseRate(raw: string): { ok: true; value: number } | { ok: false } {
  return parseWholeEuros(raw, RATE_MIN);
}

/** The rate of an extra hour in whole euros from 1: "0" is refused. */
export function parseExtraHourRate(raw: string): { ok: true; value: number } | { ok: false } {
  return parseWholeEuros(raw, EXTRA_HOUR_RATE_MIN);
}

/** Eleven digits, separators dropped, or null (no checksum: the founders verify it). */
export function normalizeInami(raw: string): string | null {
  const digits = raw.replace(/[\s.\-/]/g, "");
  return /^\d{11}$/.test(digits) ? digits : null;
}

/** The step-2 answers as they are kept, each one optional until the step is complete. */
export type ProfileDraft = {
  profession: Profession | null;
  formationsComplementaires: string | null;
  communes: string[];
  nightRateEur: number | null;
  extraHourRateEur: number | null;
  bio: string | null;
};

export type ProfileInput = {
  profession: string;
  formations: string;
  communes: string[];
  tarif: string;
  tarifHeure: string;
  bio: string;
};

/**
 * Step 2's form, checked field by field. Every well-formed answer is kept in
 * `values` even when another field is wrong, so "Enregistrer et reprendre plus
 * tard" saves what is valid (D-21); an empty field is simply not answered yet.
 *
 * - `studentsAdmitted` is the founders' switch; `currentProfession` lets a file
 *   that already carries a student year keep either year when the switch is off.
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
    formationsComplementaires: null,
    communes: [],
    nightRateEur: null,
    extraHourRateEur: null,
    bio: null,
  };

  const profession = input.profession.trim();
  if (profession) {
    if (!isProfession(profession)) errors.profession = "profession";
    else if (
      isStudent(profession) &&
      !context.studentsAdmitted &&
      !isStudent(context.currentProfession)
    ) {
      errors.profession = "etudiantesFermees";
    } else values.profession = profession;
  }

  const formations = input.formations.trim();
  if (formations) {
    if (formations.length > FORMATIONS_MAX) errors.formations = "formationsLongues";
    else values.formationsComplementaires = formations;
  }

  const communes = [...new Set(input.communes.map((c) => c.trim()).filter(Boolean))];
  if (!communes.every(context.isKnownCommune)) errors.communes = "commune";
  else if (communes.length > COMMUNES_MAX) errors.communes = "communesMax";
  else values.communes = communes;

  if (input.tarif.trim()) {
    const rate = parseRate(input.tarif);
    if (rate.ok) values.nightRateEur = rate.value;
    else errors.tarif = "tarif";
  }

  if (input.tarifHeure.trim()) {
    const rate = parseExtraHourRate(input.tarifHeure);
    if (rate.ok) values.extraHourRateEur = rate.value;
    else errors.tarifHeure = "tarifHeure";
  }

  const bio = input.bio.trim();
  if (bio) {
    if (bio.length > BIO_MAX) errors.bio = "bioLongue";
    else values.bio = bio;
  }

  return { values, errors };
}

/**
 * What step 2 still lacks before "Continuer" (the trainings are optional). A
 * file validated before the extra hour's rate existed lacks it too: her next
 * save asks for it, and her profile stays validated meanwhile.
 */
export function missingProfile(
  draft: ProfileDraft,
  hasPhoto: boolean,
): FieldErrors<ProfileField> {
  const missing: FieldErrors<ProfileField> = {};
  if (!draft.profession) missing.profession = "requis";
  if (draft.communes.length < COMMUNES_MIN) missing.communes = "communesMin";
  if (draft.nightRateEur === null) missing.tarif = "requis";
  if (draft.extraHourRateEur === null) missing.tarifHeure = "requis";
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

/**
 * What step 3 still lacks for her profession (nothing to say before one is
 * chosen). The INAMI number is optional, so an empty field lacks nothing.
 */
export function missingDocuments(file: FileState): FieldErrors<DocumentsField> {
  const missing: FieldErrors<DocumentsField> = {};
  if (!file.draft.profession) return missing;
  for (const kind of REQUIREMENTS[file.draft.profession].documents) {
    if ((file.files[kind] ?? 0) === 0) missing[kind] = "document";
  }
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
 * (trainings, zone, rate, bio, photo) applies at once. While
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

/**
 * How recording an upload ended, read under the profile's lock
 * (onboarding-upload-limit-race): recorded, refused because the kind already
 * holds three files, refused because another confirm recorded the same key
 * first, or failed.
 */
export type RecordOutcome = "enregistre" | "limite" | "doublon" | "echec";

/** The outcome of the guarded insert: whether it wrote, and whether the key was already recorded. */
export function recordOutcome(result: { inserted: boolean; keyRecorded: boolean }): RecordOutcome {
  if (result.inserted) return "enregistre";
  return result.keyRecorded ? "doublon" : "limite";
}

/**
 * What a recording answers, and whether its uploaded object is deleted. A key
 * already recorded keeps its object: it belongs to the row that won.
 */
export function recordAnswer(outcome: RecordOutcome): {
  error: "nombre" | "echec" | null;
  discard: boolean;
} {
  switch (outcome) {
    case "enregistre":
      return { error: null, discard: false };
    case "limite":
      return { error: "nombre", discard: true };
    case "doublon":
      return { error: "echec", discard: false };
    case "echec":
      return { error: "echec", discard: true };
  }
}

/**
 * Whether a recording replaces her other photos: her photo is one file, so a
 * photo that was recorded removes every other; a refused or duplicate one, and
 * any document, removes nothing. `recordUpload` holds the same rule in its SQL.
 */
export function replacesPhotos(kind: DocumentKind, outcome: RecordOutcome): boolean {
  return kind === "photo" && outcome === "enregistre";
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

/**
 * Who may read a file: its owner and the admins; and, for her photo only, a
 * signed-in family once her profile is validated (candidature-et-reservation,
 * D-75). Her documents stay the owner's and the admins', whoever asks.
 */
export function canReadFile(
  ownerUserId: string,
  viewer: { id: string; role: "parent" | "professionnel" | "admin" } | null,
  file?: { kind: DocumentKind; profileStatus: ProfileStatus },
): boolean {
  if (!viewer) return false;
  if (viewer.role === "admin" || viewer.id === ownerUserId) return true;
  return viewer.role === "parent" && file?.kind === "photo" && file.profileStatus === "valide";
}
