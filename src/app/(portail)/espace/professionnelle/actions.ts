"use server";

import { and, eq, inArray } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { redirect } from "next/navigation";

import {
  db,
  professionalCommunes,
  professionalDeclarations,
  professionalDocuments,
  professionalProfiles,
  type DocumentKind,
  type User,
} from "@/db";
import { currentUser } from "@/lib/auth/current-user";
import { isKnownCommune } from "@/lib/communes";
import { deleteObject, inspectUpload, newStorageKey, presignUpload } from "@/lib/documents/storage";
import { loadFile, type ProfessionalFile } from "@/lib/professionnelle/file";
import {
  DECLARATIONS,
  DECLARATIONS_VERSION,
  REQUIREMENTS,
  canSubmit,
  changeNeedsReview,
  checkProfile,
  checkUpload,
  isEditable,
  missingDocuments,
  missingProfile,
  normalizeInami,
  reopenedStatus,
  uploadMatches,
  type DocumentsField,
  type FieldErrors,
  type ProfileField,
  type UploadError,
} from "@/lib/professionnelle/rules";
import { studentsAdmitted } from "@/lib/settings";

/*
 * The professional's file: steps 2 to 4 of the onboarding and the page of her
 * submitted file. Every argument is checked here at runtime, bound ones
 * included (Learned rules): who is asking, what she may change in her state,
 * and every value. Messages are catalogue keys (src/content/professionnelle.ts).
 */

export type FormMessage = "enregistre" | "verrouille" | "ferme" | "generique" | "declarations";

const ONBOARDING = "/espace/professionnelle/inscription";
const SPACE = "/espace/professionnelle";

/** Only a signed-in, verified professional reaches her file. */
async function professional(): Promise<User | null> {
  const who = await currentUser();
  if (who.status !== "ok" || who.user.role !== "professionnel") {
    console.error("[onboarding] action refused: not a professional", { status: who.status });
    return null;
  }
  return who.user;
}

/** The button a form was sent with, checked against the three allowed intents. */
type Intent = "continuer" | "plus-tard" | "enregistrer";
function isIntent(value: unknown): value is Intent {
  return value === "continuer" || value === "plus-tard" || value === "enregistrer";
}

/** Deletes files (rows, then objects) the file no longer needs. */
async function removeDocuments(file: ProfessionalFile, kinds: DocumentKind[]): Promise<void> {
  const doomed = file.documents.filter((d) => kinds.includes(d.kind));
  if (doomed.length === 0) return;
  await db.delete(professionalDocuments).where(
    inArray(
      professionalDocuments.id,
      doomed.map((d) => d.id),
    ),
  );
  await Promise.all(doomed.map((d) => deleteObject(d.storageKey)));
}

// ---------------------------------------------------------------------------
// Step 2 — the profile
// ---------------------------------------------------------------------------

export type ProfileState = {
  errors?: FieldErrors<ProfileField>;
  message?: FormMessage;
  /** What was typed, so a refused form keeps it. */
  values?: {
    profession: string;
    specialisations: string[];
    communes: string[];
    tarif: string;
    experience: string;
    bio: string;
  };
};

export async function saveProfile(_previous: ProfileState, form: FormData): Promise<ProfileState> {
  // The button she pressed: "continuer", "plus-tard" or, on her file's page, "enregistrer".
  const intent = form.get("intent");
  if (!isIntent(intent)) return { message: "generique" };
  const user = await professional();
  if (!user) return { message: "generique" };

  const file = await loadFile(user.id);
  const { profile } = file;
  if (!isEditable(profile.status)) return { message: "ferme" };

  const input = {
    profession: String(form.get("profession") ?? ""),
    specialisations: form.getAll("specialisations").map(String),
    communes: form.getAll("communes").map(String),
    tarif: String(form.get("tarif") ?? ""),
    experience: String(form.get("experience") ?? ""),
    bio: String(form.get("bio") ?? ""),
  };

  const { values, errors } = checkProfile(input, {
    studentsAdmitted: await studentsAdmitted(),
    currentProfession: profile.profession,
    isKnownCommune,
  });

  const professionChanges = values.profession !== profile.profession && !errors.profession;
  // A validated file changes profession only after she has reopened it.
  if (professionChanges && changeNeedsReview(profile.status, "profession")) {
    return { message: "verrouille", values: input };
  }

  // A submitted file stays complete: it is saved whole or not at all.
  const submitted = profile.status !== "brouillon";
  const missing = missingProfile(values, (file.state.files.photo ?? 0) > 0);
  if (submitted || intent === "continuer") {
    const all = { ...missing, ...errors };
    if (Object.keys(all).length > 0) return { errors: all, values: input };
  }

  // Every valid answer is kept; a field with an error keeps what it had.
  const next = {
    profession: errors.profession ? profile.profession : values.profession,
    specialisations: errors.specialisations ? profile.specialisations : values.specialisations,
    experience: errors.experience ? profile.experience : values.experience,
    nightRateEur: errors.tarif ? profile.nightRateEur : values.nightRateEur,
    bio: errors.bio ? profile.bio : values.bio,
    updatedAt: new Date(),
  };

  // The profile and its communes move together: Neon runs a batch as one transaction.
  const writes: BatchItem<"pg">[] = [
    db.update(professionalProfiles).set(next).where(eq(professionalProfiles.id, profile.id)),
  ];
  if (!errors.communes) {
    writes.push(db.delete(professionalCommunes).where(eq(professionalCommunes.profileId, profile.id)));
    if (values.communes.length > 0) {
      writes.push(
        db
          .insert(professionalCommunes)
          .values(values.communes.map((communeIns) => ({ profileId: profile.id, communeIns }))),
      );
    }
  }

  try {
    await db.batch(writes as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

    // A new profession drops the documents and the INAMI number it no longer asks for.
    if (professionChanges) {
      const required = next.profession ? REQUIREMENTS[next.profession] : null;
      const stale = (["diplome", "attestation_inscription"] as const).filter(
        (kind) => !required?.documents.includes(kind),
      );
      await removeDocuments(file, stale);
      if (!required?.inami && profile.inamiNumber) {
        await db
          .update(professionalProfiles)
          .set({ inamiNumber: null })
          .where(eq(professionalProfiles.id, profile.id));
      }
    }
  } catch (error) {
    console.error("[onboarding] profile not saved", { profileId: profile.id, error });
    return { message: "generique", values: input };
  }

  if (intent === "continuer") redirect(`${ONBOARDING}/justificatifs`);
  return { message: "enregistre", errors, values: input };
}

// ---------------------------------------------------------------------------
// Files — the photo and step 3's documents
// ---------------------------------------------------------------------------

const KINDS: readonly DocumentKind[] = ["diplome", "attestation_inscription", "photo"];

export type UploadTicket =
  | { ok: true; url: string; key: string }
  | { ok: false; error: UploadError | "verrouille" | "ferme" | "echec" };

/** Step one of an upload: a presigned PUT for a file that passes the checks. */
export async function requestUpload(request: {
  kind: DocumentKind;
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  const user = await professional();
  if (!user || !request) return { ok: false, error: "echec" };
  const { kind, contentType, size } = request;
  if (!KINDS.includes(kind) || typeof contentType !== "string" || typeof size !== "number") {
    return { ok: false, error: "echec" };
  }

  const file = await loadFile(user.id);
  const { profile } = file;
  if (!isEditable(profile.status)) return { ok: false, error: "ferme" };
  if (kind !== "photo" && changeNeedsReview(profile.status, "documents")) {
    return { ok: false, error: "verrouille" };
  }

  const refused = checkUpload(kind, contentType, size, {
    profession: profile.profession,
    existing: file.state.files[kind] ?? 0,
  });
  if (refused) return { ok: false, error: refused };

  const key = newStorageKey(profile.id);
  try {
    return { ok: true, url: await presignUpload(key, contentType, size), key };
  } catch (error) {
    console.error("[onboarding] upload not presigned", { profileId: profile.id, error });
    return { ok: false, error: "echec" };
  }
}

export type UploadResult =
  | { ok: true }
  | { ok: false; error: UploadError | "contenu" | "verrouille" | "ferme" | "echec" | "dernier" };

/**
 * Step two: the browser has PUT the file. The server checks what actually
 * arrived (size, and the first bytes against the declared type) and only then
 * records it; anything else is deleted from the bucket.
 */
export async function confirmUpload(request: {
  kind: DocumentKind;
  key: string;
  contentType: string;
  fileName: string;
}): Promise<UploadResult> {
  const user = await professional();
  if (!user || !request) return { ok: false, error: "echec" };
  const { kind, key, contentType, fileName } = request;
  if (
    !KINDS.includes(kind) ||
    typeof key !== "string" ||
    typeof contentType !== "string" ||
    typeof fileName !== "string"
  ) {
    return { ok: false, error: "echec" };
  }

  const file = await loadFile(user.id);
  const { profile } = file;
  // Only a key minted for her own profile, and only once.
  if (!key.startsWith(`profils/${profile.id}/`) || file.documents.some((d) => d.storageKey === key)) {
    return { ok: false, error: "echec" };
  }

  const discard = async (error: "contenu" | "verrouille" | "ferme" | "echec" | UploadError) => {
    await deleteObject(key).catch((e) => console.error("[onboarding] upload not discarded", { key, e }));
    return { ok: false as const, error };
  };

  if (!isEditable(profile.status)) return discard("ferme");
  if (kind !== "photo" && changeNeedsReview(profile.status, "documents")) return discard("verrouille");

  const uploaded = await inspectUpload(key).catch(() => null);
  if (!uploaded) return discard("echec");

  const refused = checkUpload(kind, contentType, uploaded.size, {
    profession: profile.profession,
    existing: file.state.files[kind] ?? 0,
  });
  if (refused) return discard(refused);
  if (!uploadMatches(kind, contentType, uploaded.size, uploaded.head)) return discard("contenu");

  try {
    await db.insert(professionalDocuments).values({
      profileId: profile.id,
      kind,
      storageKey: key,
      fileName: fileName.slice(0, 200) || "fichier",
      contentType,
      sizeBytes: uploaded.size,
    });
    // Her photo is one file: the new one replaces the old at once.
    if (kind === "photo") await removeDocuments(file, ["photo"]);
    await db
      .update(professionalProfiles)
      .set({ updatedAt: new Date() })
      .where(eq(professionalProfiles.id, profile.id));
  } catch (error) {
    console.error("[onboarding] upload not recorded", { profileId: profile.id, error });
    return discard("echec");
  }
  return { ok: true };
}

/** Removes one of her files: its row, then its object, at once. */
export async function removeFile(id: string): Promise<UploadResult> {
  const user = await professional();
  if (!user || typeof id !== "string") return { ok: false, error: "echec" };

  const file = await loadFile(user.id);
  const doc = file.documents.find((d) => d.id === id);
  if (!doc) return { ok: false, error: "echec" };
  if (!isEditable(file.profile.status)) return { ok: false, error: "ferme" };
  if (doc.kind !== "photo" && changeNeedsReview(file.profile.status, "documents")) {
    return { ok: false, error: "verrouille" };
  }
  // A submitted file stays complete: the new file goes in before the last one comes out.
  if (file.profile.status !== "brouillon" && (file.state.files[doc.kind] ?? 0) <= 1) {
    return { ok: false, error: "dernier" };
  }

  try {
    await db
      .delete(professionalDocuments)
      .where(and(eq(professionalDocuments.id, doc.id), eq(professionalDocuments.profileId, file.profile.id)));
    await deleteObject(doc.storageKey);
  } catch (error) {
    console.error("[onboarding] file not removed", { id, error });
    return { ok: false, error: "echec" };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Step 3 — the INAMI number and moving on
// ---------------------------------------------------------------------------

export type DocumentsState = {
  errors?: FieldErrors<DocumentsField>;
  message?: FormMessage;
  values?: { inami: string };
};

export async function saveDocuments(_previous: DocumentsState, form: FormData): Promise<DocumentsState> {
  const intent = form.get("intent");
  if (!isIntent(intent)) return { message: "generique" };
  const user = await professional();
  if (!user) return { message: "generique" };

  const file = await loadFile(user.id);
  const { profile } = file;
  if (!isEditable(profile.status)) return { message: "ferme" };

  const raw = String(form.get("inami") ?? "");
  const values = { inami: raw };
  const required = profile.profession ? REQUIREMENTS[profile.profession].inami : false;
  const inami = raw.trim() ? normalizeInami(raw) : null;

  if (raw.trim() && !inami) return { errors: { inami: "inami" }, values };
  if (inami !== profile.inamiNumber && changeNeedsReview(profile.status, "documents")) {
    return { message: "verrouille", values };
  }

  const nextState = { ...file.state, inamiNumber: required ? inami : null };
  const missing = missingDocuments(nextState);
  const submitted = profile.status !== "brouillon";
  if ((submitted || intent === "continuer") && Object.keys(missing).length > 0) {
    return { errors: missing, values };
  }

  try {
    await db
      .update(professionalProfiles)
      .set({ inamiNumber: nextState.inamiNumber, updatedAt: new Date() })
      .where(eq(professionalProfiles.id, profile.id));
  } catch (error) {
    console.error("[onboarding] INAMI number not saved", { profileId: profile.id, error });
    return { message: "generique", values };
  }

  if (intent === "continuer") redirect(`${ONBOARDING}/declarations`);
  return { message: "enregistre", values };
}

// ---------------------------------------------------------------------------
// Step 4 — the declarations and the submission
// ---------------------------------------------------------------------------

export type DeclarationsState = { message?: FormMessage; ticked?: string[] };

export async function submitFile(
  _previous: DeclarationsState,
  form: FormData,
): Promise<DeclarationsState> {
  const user = await professional();
  if (!user) return { message: "generique" };

  const ticked = form.getAll("declarations").map(String);
  const file = await loadFile(user.id);
  if (!DECLARATIONS.every((d) => ticked.includes(d))) return { message: "declarations", ticked };
  if (!canSubmit(file.state, ticked)) return { message: "generique", ticked };

  const now = new Date();
  try {
    await db.batch([
      db.insert(professionalDeclarations).values(
        DECLARATIONS.map((declaration) => ({
          profileId: file.profile.id,
          declaration,
          version: DECLARATIONS_VERSION,
          acceptedAt: now,
        })),
      ),
      db
        .update(professionalProfiles)
        .set({ status: "en_attente", submittedAt: now, updatedAt: now })
        .where(and(eq(professionalProfiles.id, file.profile.id), eq(professionalProfiles.status, "brouillon"))),
    ]);
  } catch (error) {
    console.error("[onboarding] file not submitted", { profileId: file.profile.id, error });
    return { message: "generique", ticked };
  }

  redirect(`${SPACE}?envoye=1`);
}

// ---------------------------------------------------------------------------
// A validated file, reopened for a new profession or new documents
// ---------------------------------------------------------------------------

export async function reopenFile(): Promise<void> {
  const user = await professional();
  if (!user) redirect(SPACE);

  const file = await loadFile(user.id);
  const next = reopenedStatus(file.profile.status);
  if (next !== file.profile.status) {
    await db
      .update(professionalProfiles)
      .set({ status: next, updatedAt: new Date() })
      .where(and(eq(professionalProfiles.id, file.profile.id), eq(professionalProfiles.status, "valide")));
  }
  redirect(`${ONBOARDING}/profil`);
}
