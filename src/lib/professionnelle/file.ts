import "server-only";

import { asc, eq } from "drizzle-orm";

import {
  db,
  professionalCommunes,
  professionalDeclarations,
  professionalDocuments,
  professionalProfiles,
  type DocumentKind,
  type ProfessionalDocument,
  type ProfessionalProfile,
} from "@/db";

import { isSpecialisation, type FileState } from "./rules";

/**
 * A professional's whole file in one read: her profile row (created on first
 * visit), the communes she serves, her files and the declarations she accepted.
 * `state` is what the pure rules in ./rules need.
 */
export type ProfessionalFile = {
  profile: ProfessionalProfile;
  communes: string[];
  documents: ProfessionalDocument[];
  declarations: { declaration: string; version: string; acceptedAt: Date }[];
  state: FileState;
};

/** Her profile row, created in `brouillon` the first time she needs one. */
export async function ensureProfile(userId: string): Promise<ProfessionalProfile> {
  const [existing] = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  if (existing) return existing;

  // Two tabs racing: the unique user_id keeps one row, and the loser reads it.
  await db.insert(professionalProfiles).values({ userId }).onConflictDoNothing();
  const [created] = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return created;
}

export async function loadFile(userId: string): Promise<ProfessionalFile> {
  const profile = await ensureProfile(userId);

  const [communes, documents, declarations] = await Promise.all([
    db
      .select({ ins: professionalCommunes.communeIns })
      .from(professionalCommunes)
      .where(eq(professionalCommunes.profileId, profile.id)),
    db
      .select()
      .from(professionalDocuments)
      .where(eq(professionalDocuments.profileId, profile.id))
      .orderBy(asc(professionalDocuments.uploadedAt)),
    db
      .select({
        declaration: professionalDeclarations.declaration,
        version: professionalDeclarations.version,
        acceptedAt: professionalDeclarations.acceptedAt,
      })
      .from(professionalDeclarations)
      .where(eq(professionalDeclarations.profileId, profile.id))
      .orderBy(asc(professionalDeclarations.acceptedAt)),
  ]);

  const files: Partial<Record<DocumentKind, number>> = {};
  for (const doc of documents) files[doc.kind] = (files[doc.kind] ?? 0) + 1;

  const codes = communes.map((c) => c.ins);
  return {
    profile,
    communes: codes,
    documents,
    declarations,
    state: {
      status: profile.status,
      draft: {
        profession: profile.profession,
        specialisations: profile.specialisations.filter(isSpecialisation),
        communes: codes,
        nightRateEur: profile.nightRateEur,
        experience: profile.experience,
        bio: profile.bio,
      },
      inamiNumber: profile.inamiNumber,
      files,
    },
  };
}
